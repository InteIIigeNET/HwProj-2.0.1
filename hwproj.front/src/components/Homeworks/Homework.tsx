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
import {
    Chip,
    Accordion,
    AccordionSummary,
    Grid,
    Typography,
    IconButton,
    Button,
    AccordionDetails,
    Tooltip
} from '@material-ui/core';
import Utils from "../../services/Utils";
import {MarkdownPreview} from "../Common/MarkdownEditor";
import {IFileInfo} from 'components/Files/IFileInfo';
import UpdateFilesUtils from 'components/Utils/UpdateFilesUtils';

interface IHomeworkProps {
    homework: HomeworkViewModel,
    forMentor: boolean,
    forStudent: boolean,
    isReadingMode: boolean,
    isExpanded: boolean,
    onUpdateClick: () => void
    homeworkFilesInfo: IFileInfo[]
}

const useStyles = makeStyles(_ => ({
    tools: {
        width: "100%",
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
    }
}))

interface IHomeworkState {
    createTask: boolean
}

const Homework: FC<IHomeworkProps> = (props) => {
    const publicationDate = new Date(props.homework.publicationDate!)
    const deadlineDate = new Date(props.homework.deadlineDate!)

    const publicationDateIsSet = !props.homework.publicationDateNotSet
    const deadlineDateIsSet = !props.homework.deadlineDateNotSet

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
        await ApiSingleton.homeworksApi.homeworksDeleteHomework(props.homework.id!)

        // Удаляем файлы домашней работы из хранилища
        const deleteOperations = props.homeworkFilesInfo
            .map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(props.homework.courseId!, initialFile))
        await Promise.all(deleteOperations)

        props.onUpdateClick()
    }

    const getDeleteMessage = (homeworkName: string, filesInfo: IFileInfo[]) => {
        let message = `Вы точно хотите удалить задание "${homeworkName}"?`;
        if (filesInfo.length > 0) {
            message += ` Будет также удален файл ${filesInfo[0].name}`;
            if (filesInfo.length > 1) {
                message += ` и другие прикрепленные файлы`;
            }
        }

        return message;
    };

    const publicationDateString = Utils.renderReadableDate(publicationDate)
    const deadlineDateString = Utils.renderReadableDate(deadlineDate)
    const tasksCount = props.homework.tasks!.length

    const classes = useStyles()

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
                        <Grid container direction="row" spacing={1} alignItems="center">
                            <Grid item>
                                <Typography style={{fontSize: '18px'}}>
                                    {props.homework.title}
                                </Typography>
                            </Grid>
                            {props.forMentor && publicationDateIsSet &&
                                <Grid item>
                                    <Chip label={"🕘 " + publicationDateString}/>
                                </Grid>
                            }
                            {props.forMentor && !publicationDateIsSet &&
                                <Grid item>
                                    <Tooltip arrow title={"Не выставлена дата публикации"}>
                                        <Chip label={"⚠️"}/>
                                    </Tooltip>
                                </Grid>
                            }
                            {props.homework.hasDeadline && deadlineDateIsSet &&
                                <Grid item>
                                    <Chip label={"⌛ " + deadlineDateString}/>
                                </Grid>
                            }
                            {props.forMentor && props.homework.hasDeadline && !deadlineDateIsSet &&
                                <Grid item>
                                    <Tooltip arrow title={"Не выставлена дата дедлайна"}>
                                        <Chip label={"⚠️"}/>
                                    </Tooltip>
                                </Grid>
                            }
                            {props.forMentor && props.homework.isDeadlineStrict &&
                                <Grid item>
                                    <Tooltip arrow title={"Нельзя публиковать решения после дедлайна"}>
                                        <Chip label={"⛔"}/>
                                    </Tooltip>
                                </Grid>
                            }
                            {tasksCount > 0 &&
                                <Grid item>
                                    <Chip label={tasksCount + " заданий"}/>
                                </Grid>
                            }
                            {props.homework.tags?.filter(t => t !== '').map((tag, index) => (
                                <Grid item>
                                    <Chip key={index} label={tag}/>
                                </Grid>
                            ))}
                            {props.forMentor && !props.isReadingMode &&
                                <Grid item>
                                    <IconButton aria-label="Delete" onClick={openDialogDeleteHomework}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>

                                    <RouterLink to={'/homework/' + props.homework.id!.toString() + '/edit'}>
                                        <EditIcon fontSize="small"/>
                                    </RouterLink>
                                </Grid>
                            }
                        </Grid>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{width: '100%'}}>
                        <MarkdownPreview value={props.homework.description!}/>
                        {(props.forMentor && homeworkState.createTask) &&
                            <div style={{width: '100%'}}>
                                <HomeworkTasks
                                    onDelete={() => props.onUpdateClick()}
                                    tasks={props.homework.tasks!}
                                    forStudent={props.forStudent}
                                    forMentor={props.forMentor}
                                    isReadingMode={props.isReadingMode}
                                />
                                <AddTask
                                    homework={props.homework}
                                    onAdding={() => props.onUpdateClick()}
                                    onClose={() => setHomeworkState({
                                        createTask: false
                                    })}
                                />
                            </div>
                        }
                        {(props.forMentor && !homeworkState.createTask) &&
                            <div style={{width: '100%'}}>
                                <HomeworkTasks
                                    onDelete={() => props.onUpdateClick()}
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
                                onDelete={() => props.onUpdateClick()}
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
                dialogTitle={'Удаление задания'}
                dialogContentText={getDeleteMessage(props.homework.title!, props.homeworkFilesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </div>
    )
}

export default Homework
