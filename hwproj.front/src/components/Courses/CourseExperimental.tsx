import * as React from "react";
import {
    FileInfoDTO,
    HomeworkTaskViewModel,
    HomeworkViewModel, Solution, StatisticsCourseMatesModel,
} from "../../api";
import {
    Button,
    Grid,
    Typography
} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {Alert, Card, CardActions, CardContent, Chip, Divider, Paper, Stack, Tooltip} from "@mui/material";
import {Link} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {getTip} from "../Common/HomeworkTags";
import {MarkdownPreview} from "../Common/MarkdownEditor";
import FileInfoConverter from "components/Utils/FileInfoConverter";
import CourseHomeworkExperimental from "components/Homeworks/CourseHomeworkExperimental";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    courseFilesInfo: FileInfoDTO[]
    studentSolutions: StatisticsCourseMatesModel[]
    isMentor: boolean
    isStudentAccepted: boolean
    userId: string
    selectedHomeworkId: number | undefined
    onUpdate: (update: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] }) => void
}

interface ICourseExperimentalState {
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
    }
}

const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const [hideDeferred, setHideDeferred] = useState<boolean>(false)

    const homeworks = props.homeworks.slice().reverse().filter(x => !hideDeferred || !x.isDeferred)
    const {isMentor, studentSolutions, isStudentAccepted, userId, selectedHomeworkId, courseFilesInfo} = props

    const [state, setState] = useState<ICourseExperimentalState>({selectedItem: {id: undefined, isHomework: false}})

    useEffect(() => {
        const defaultHomeworkIndex = Math.max(selectedHomeworkId ? homeworks?.findIndex(x => x.id === selectedHomeworkId) : 0, 0)
        const defaultHomework = homeworks?.[defaultHomeworkIndex]
        setState({selectedItem: {isHomework: true, id: defaultHomework?.id}})
    }, [hideDeferred])

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

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? clickedItemStyle : {}

    const renderTask = (task: HomeworkTaskViewModel) => {
        return <CardContent>
            <Grid container spacing={1} alignItems={"center"}>
                <Grid item style={{marginRight: 1}}>
                    <Typography variant="h6" component="div">
                        {task.title}
                    </Typography>
                </Grid>
                {task.isGroupWork && <Grid item>
                    <Chip color={"info"} label="Командное"/>
                </Grid>}
                <Grid item>
                    <Typography>{"⭐ " + task.maxRating}</Typography>
                </Grid>
            </Grid>
            <Divider style={{marginTop: 15, marginBottom: 15}}/>
            <Typography component="div" style={{color: "#454545"}} gutterBottom variant="body1">
                <MarkdownPreview value={task.description!}/>
            </Typography>
        </CardContent>
    }

    const taskSolutionsMap = new Map<number, Solution[]>()

    if (!isMentor && isStudentAccepted) {
        studentSolutions
            .filter(t => t.id === userId)
            .flatMap(t => t.homeworks!)
            .flatMap(t => t.tasks!)
            .forEach(x => taskSolutionsMap.set(x.id!, x.solution!))
    }

    const renderTaskStatus = (taskId: number, taskMaxRating: number) => {
        if (taskSolutionsMap.has(taskId)) {
            const solutions = taskSolutionsMap.get(taskId)
            const {
                lastSolution,
                lastRatedSolution,
                color,
                solutionsDescription
            } = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating)
            return lastSolution == null
                ? <TimelineDot variant={"outlined"}/>
                : <Tooltip arrow disableInteractive enterDelay={1000}
                           title={<span style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
                    <Chip style={{backgroundColor: color, marginTop: '11.5px'}}
                          size={"small"}
                          label={lastRatedSolution == null ? "?" : lastRatedSolution.rating}/>
                </Tooltip>
        }
        return <TimelineDot variant={"outlined"}/>
    }

    const getAlert = (entity: HomeworkViewModel | HomeworkTaskViewModel) => {
        if (!entity.isDeferred) return null
        return <Alert severity={"info"}
                      style={{marginTop: 2}}
                      action={
                          <Button
                              color="inherit"
                              size="small"
                              onClick={() => setHideDeferred(true)}
                          >
                              Скрыть
                          </Button>}>
            {isHomework ? "Задание будет опубликовано " : "Задача будет опубликована "}
            {renderDate(entity.publicationDate!) + " " + renderTime(entity.publicationDate!)}
        </Alert>
    }

    const renderSelectedItem = () => {
        if (isHomework) {
            const homework = homeworks.find(x => x.id === id) as HomeworkViewModel
            const filesInfo = id ? FileInfoConverter.getHomeworkFilesInfo(courseFilesInfo, id) : []
            return homework && <Grid container direction={"column"} spacing={1}>
                <Grid item>{getAlert(homework)}</Grid>
                <Grid item>
                    <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                        <CourseHomeworkExperimental
                            homeworkAndFilesInfo={{homework, filesInfo}}
                            isMentor={isMentor}
                            onUpdate={update => props.onUpdate(update)}/>
                    </Card>
                </Grid>
            </Grid>
        }

        const task = (homeworks.flatMap(x => x.tasks).find(x => x!.id == id)) as HomeworkTaskViewModel
        return task && <Grid container direction={"column"} spacing={1}>
            <Grid item>{getAlert(task)}</Grid>
            <Grid item>
                <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                    {renderTask(task)}
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
            </Grid>
        </Grid>
    }

    return <Grid container direction={"row"} spacing={1}>
        <Grid item lg={4}>
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
                                {x.title}{getTip(x)}
                            </Typography>
                            {x.isDeferred &&
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
                            <TimelineOppositeContent color="textSecondary">
                                {t.deadlineDate ? renderDate(t.deadlineDate) : ""}
                                <br/>
                                {t.deadlineDate ? renderTime(t.deadlineDate) : ""}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                {renderTaskStatus(t.id!, t.maxRating!)}
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

        <Grid item lg={8}>
            {renderSelectedItem()}
        </Grid>
    </Grid>
}

export default CourseExperimental
