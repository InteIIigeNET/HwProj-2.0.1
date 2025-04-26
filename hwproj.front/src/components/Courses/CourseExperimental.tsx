import * as React from "react";
import {
    FileInfoDTO,
    HomeworkTaskViewModel,
    HomeworkViewModel, Solution, StatisticsCourseMatesModel,
} from "@/api";
import {
    Button,
    Grid,
    Typography
} from "@mui/material";
import {FC, useEffect, useState} from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {Alert, Card, CardActions, Chip, Paper, Stack, Tooltip} from "@mui/material";
import {Link} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {getTip} from "../Common/HomeworkTags";
import FileInfoConverter from "components/Utils/FileInfoConverter";
import CourseHomeworkExperimental from "components/Homeworks/CourseHomeworkExperimental";
import CourseTaskExperimental from "../Tasks/CourseTaskExperimental";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    courseFilesInfo: FileInfoDTO[]
    studentSolutions: StatisticsCourseMatesModel[]
    isMentor: boolean
    isStudentAccepted: boolean
    userId: string
    selectedHomeworkId: number | undefined
    onHomeworkUpdate: (update: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] } & {
        isDeleted?: boolean
    }) => void
    onTaskUpdate: (update: { task: HomeworkTaskViewModel, isDeleted?: boolean }) => void
}

interface ICourseExperimentalState {
    initialEditMode: boolean,
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
    }
}

