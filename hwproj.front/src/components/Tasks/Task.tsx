import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {HomeworkTaskViewModel} from "@/api";
import {Accordion, AccordionDetails, AccordionSummary, Grid, Tooltip} from '@material-ui/core';
import {FC} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Chip, Stack} from "@mui/material";
import Utils from "../../services/Utils";
import {getTip} from "../Common/HomeworkTags";
import StarIcon from '@mui/icons-material/Star';
import {MarkdownPreview} from "../Common/MarkdownEditor";
import TaskCriteria from "@/components/Tasks/TaskCriteria";

interface ITaskProp {
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isExpanded: boolean,
    isReadingMode: boolean,
    onDeleteClick: () => void,
    showForCourse: boolean
}

const useStyles = makeStyles(theme => ({
    tools: {
        width: "100%",
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginTop: '16px',
    }
}))

const Task: FC<ITaskProp> = (props) => {
    const publicationDate = new Date(props.task.publicationDate!)
    const deadlineDate = new Date(props.task.deadlineDate!)

    const publicationDateIsSet = !props.task.publicationDateNotSet
    const deadlineDateIsSet = !props.task.deadlineDateNotSet

    const {task} = props

    const publicationDateString = Utils.renderReadableDate(publicationDate)
    const deadlineDateString = Utils.renderReadableDate(deadlineDate)

    const classes = useStyles()

    return (
        <div style={{width: '100%'}}>
            <Accordion expanded={props.isExpanded ? true : undefined}>
                <AccordionSummary
                    expandIcon={!props.isExpanded ? <ExpandMoreIcon/> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: task.isDeferred! ? "#d3d5db" : "#eceef8"}}
                >
                    <div className={classes.tools}>
                        <Grid container direction="row" spacing={1} alignItems="center">
                            <Grid item>
                                <Typography style={{fontSize: '18px', marginRight: 1}}>
                                    {task.title}{getTip(task)}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Chip
                                    label={
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <StarIcon style={{fontSize: 15}}/>
                                            <div>{task.maxRating}</div>
                                        </Stack>
                                    }
                                    variant={"outlined"}
                                    style={{fontWeight: "bold"}}
                                    color={"success"}
                                />
                            </Grid>
                            {task.isGroupWork &&
                                <Grid item>
                                    <Chip variant="outlined" color="info" label="Командное"/>
                                </Grid>
                            }
                            {props.forMentor && publicationDateIsSet &&
                                <Grid item>
                                    <Chip variant="outlined" label={"🕘 " + publicationDateString}/>
                                </Grid>
                            }
                            {props.forMentor && !publicationDateIsSet &&
                                <Grid item>
                                    <Tooltip arrow title={"Не выставлена дата публикации"}>
                                        <Chip label={"⚠️"} variant="outlined"/>
                                    </Tooltip>
                                </Grid>
                            }
                            {task.hasDeadline && deadlineDateIsSet &&
                                <Grid item>
                                    <Tooltip
                                        arrow
                                        title={task.isDeadlineStrict ? "Нельзя публиковать решения после дедлайна" : "Дедлайн"}
                                    >
                                        <Chip
                                            variant="outlined"
                                            label={(task.isDeadlineStrict ? "⛔ До" : "До") + " " + deadlineDateString}
                                        />
                                    </Tooltip>
                                </Grid>
                            }
                            {props.forMentor && task.hasDeadline && !deadlineDateIsSet &&
                                <Grid item>
                                    <Tooltip arrow title={"Не выставлена дата дедлайна"}>
                                        <Chip label={"⚠️"} variant="outlined"/>
                                    </Tooltip>
                                </Grid>
                            }
                            {!task.hasDeadline &&
                                <Grid item>
                                    <Chip variant="outlined" label="без дедлайна"/>
                                </Grid>
                            }
                        </Grid>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid style={{width: "100%"}}>
                        <Typography variant="body1">
                            <MarkdownPreview value={task.description!}/>
                        </Typography>
                        <TaskCriteria task={task}/>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default Task
