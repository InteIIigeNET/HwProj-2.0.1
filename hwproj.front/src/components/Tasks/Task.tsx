import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit'
import { HomeworkTaskViewModel } from "../../api";
import { Link as RouterLink } from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Tooltip } from '@material-ui/core';
import { FC, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import { Chip } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import { ReactMarkdownWithCodeHighlighting } from "../Common/TextFieldWithPreview";
import Utils from "../../services/Utils";
import CodeWindow from '../CodeWindow';
import AutomaticUtils from '../Common/AutomaticUtils';

interface ITaskProp {
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isExpanded: boolean,
    isReadingMode: boolean,
    onDeleteClick: () => void,
    showForCourse: boolean
}

interface IGitHubRequestState {
    isOpen: boolean,
    taskId: number
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

    const [codeWindowState, setCodeWindowState] = useState<IGitHubRequestState>({
        isOpen: false,
        taskId: 0
    })

    const onCloseCodeWindow = () => {
        setCodeWindowState((prevState) => ({
            ...prevState,
            isOpen: false
        }))
    }

    const [isOpenDialogDeleteTask, setIsOpenDialogDeleteTask] = useState<boolean>(false)

    const deleteTask = async () => {
        await ApiSingleton.tasksApi.apiTasksDeleteByTaskIdDelete(props.task.id!)
        props.onDeleteClick()
    }

    const openDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(true)
    }

    const closeDialogDeleteTask = () => {
        setIsOpenDialogDeleteTask(false)
    }

    const { task } = props

    const publicationDate = Utils.renderReadableDate(new Date(task.publicationDate!))
    const deadlineDate = Utils.renderReadableDate(new Date(task.deadlineDate!))

    const classes = useStyles()

    return (
        <div style={{ width: '100%' }}>
            <Accordion expanded={props.isExpanded ? true : undefined}>
                <AccordionSummary
                    expandIcon={!props.isExpanded ? <ExpandMoreIcon /> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{ backgroundColor: task.isDeferred! ? "#d3d5db" : "#eceef8" }}
                >
                    <div className={classes.tools}>
                        <Grid container direction={"row"} spacing={1} alignItems={"center"}>
                            <Grid item>
                                <Typography style={{ fontSize: '18px', marginRight: 1 }}>
                                    {task.title}
                                </Typography>
                            </Grid>
                            {task.isGroupWork && <Grid item><Chip color={"info"} label="Комадное" /></Grid>}
                            {props.forMentor && <Grid item><Chip label={"🕘 " + publicationDate} /></Grid>}
                            {task.hasDeadline && <Grid item><Chip label={"⌛ " + deadlineDate} /></Grid>}
                            {props.forMentor && props.task.isDeadlineStrict &&
                                <Tooltip arrow title={"Нельзя публиковать решения после дедлайна"}>
                                    <Grid item>
                                        <Chip label={"⛔"} />
                                    </Grid>
                                </Tooltip>
                            }
                            {!task.hasDeadline && <Grid item><Chip label={"без дедлайна"} /></Grid>}
                            <Grid item><Chip label={"⭐ " + task.maxRating} /></Grid>
                            {props.forMentor && !props.isReadingMode && <Grid item>
                                <div>
                                    <IconButton aria-label="Delete" onClick={openDialogDeleteTask}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    <RouterLink to={'/task/' + task.id!.toString() + '/edit'}>
                                        <EditIcon fontSize="small" />
                                    </RouterLink>
                                    <Tooltip placement={"right"} arrow title={"Запрос для отправки автоматического решения"}>
                                        <IconButton aria-label="Github" onClick={() => setCodeWindowState({
                                            isOpen: true,
                                            taskId: task.id!
                                        })}>
                                            <GitHubIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </Grid>
                            }
                        </Grid>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid>
                        <Typography variant="body1">
                            <ReactMarkdownWithCodeHighlighting value={task.description!} />
                        </Typography>
                        {props.showForCourse && props.forStudent &&
                            <div style={{ marginTop: '15px' }}>
                                <Button
                                    style={{ width: '150px' }}
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
            <CodeWindow
                onClose={onCloseCodeWindow}
                open={codeWindowState.isOpen}
                code={AutomaticUtils.getAutoSendSolutionScript(+codeWindowState.taskId!)}
                title="bash"
                language="bash" />
        </div>
    );
}

export default Task
