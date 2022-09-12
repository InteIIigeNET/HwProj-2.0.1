import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit'
import ReactMarkdown from 'react-markdown'
import {HomeworkTaskViewModel} from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import {Accordion, AccordionDetails, AccordionSummary, Button} from '@material-ui/core';
import {FC, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import HourglassEmpty from "@material-ui/icons/HourglassEmpty";
import Utils from "../../services/Utils";
import {Chip, Stack} from "@mui/material";

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
    tool: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },
    text: {
        marginTop: '16px',
    }
}))

const Task: FC<ITaskProp> = (props) => {

    const [isOpenDialogDeleteTask, setIsOpenDialogDeleteTask] = useState<boolean>(false)

    const openDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(true)
    }

    const closeDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(false)
    }

    const deleteTask = async () => {
        await ApiSingleton.tasksApi.apiTasksDeleteByTaskIdDelete(props.task.id!)
        props.onDeleteClick()
    }

    const task = props.task
    let deadlineDate

    if (task.hasDeadline) {
        deadlineDate = Utils.convertUTCDateToLocalDate(task.deadlineDate!).toLocaleString("ru-RU")
    }

    const publicationDate = Utils.convertUTCDateToLocalDate(task.publicationDate!).toLocaleString("ru-RU")
    const classes = useStyles()

    return (
        <div style={{width: '100%', marginTop: "15px"}}>
            <Accordion expanded={props.isExpanded ? true : undefined}>
                <AccordionSummary
                    expandIcon={!props.isExpanded ? <ExpandMoreIcon/> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: task.isDeferred! ? "#d3d5db" : "#eceef8"}}
                >
                    <div className={classes.tools}>
                        <Stack direction={"row"} spacing={2} alignItems={"center"}>
                            <Typography style={{fontSize: '18px'}}>
                                {task.title}
                            </Typography>
                            {props.forMentor && task.isDeferred && <Chip label={"🕘 " + publicationDate}/>}
                            {task.hasDeadline && <Chip label={"⌛ " + deadlineDate}/>}
                            {!task.hasDeadline && <Chip label={"без дедлайна"}/>}
                            <Chip label={"⭐ " + task.maxRating}/>
                            {props.forMentor && !props.isReadingMode && <div>
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
                    <div>
                        <Typography variant="body1">
                            <ReactMarkdown children={task.description!}/>
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
                    </div>
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
