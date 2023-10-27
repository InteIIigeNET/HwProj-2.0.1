import * as React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import {HomeworkViewModel} from "../../api";
import AddTask from '../Tasks/AddTask'
import HomeworkTasks from '../Tasks/HomeworkTasks'
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from '../../api/ApiSingleton';
import {FC, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import {Chip, Accordion, AccordionSummary, Typography, IconButton, Button, AccordionDetails, Tooltip} from '@material-ui/core';
import {Stack} from '@mui/material';
import {ReactMarkdownWithCodeHighlighting} from "../Common/TextFieldWithPreview";

interface IHomeworkProps {
    homework: HomeworkViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isReadingMode: boolean,
    isExpanded: boolean,
    onDeleteClick: () => void
}

const useStyles = makeStyles(_ => ({
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

    const options: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"}

    const classes = useStyles()
    const homeworkPublicationDateString = new Date(props.homework.publicationDate!).toLocaleDateString("ru-RU", options);
    const homeworkDeadlineDateString = new Date(props.homework.deadlineDate!).toLocaleDateString("ru-RU", options);
    return (
        <div style={{width: '100%'}}>
            <Accordion defaultExpanded={props.isExpanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: props.homework.isDeferred ? "#d3d5db" : "#c6cceb"}}
                >
                    <div className={classes.tools}>
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography style={{fontSize: '18px'}}>
                                {props.homework.title}
                            </Typography>
                            {props.forMentor &&
                            <Chip label={"🕘 " + homeworkPublicationDateString}/>
                            }
                            {props.homework.hasDeadline && 
                            <Chip label={"⌛ " + homeworkDeadlineDateString}/>
                            }
                            {props.forMentor && props.homework.isDeadlineStrict &&
                            <Tooltip arrow title={"Нельзя публиковать решения после дедлайна"}>
                                <Chip label={"⛔"}/>
                            </Tooltip>
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
                        <ReactMarkdownWithCodeHighlighting value={props.homework.description!}/>
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
                                    homework={props.homework}
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
