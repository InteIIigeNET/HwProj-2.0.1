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
import {FC, useState} from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {Card, CardActions, CardContent, Chip, Divider, Paper, Stack, Tooltip} from "@mui/material";
import {Link} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
import {getTip} from "../Common/HomeworkTags";
import {MarkdownPreview} from "../Common/MarkdownEditor";
import FilesPreviewList from "components/Files/FilesPreviewList";
import {IFileInfo} from "components/Files/IFileInfo"
import ApiSingleton from "api/ApiSingleton";
import FileInfoConverter from "components/Utils/FileInfoConverter";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    courseFilesInfo: FileInfoDTO[]
    studentSolutions: StatisticsCourseMatesModel[]
    isMentor: boolean
    isStudentAccepted: boolean
    userId: string
    selectedHomeworkId: number | undefined
}

interface ICourseExperimentalState {
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
        data: HomeworkViewModel | HomeworkTaskViewModel | undefined,
        homeworkFilesInfo: IFileInfo[],
    }
}

const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const homeworks = props.homeworks.slice().reverse()
    const {isMentor, studentSolutions, isStudentAccepted, userId, selectedHomeworkId, courseFilesInfo} = props

    const defaultHomeworkIndex = Math.max(selectedHomeworkId ? homeworks?.findIndex(x => x.id === selectedHomeworkId) : 0, 0)
    const defaultHomework = homeworks?.[defaultHomeworkIndex]

    const [state, setState] = useState<ICourseExperimentalState>({
        selectedItem: {
            isHomework: true,
            id: defaultHomework?.id,
            data: defaultHomework,
            homeworkFilesInfo: defaultHomework?.id
                ? FileInfoConverter.getHomeworkFilesInfo(courseFilesInfo, defaultHomework.id) : []
        }
    })

    const {data, id, isHomework, homeworkFilesInfo} = state.selectedItem

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

    const hoveredItemStyle = {backgroundColor: "ghostwhite", borderRadius: "10px", cursor: "pointer"}

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? hoveredItemStyle : {}

    const renderHomework = (homework: HomeworkViewModel, localFilesInfo: IFileInfo[]) => {
        const deferredHomeworks = homework.tasks!.filter(t => t.isDeferred!)
        const tasksCount = homework.tasks!.length
        return <CardContent>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="h6" component="div">
                        {homework.title}
                    </Typography>
                </Grid>
                {props.isMentor && deferredHomeworks!.length > 0 &&
                    <Grid item><Chip label={"🕘 " + deferredHomeworks!.length}/></Grid>
                }
                {tasksCount > 0 && <Grid item>
                    <Chip
                        label={tasksCount + " " + Utils.pluralizeHelper(["Задание", "Задания", "Заданий"], tasksCount)}/>
                </Grid>}
                {homework.tags?.filter(t => t !== '').map((tag, index) => (
                    <Grid item>
                        <Chip key={index} label={tag}/>
                    </Grid>
                ))}
            </Grid>
            <Divider style={{marginTop: 15, marginBottom: 15}}/>
            <Typography style={{color: "#454545"}} gutterBottom variant="body1">
                <MarkdownPreview value={homework.description!}/>
            </Typography>
            {localFilesInfo && localFilesInfo.length > 0 &&
                <div>
                    <FilesPreviewList
                        filesInfo={localFilesInfo}
                        onClickFileInfo={async (fileInfo: IFileInfo) => {
                            var url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.key!)
                            window.open(url, '_blank');
                        }}
                    />
                </div>}
        </CardContent>
    }

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
            <Typography style={{color: "#454545"}} gutterBottom variant="body1">
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

    const renderSelectedItem = () => {
        if (!data) return null

        if (isHomework) return <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
            {renderHomework(data as HomeworkViewModel, homeworkFilesInfo)}
        </Card>

        const task = data as HomeworkTaskViewModel
        return <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
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
                    return <div>
                        <Paper
                            elevation={0}
                            component={Stack}
                            justifyContent="center"
                            alignContent={"center"}
                            sx={{":hover": hoveredItemStyle}}
                            style={{...getStyle(true, x.id!), marginTop: 10, marginBottom: 10, minHeight: 50}}
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
                            <Typography variant="h6" style={{fontSize: 18}} align={"center"}>
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
                            style={{...getStyle(false, t.id!)}}
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
                                <Typography className="antiLongWords">
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
