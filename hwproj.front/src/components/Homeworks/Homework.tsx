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

interface IHomeworkProps {
    homework: HomeworkViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isReadingMode: boolean,
    onDeleteClick: () => void
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
    const homeworkDateString = ApiSingleton.utils.convertUTCDateToLocalDate(props.homework.date!).toLocaleDateString("ru-RU");
    const deferredHomeworks = props.homework.tasks!.filter(t => t.isDeferred!);
    return (
        <div style={{width: '100%'}}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{backgroundColor: "#c6cceb"}}
                >
                    <div className={classes.tools}>
                        <div className={classes.tool}>
                            <Typography style={{fontSize: '18px'}}>
                                {props.homework.title}
                            </Typography>
                        </div>
                        <div>
                            <Typography>
                                {homeworkDateString}
                            </Typography>
                        </div>
                        <div style={{marginLeft: '8px'}}>
                            {props.forMentor && deferredHomeworks!.length > 0 &&
                                <Typography>
                                    <HourglassEmpty/>
                                    {deferredHomeworks!.length}
                                </Typography>
                            }
                        </div>
                        <div>
                            {props.forMentor && !props.isReadingMode &&
                                <IconButton aria-label="Delete" onClick={openDialogDeleteHomework}>
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            }
                        </div>
                        <div>
                            {props.forMentor && !props.isReadingMode &&
                                <RouterLink to={'/homework/' + props.homework.id!.toString() + '/edit'}>
                                    <EditIcon fontSize="small"/>
                                </RouterLink>
                            }
                        </div>
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
                                        style={{marginTop: "10px"}}
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
