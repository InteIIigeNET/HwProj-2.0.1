import * as React from "react";
import {
    HomeworkTaskViewModel,
    HomeworkViewModel, StatisticsCourseMatesModel
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
import {Card, CardActions, CardContent, Chip, Divider} from "@mui/material";
import ReactMarkdown from "react-markdown";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[];
    studentSolutions: StatisticsCourseMatesModel[];
    isMentor: boolean
    isStudentAccepted: boolean
}

interface ICourseExperimentalState {
    data: HomeworkViewModel | HomeworkTaskViewModel | undefined
}

const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const homeworks = props.homeworks.slice().reverse()

    const [state, setState] = useState<ICourseExperimentalState>({
        data: homeworks && homeworks[0]
    })

    const {data} = state

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

    const renderSelectedItem = () => {
        if (!data) return null

        const isTask = (data as HomeworkTaskViewModel).maxRating !== undefined
        if (!isTask) return <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
            {renderHomework(data as HomeworkViewModel)}
        </Card>

        const task = data as HomeworkTaskViewModel
        return <Card variant="elevation" style={{backgroundColor: "ghostwhite"}}>
            {renderTask(task)}
            {!props.isMentor && props.isStudentAccepted && < CardActions>
                < Button
                    style={{width: '150px'}}
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.assign("/task/" + task.id!.toString())}
                >
                    Решения
                </Button>
            </CardActions>}
        </Card>
    }

    return <Grid container direction={"row"} spacing={1}>
        <Grid item xs={5}>
            <Timeline style={{maxHeight: 500, overflow: 'auto'}}
                      sx={{'&::-webkit-scrollbar': {display: "none"}}}>
                {homeworks.map(x => <div><TimelineItem
                    sx={{":hover": {backgroundColor: "ghostwhite", borderRadius: "15px", cursor: "pointer"}}}
                    onClick={() => {
                        setState(prevState => ({
                            ...prevState,
                            data: x
                        }))
                    }}>
                    <TimelineOppositeContent color="textSecondary">
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot/>
                        <TimelineConnector/>
                    </TimelineSeparator>
                    <TimelineContent>
                        <Typography variant="h6" component="span" className="antiLongWords">
                            {x.title}
                        </Typography>
                    </TimelineContent>
                </TimelineItem>
                    {x.tasks?.map(t => <TimelineItem
                        onClick={() => {
                            setState(prevState => ({
                                ...prevState,
                                data: t
                            }))
                        }}
                        sx={{":hover": {backgroundColor: "ghostwhite", borderRadius: "15px", cursor: "pointer"}}}>
                        <TimelineOppositeContent color="textSecondary">
                            {t.deadlineDate ? renderDate(t.deadlineDate) : ""}
                            <br/>
                            {t.deadlineDate ? renderTime(t.deadlineDate) : ""}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot variant={"outlined"}/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography className="antiLongWords">
                                {t.title}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>)}
                </div>)}
            </Timeline>
        </Grid>

        <Grid item xs={7}>
            {renderSelectedItem()}
        </Grid>
    </Grid>
}

export default CourseExperimental
