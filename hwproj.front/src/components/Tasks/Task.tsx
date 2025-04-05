import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit'
import {HomeworkTaskViewModel} from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import {Accordion, AccordionDetails, AccordionSummary, Button, Grid, Tooltip} from '@material-ui/core';
import {FC, useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import DeletionConfirmation from "../DeletionConfirmation";
import {Chip, Stack} from "@mui/material";
import Utils from "../../services/Utils";
import {getTip} from "../Common/HomeworkTags";
import StarIcon from '@mui/icons-material/Star';
import {MarkdownPreview} from "../Common/MarkdownEditor";

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

    const [isOpenDialogDeleteTask, setIsOpenDialogDeleteTask] = useState<boolean>(false)

    const openDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(true)
    }

    const closeDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(false)
    }

    const deleteTask = async () => {
        await ApiSingleton.tasksApi.tasksDeleteTask(props.task.id!)
        props.onDeleteClick()
    }

    const {task} = props

    const publicationDateIsSet = publicationDate.getTime() !== Utils.maxAllowedDate.getTime()

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
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography style={{fontSize: '18px', marginRight: 1}}>
                                {task.title}{getTip(task)}
                            </Typography>
                            <Chip
                                label={
                                    <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                        <StarIcon style={{fontSize: 15}}/>
                                        <div>{task.maxRating}</div>
                                    </Stack>
                                }
                                variant={"outlined"}
                                style={{fontWeight: "bold"}}
                                color={"success"}
                            />
                            {task.isGroupWork && <Chip variant={"outlined"} color={"info"} label="Комадное"/>}
                            {props.forMentor && publicationDateIsSet &&
                                <Chip variant={"outlined"} label={"🕘 " + publicationDateString}/>
                            }
                            {props.forMentor && !publicationDateIsSet &&
                                <Tooltip arrow title={"Дата публикации не выставлена"}>
                                    <Chip
                                        label={"⚠️"}
                                        variant="outlined"
                                        style={{ background: "#3b3b3b", borderWidth: 2, borderColor: "#ffbf00" }}
                                    />
                                </Tooltip>
                            }
                            {task.hasDeadline && task.deadlineDate &&
                                <Tooltip
                                    arrow
                                    title={task.isDeadlineStrict ? "Нельзя публиковать решения после дедлайна" : "Дедлайн"}
                                >
                                    <Chip
                                        variant={"outlined"}
                                        label={(task.isDeadlineStrict ? "⛔ До" : "До") + " " + deadlineDateString}
                                    />
                                </Tooltip>
                            }
                            {task.hasDeadline && !task.deadlineDate &&
                                <Tooltip arrow title={"Дата дедлайна не выставлена"}>
                                    <Chip
                                        label={"⚠️"}
                                        variant="outlined"
                                        style={{ background: "#3b3b3b", borderWidth: 2, borderColor: "#ffbf00" }}
                                    />
                                </Tooltip>
                            }
                            {!task.hasDeadline && <Chip variant={"outlined"} label={"без дедлайна"}/>}
                            {props.forMentor && !props.isReadingMode &&
                                <div>
                                    <IconButton aria-label="Delete" onClick={openDialogDeleteTask}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                    <RouterLink to={'/task/' + task.id!.toString() + '/edit'}>
                                        <EditIcon fontSize="small"/>
                                    </RouterLink>
                                </div>
                            }
                        </Stack>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid style={{width: "100%"}}>
                        <Typography variant="body1">
                            <MarkdownPreview value={task.description!}/>
                        </Typography>
                        {props.showForCourse && props.forStudent &&
                            <div style={{marginTop: '15px'}}>
                                <Button
                                    style={{width: '150px'}}
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => window.location.assign("/task/" + task.id!.toString())}
                                >
                                    Решения
                                </Button>
                            </div>
                        }
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <DeletionConfirmation
                onCancel={closeDialogDeleteTask}
                onSubmit={deleteTask}
                isOpen={isOpenDialogDeleteTask}
                dialogTitle={'Удаление задачи'}
                dialogContentText={`Вы точно хотите удалить задачу "${task.title}"?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </div>
    );
}

export default Task
