import * as React from "react";
import {
    HomeworkTaskViewModel,
    HomeworkViewModel, StatisticsCourseMatesModel, StatisticsCourseSolutionsModel
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
import {Box, Card, CardActions, CardContent, Chip, Divider} from "@mui/material";
import ReactMarkdown from "react-markdown";
import {Link} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    studentSolutions: StatisticsCourseMatesModel[]
    isMentor: boolean
    isStudentAccepted: boolean
    userId: string
}

interface ICourseExperimentalState {
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
        data: HomeworkViewModel | HomeworkTaskViewModel | undefined
    }
}

const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const homeworks = props.homeworks.slice().reverse()
    const {isMentor, studentSolutions, isStudentAccepted, userId} = props

    const [state, setState] = useState<ICourseExperimentalState>({
        selectedItem: {
            isHomework: true,
            id: homeworks && homeworks[0].id,
            data: homeworks && homeworks[0]
        }
    })

    const {data, id, isHomework} = state.selectedItem

    const renderDate = (date: Date) => {
        date = new Date(date)
        const options = {month: 'long', day: 'numeric'};
        return date.toLocaleString("ru-RU", options)
    }

    const renderTime = (date: Date) => {
        date = new Date(date)
        const options = {hour: "2-digit", minute: "2-digit"};
        return date.toLocaleString("ru-RU", options)
    }

    const hoveredItemStyle = {backgroundColor: "ghostwhite", borderRadius: "10px", cursor: "pointer"}

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? hoveredItemStyle : {}

    const renderHomework = (homework: HomeworkViewModel) => {
        const deferredHomeworks = homework.tasks!.filter(t => t.isDeferred!)
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
                <Grid item><Chip label={homework.tasks!.length + " заданий"}/></Grid>
            </Grid>
            <Divider style={{marginTop: 15, marginBottom: 15}}/>
            <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                <ReactMarkdown children={homework.description!}/>
            </Typography>
        </CardContent>
    }

    const renderTask = (task: HomeworkTaskViewModel) => {
        return <CardContent>
            <Grid container spacing={2} alignItems={"center"}>
                <Grid item>
                    <Typography variant="h6" component="div">
                        {task.title}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography>{"⭐ " + task.maxRating}</Typography>
                </Grid>
            </Grid>
            <Divider style={{marginTop: 15, marginBottom: 15}}/>
            <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                <ReactMarkdown children={task.description!}/>
            </Typography>
        </CardContent>
    }

    const taskSolutionsMap = new Map<number, StatisticsCourseSolutionsModel[]>()

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
                color
            } = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating)
            return lastSolution == undefined
                ? <TimelineDot variant={"outlined"}/>
                : <Chip style={{backgroundColor: color, marginTop: '11.5px'}}
                        size={"small"}
                        label={lastRatedSolution == undefined ? "⌛" : lastRatedSolution.rating}/>
        }
        return <TimelineDot variant={"outlined"}/>
    }

    const renderSelectedItem = () => {
        if (!data) return null

        if (isHomework) return <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
            {renderHomework(data as HomeworkViewModel)}
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
        <Grid item xs={4}>
            <Timeline style={{maxHeight: 500, overflow: 'auto'}}
                      sx={{'&::-webkit-scrollbar': {display: "none"}}}>
                {homeworks.map(x => <div>
                    <Box sx={{":hover": hoveredItemStyle}}
                         style={{...getStyle(true, x.id!), marginTop: 10, marginBottom: 10}}
                         onClick={() => {
                             setState(prevState => ({
                                 ...prevState,
                                 selectedItem: {
                                     data: x,
                                     isHomework: true,
                                     id: x.id
                                 }
                             }))
                         }}>
                        <Typography variant="subtitle1" align={"center"}>
                            <b>{x.title}</b>
                        </Typography>
                        {x.tasks?.length === 0 &&
                            <TimelineItem style={{minHeight: 30, marginBottom: -5}}>
                                <TimelineOppositeContent></TimelineOppositeContent>
                                <TimelineSeparator><TimelineConnector/></TimelineSeparator>
                                <TimelineContent></TimelineContent>
                            </TimelineItem>}
                    </Box>
                    {x.tasks!.map(t => <TimelineItem
                        onClick={() => {
                            setState(prevState => ({
                                ...prevState,
                                selectedItem: {
                                    data: t,
                                    isHomework: false,
                                    id: t.id
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
                                {t.title}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>)}
                </div>)}
            </Timeline>
        </Grid>

        <Grid item xs={8}>
            {renderSelectedItem()}
        </Grid>
    </Grid>
}

export default CourseExperimental
