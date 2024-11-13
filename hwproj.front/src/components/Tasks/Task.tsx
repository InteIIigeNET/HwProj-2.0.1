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
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import {Chip, Stack} from "@mui/material";
import {ReactMarkdownWithCodeHighlighting} from "../Common/TextFieldWithPreview";
import Utils from "../../services/Utils";
import {getTip} from "../Common/HomeworkTags";
import StarIcon from '@mui/icons-material/Star';

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

    const {task} = props

    const publicationDate = Utils.renderReadableDate(new Date(task.publicationDate!))
    const deadlineDate = Utils.renderReadableDate(new Date(task.deadlineDate!))

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
                        <Grid container direction={"row"} spacing={1} alignItems={"center"}>
                            <Grid item>
                                <Typography style={{fontSize: '18px', marginRight: 1}}>
                                    {task.title}{getTip(task)}
                                </Typography>
                            </Grid>
                            <Grid item><Chip label={<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                <StarIcon style={{fontSize: 15}}/>
                                <div>{task.maxRating}</div>
                            </Stack>}
                                             variant={"outlined"}
                                             style={{fontWeight: "bold"}}
                                             color={"success"}/></Grid>
                            {task.isGroupWork && <Grid item><Chip color={"info"} label="Комадное"/></Grid>}
                            {props.forMentor &&
                                <Grid item><Chip variant={"outlined"} label={"🕘 " + publicationDate}/></Grid>}
                            {task.hasDeadline &&
                                <Tooltip arrow
                                         title={task.isDeadlineStrict ? "Нельзя публиковать решения после дедлайна" : "Дедлайн"}>
                                    <Grid item>
                                        <Chip variant={"outlined"}
                                              label={(task.isDeadlineStrict ? "⛔ До" : "До") + " " + deadlineDate}/>
                                    </Grid>
                                </Tooltip>
                            }
                            {!task.hasDeadline && <Grid item><Chip variant={"outlined"} label={"без дедлайна"}/></Grid>}
                            {props.forMentor && !props.isReadingMode && <Grid item>
                                <div>
                                    <IconButton aria-label="Delete" onClick={openDialogDeleteTask}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                    <RouterLink to={'/task/' + task.id!.toString() + '/edit'}>
                                        <EditIcon fontSize="small"/>
                                    </RouterLink>
                                </div>
                            </Grid>
                            }
                        </Grid>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid>
                        <Typography variant="body1">
                            <ReactMarkdownWithCodeHighlighting value={task.description!}/>
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
