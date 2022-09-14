import * as React from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Typography} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import HourglassEmpty from '@material-ui/icons/HourglassEmpty';
import ReactMarkdown from 'react-markdown';
import {HomeworkViewModel} from "../../api";
import AddTask from '../Tasks/AddTask'
import HomeworkTasks from '../Tasks/HomeworkTasks'
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from '../../api/ApiSingleton';
import {FC, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import Utils from "../../services/Utils";
import {Chip, Stack} from '@mui/material';

interface IHomeworkProps {
    homework: HomeworkViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isReadingMode: boolean,
    isExpanded: boolean,
    onDeleteClick: () => void
}

const useStyles = makeStyles(theme => ({
    tools: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
    }
}))

interface IHomeworkState {
    createTask: boolean
}

const Homework: FC<IHomeworkProps> = (props) => {
    const [homeworkState, setHomeworkState] = useState<IHomeworkState>({
        createTask: false,
    })

    const [isOpenDialogDeleteHomework, setIsOpenDialogDeleteHomework] = useState<boolean>(false)

    const openDialogDeleteHomework = () => {
        setIsOpenDialogDeleteHomework(true)
    }

    const closeDialogDeleteHomework = () => {
        setIsOpenDialogDeleteHomework(false)
    }

    const deleteHomework = async () => {
        await ApiSingleton.homeworksApi.apiHomeworksDeleteByHomeworkIdDelete(props.homework.id!)
        props.onDeleteClick()
    }

    const classes = useStyles()
    const homeworkDateString = new Date(props.homework.date!).toLocaleDateString("ru-RU");
    const deferredHomeworks = props.homework.tasks!.filter(t => t.isDeferred!);
    return (
        <div style={{width: '100%'}}>
            <Accordion defaultExpanded={props.isExpanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: "#c6cceb"}}
                >
                    <div className={classes.tools}>
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography style={{fontSize: '18px'}}>
                                {props.homework.title}
                            </Typography>
                            <Typography>
                                {homeworkDateString}
                            </Typography>
                            {props.forMentor && deferredHomeworks!.length > 0 &&
                                <Chip label={"🕘 " + deferredHomeworks!.length}/>
                            }
                            <Chip label={props.homework.tasks!.length + " заданий"}/>
                            {props.forMentor && !props.isReadingMode && <div>
                                <IconButton aria-label="Delete" onClick={openDialogDeleteHomework}>
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>

                                <RouterLink to={'/homework/' + props.homework.id!.toString() + '/edit'}>
                                    <EditIcon fontSize="small"/>
                                </RouterLink>
                            </div>
                            }
                        </Stack>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{width: '100%'}}>
                        <ReactMarkdown children={props.homework.description!}/>
                        {(props.forMentor && homeworkState.createTask) &&
                            <div style={{width: '100%'}}>
                                <HomeworkTasks
                                    onDelete={() => props.onDeleteClick()}
                                    tasks={props.homework.tasks!}
                                    forStudent={props.forStudent}
                                    forMentor={props.forMentor}
                                    isReadingMode={props.isReadingMode}
                                />
                                <AddTask
                                    id={props.homework.id!}
                                    onAdding={() => window.location.reload()}
                                    onCancel={() => setHomeworkState({
                                        createTask: false
                                    })}
                                    update={() => props.onDeleteClick()}
                                />
                            </div>
                        }
                        {(props.forMentor && !homeworkState.createTask) &&
                            <div style={{width: '100%'}}>
                                <HomeworkTasks
                                    onDelete={() => props.onDeleteClick()}
                                    tasks={props.homework.tasks!}
                                    forStudent={props.forStudent}
                                    forMentor={props.forMentor}
                                    isReadingMode={props.isReadingMode}
                                />
                                {!props.isReadingMode &&
                                    <Button
                                        style={{marginTop: "15px"}}
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            setHomeworkState({
                                                createTask: true
                                            })
                                        }}
                                    >
                                        Добавить задачу
                                    </Button>}
                            </div>
                        }
                        {!props.forMentor &&
                            <HomeworkTasks
                                onDelete={() => props.onDeleteClick()}
                                tasks={props.homework.tasks!}
                                forStudent={props.forStudent}
                                forMentor={props.forMentor}
                                isReadingMode={props.isReadingMode}
                            />
                        }
                    </div>
                </AccordionDetails>
            </Accordion>
            <DeletionConfirmation
                onCancel={closeDialogDeleteHomework}
                onSubmit={deleteHomework}
                isOpen={isOpenDialogDeleteHomework}
                dialogTitle={'Удаление домашнего задания'}
                dialogContentText={`Вы точно хотите удалить домашнее задание "${props.homework.title}"?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </div>
    )
}

export default Homework