export const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const [hideDeferred, setHideDeferred] = useState<boolean>(false)

    const homeworks = props.homeworks.slice().reverse().filter(x => !hideDeferred || !x.isDeferred)
    const {isMentor, studentSolutions, isStudentAccepted, userId, selectedHomeworkId, courseFilesInfo} = props

    const [state, setState] = useState<ICourseExperimentalState>({
        initialEditMode: false,
        selectedItem: {id: undefined, isHomework: false},
    })

    useEffect(() => {
        const defaultHomeworkIndex = Math.max(selectedHomeworkId ? homeworks?.findIndex(x => x.id === selectedHomeworkId) : 0, 0)
        const defaultHomework = homeworks?.[defaultHomeworkIndex]
        setState((prevState) => ({
            ...prevState,
            selectedItem: {isHomework: true, id: defaultHomework?.id},
        }))
    }, [hideDeferred])

    const initialEditMode = state.initialEditMode
    const {id, isHomework} = state.selectedItem

    const renderDate = (date: Date) => {
        date = new Date(date)
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleString("ru-RU", options)
    }

    const renderTime = (date: Date) => {
        date = new Date(date)
        const options: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit"
        };
        return date.toLocaleString("ru-RU", options)
    }

    const clickedItemStyle = {
        backgroundColor: "ghostwhite",
        borderRadius: "10px",
        cursor: "pointer",
        border: "1px solid lightgrey"
    }

    const hoveredItemStyle = {...clickedItemStyle, border: "1px solid lightgrey"}

    const warningTimelineDotStyle = {
        borderWidth: 0,
        margin: 0,
        padding: "4px 0px",
    }

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? clickedItemStyle : {}

    const taskSolutionsMap = new Map<number, Solution[]>()

    if (!isMentor && isStudentAccepted) {
        studentSolutions
            .filter(t => t.id === userId)
            .flatMap(t => t.homeworks!)
            .flatMap(t => t.tasks!)
            .forEach(x => taskSolutionsMap.set(x.id!, x.solution!))
    }

    const showWarningsForEntity = (entity: HomeworkViewModel | HomeworkTaskViewModel) =>
        isMentor && (entity.publicationDateNotSet || entity.hasDeadline && entity.deadlineDateNotSet)

    const renderTaskStatus = (task: HomeworkTaskViewModel) => {
        if (taskSolutionsMap.has(task.id!)) {
            const solutions = taskSolutionsMap.get(task.id!)
            const {
                lastSolution,
                lastRatedSolution,
                color,
                solutionsDescription
            } = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, task.maxRating!)
            if (lastSolution != null) return (
                <Tooltip arrow disableInteractive enterDelay={1000}
                         title={<span style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
                    <Chip style={{backgroundColor: color, marginTop: '11.5px'}}
                          size={"small"}
                          label={lastRatedSolution == null ? "?" : lastRatedSolution.rating}/>
                </Tooltip>
            )
        }
        return showWarningsForEntity(task) ? (
            <Typography color={task.isDeferred ? "textSecondary" : "textPrimary"}>
                <TimelineDot variant="outlined" style={warningTimelineDotStyle}>⚠️</TimelineDot>
            </Typography>
        ) : <TimelineDot variant="outlined"/>
    }

    const onSelectedItemMount = () =>
        setState((prevState) => ({
            ...prevState,
            initialEditMode: false,
        }))

    const toEditHomework = (homework: HomeworkViewModel) =>
        setState({
            initialEditMode: true,
            selectedItem: {id: homework.id!, isHomework: true},
        })

    const getAlert = (entity: HomeworkViewModel | HomeworkTaskViewModel) => {
        if (entity.publicationDateNotSet) return (
            <Alert severity="warning">
                {"Не выставлена дата публикации"}
            </Alert>
        )

        if (isMentor && entity.hasDeadline && entity.deadlineDateNotSet) return (
            <Alert severity="warning">
                {"Не выставлена дата дедлайна"}
            </Alert>
        )

        if (entity.isDeferred) return (
            <Alert severity="info"
                   action={
                       <Button
                           color="inherit"
                           size="small"
                           onClick={() => setHideDeferred(true)}
                       >
                           Скрыть неопубликованное
                       </Button>}>
                {isHomework ? "Задание будет опубликовано " : "Задача будет опубликована "}
                {renderDate(entity.publicationDate!) + " " + renderTime(entity.publicationDate!)}
            </Alert>
        )
    }

    const selectedItemHomework = isHomework
        ? homeworks.find(x => x.id === id)!
        : homeworks.find(x => x.tasks!.some(t => t.id === id))!

    const selectedItem = isHomework
        ? selectedItemHomework
        : selectedItemHomework?.tasks!.find(x => x.id === id) as HomeworkTaskViewModel

    const [newTaskCounter, setNewTaskCounter] = useState<number>(-1)

    const addNewTask = (homeworkId: number) => {
        const id = newTaskCounter
        props.onTaskUpdate({task: {homeworkId: homeworkId, title: `Новая задача ${-id}`, id}})
        setState((prevState) => ({
            ...prevState,
            selectedItem: {
                isHomework: false,
                id: id
            }
        }))
        setNewTaskCounter(id - 1)
    }

    const renderHomework = (homework: HomeworkViewModel) => {
        const filesInfo = id ? FileInfoConverter.getHomeworkFilesInfo(courseFilesInfo, id) : []
        return homework && <Stack direction={"column"} spacing={2}>
            <Card style={{backgroundColor: "ghostwhite"}}>
                {getAlert(homework)}
                <CourseHomeworkExperimental
                    homeworkAndFilesInfo={{homework, filesInfo}}
                    isMentor={isMentor}
                    initialEditMode={initialEditMode}
                    onMount={onSelectedItemMount}
                    onUpdate={update => {
                        props.onHomeworkUpdate(update)
                        if (update.isDeleted)
                            setState((prevState) => ({
                                ...prevState,
                                selectedItem: {
                                    isHomework: true,
                                    id: undefined
                                }
                            }))
                    }}/>
                {isMentor && <CardActions>
                    <Button
                        onClick={() => addNewTask(homework.id!)}
                        size="small"
                        variant="text"
                        color="primary"
                    >
                        Добавить задачу
                    </Button>
                </CardActions>}
            </Card>
            <DotLottieReact
                src="https://lottie.host/5f96ad46-7c60-4d6f-9333-bbca189be66d/iNWo5peHOK.lottie"
                loop
                autoplay
            />
        </Stack>
    }

    const renderTask = (task: HomeworkTaskViewModel, homework: HomeworkViewModel) => {
        return task && <Card style={{backgroundColor: "ghostwhite"}} raised={task.id! < 0}>
            {getAlert(task)}
            <CourseTaskExperimental
                task={task}
                homework={homework!}
                isMentor={isMentor}
                initialEditMode={initialEditMode || task.id! < 0}
                onMount={onSelectedItemMount}
                onUpdate={update => {
                    props.onTaskUpdate(update)
                    if (update.isDeleted)
                        setState((prevState) => ({
                            ...prevState,
                            selectedItem: {
                                isHomework: true,
                                id: homework!.id
                            }
                        }))
                }}
                toEditHomework={() => toEditHomework(homework!)}/>
            {!props.isMentor && props.isStudentAccepted && < CardActions>
                <Link
                    style={{color: '#212529'}}
                    to={"/task/" + task.id!.toString()}>
                    <Button
                        style={{width: '150px'}}
                        size="small"
                        variant="contained"
                        color="primary"
                    >
                        Решения
                    </Button>
                </Link>
            </CardActions>}
        </Card>
    }

    return <Grid container direction={"row"} spacing={1}>
        <Grid item xs={12} sm={12} md={4} lg={4}>
            <Timeline style={{maxHeight: "75vh", overflow: 'auto', paddingLeft: 0, paddingRight: 8}}
                      sx={{
                          '&::-webkit-scrollbar': {
                              width: "3px",
                          },
                          '&::-webkit-scrollbar-track': {
                              backgroundColor: "ghostwhite",
                              borderRadius: "10px"
                          },
                          '&::-webkit-scrollbar-thumb': {
                              backgroundColor: "lightgrey",
                              borderRadius: 10
                          }
                      }}>
                {homeworks.map(x => {
                    return <div key={x.id}>
                        <Paper
                            key={x.id}
                            elevation={0}
                            component={Stack}
                            justifyContent="center"
                            alignContent={"center"}
                            sx={{":hover": hoveredItemStyle}}
                            style={{...getStyle(true, x.id!), marginBottom: 2, minHeight: 50}}
                            onClick={() => {
                                setState(prevState => ({
                                    ...prevState,
                                    selectedItem: {
                                        data: x,
                                        isHomework: true,
                                        id: x.id,
                                        homeworkFilesInfo: FileInfoConverter.getHomeworkFilesInfo(courseFilesInfo, x.id!)
                                    }
                                }))
                            }}>
                            <Typography variant="h6" style={{fontSize: 18}} align={"center"}
                                        color={x.isDeferred ? "textSecondary" : "textPrimary"}>
                                {showWarningsForEntity(x) && <div style={{fontSize: 16}}>⚠️<br/></div>}
                                {x.title}{getTip(x)}
                            </Typography>
                            {x.isDeferred && !x.publicationDateNotSet &&
                                <Typography style={{fontSize: "14px"}} align={"center"}>
                                    {"🕘 " + renderDate(x.publicationDate!) + " " + renderTime(x.publicationDate!)}
                                </Typography>}
                            {x.tasks?.length === 0 &&
                                <TimelineItem style={{minHeight: 30, marginBottom: -5}}>
                                    <TimelineOppositeContent></TimelineOppositeContent>
                                    <TimelineSeparator><TimelineConnector/></TimelineSeparator>
                                    <TimelineContent></TimelineContent>
                                </TimelineItem>}
                        </Paper>
                        {x.tasks!.map(t => <TimelineItem
                            key={t.id}
                            onClick={() => {
                                setState(prevState => ({
                                    ...prevState,
                                    selectedItem: {
                                        data: t,
                                        isHomework: false,
                                        id: t.id,
                                        homeworkFilesInfo: []
                                    }
                                }))
                            }}
                            style={{...getStyle(false, t.id!), marginBottom: 2}}
                            sx={{":hover": hoveredItemStyle}}>
                            {!t.deadlineDateNotSet &&
                                <TimelineOppositeContent color="textSecondary">
                                    {t.deadlineDate ? renderDate(t.deadlineDate) : ""}
                                    <br/>
                                    {t.deadlineDate ? renderTime(t.deadlineDate) : ""}
                                </TimelineOppositeContent>
                            }
                            <TimelineSeparator>
                                {renderTaskStatus(t)}
                                <TimelineConnector/>
                            </TimelineSeparator>
                            <TimelineContent alignItems={"center"}>
                                <Typography className="antiLongWords"
                                            color={t.isDeferred ? "textSecondary" : "textPrimary"}>
                                    {t.title}{getTip(x)}
                                </Typography>
                            </TimelineContent>
                        </TimelineItem>)}
                    </div>;
                })}
            </Timeline>
        </Grid>
        <Grid item xs={12} sm={12} md={8} lg={8}>
            {isHomework && selectedItem
                ? renderHomework(selectedItem as HomeworkViewModel)
                : renderTask(selectedItem as HomeworkTaskViewModel, selectedItemHomework!)}
        </Grid>
    </Grid>
}
