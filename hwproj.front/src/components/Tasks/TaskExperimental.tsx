import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import {HomeworkTaskViewModel} from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import {Accordion, AccordionDetails, AccordionSummary, Button, Grid, Tab, Tabs, TextField, InputAdornment, CircularProgress} from '@material-ui/core';
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import HourglassEmpty from "@material-ui/icons/HourglassEmpty";
import Utils from "../../services/Utils";
import {Box, CardContent, Chip, Divider, Stack} from "@mui/material";
import ReactMarkdown from "react-markdown";
import Checkbox from "@material-ui/core/Checkbox";
import ClearIcon from '@mui/icons-material/Clear';


interface ITaskProp {
    task: HomeworkTaskViewModel,
    isReadingMode: boolean,
    isMentor: boolean,
    editMode: boolean,
    doubleClickEdit: (e: any) => void,
    renderMenuTask: () => void,
    onSubmit: () => void
}

interface IEditTaskState {
    isLoaded: boolean;
    title: string;
    description: string;
    maxRating: number;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    publicationDate: Date;
}

const useStyles = makeStyles((theme) => ({
    checkboxDeadline: {
        minWidth: 40,
        width: 40
    },
}))

const TaskExperimental: FC<ITaskProp> = (props) => {
    const {task,
        isReadingMode,
        isMentor,
        editMode,
        doubleClickEdit,
        renderMenuTask,
        onSubmit} = props
    const [previewEdit, setPreviewEdit] = useState<boolean>(false)
    let deadlineDate

    const [taskState, setTaskState] = useState<IEditTaskState>({
        isLoaded: false,
        title: "",
        description: "",
        maxRating: 0,
        courseId: 0,
        courseMentorIds: [],
        edited: false,
        hasDeadline: false,
        deadlineDate: new Date(),
        isDeadlineStrict: false,
        publicationDate: new Date()
    })

    useEffect(() => {
        setPreviewEdit(false)
        setTaskState(prevState => ({
            ...prevState,
            isLoaded: false,
        }))
        getTask()
    }, [editMode])

    const getTask = async () => {
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)
        setTaskState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: task.title!,
            description: task.description!,
            maxRating: task.maxRating!,
            courseId: homework.courseId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            hasDeadline: task.hasDeadline!,
            deadlineDate: task.deadlineDate! as Date,
            isDeadlineStrict: task.isDeadlineStrict!,
            publicationDate: task.publicationDate! as Date
        }))
    }
    
    if (task.hasDeadline) {
        deadlineDate = new Date(task.deadlineDate!).toLocaleString("ru-RU")
    }

    const publicationDate = new Date(task.publicationDate!).toLocaleString("ru-RU")
    const classes = useStyles()

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await ApiSingleton.tasksApi.apiTasksUpdateByTaskIdPut(+task.id!, taskState)

        setTaskState((prevState) => ({
            ...prevState,
            edited: true,
        }))
        onSubmit()
    }
    if(!taskState.isLoaded) {
        return (
            <CardContent style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </CardContent>)
    } 
    else return (
        <CardContent style={{ minHeight: 180 }}>
            <form onSubmit={(e) => handleSubmit(e)}>
                {editMode &&
                    <Tabs
                        onChange={(event, value) => setPreviewEdit(value === 1)}
                        indicatorColor="primary"
                        style={{ marginBottom: 10 }}
                        value={previewEdit ? 1 : 0}
                        centered
                    >
                        <Tab label="Редактировать"
                             id="simple-tab-0"
                             aria-controls="simple-tabpanel-0"
                             style={{ width: '50%' }}/>
                        <Tab label="Превью" id="simple-tab-1" aria-controls="simple-tabpanel-1"
                             style={{ width: '50%' }}/>
                    </Tabs>
                }
                <Grid xs item hidden={!isReadingMode}>
                    <Grid container
                          xs={12}
                          item
                          id="simple-tab-0"
                          component="div"
                          alignItems={"center"}
                    >
                        <Grid item xs>
                            <Typography variant="h6" component="div">
                                {task.title}
                            </Typography>
                        </Grid>
                        {isMentor && task.isDeferred &&
                            <Grid xs={3} item style={{ display: 'flex', justifyContent: 'center' }}>
                                <Chip label={"🕘 " + publicationDate}/>
                            </Grid>}
                        <Grid item
                              xs={1}
                              style={{ minWidth: 60, width: 60, display: "flex", justifyContent: "flex-end", padding: 0  }}>
                            <Typography>{"⭐ " + task.maxRating}</Typography>
                        </Grid>
                    </Grid>
                    <Divider style={{marginTop: 15, marginBottom: 15}}/>
                    <Grid xs={12} item component="div">
                        <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                            <p><ReactMarkdown children={task.description!}/></p>
                        </Typography> 
                    </Grid>
                </Grid>
                {!editMode ?
                    <Grid xs item hidden={isReadingMode}>
                        <Grid xs={12} 
                              item
                              component="div"
                              container>
                            <Grid xs item>
                                <Typography variant="h6" component="div">
                                    {task.title}
                                </Typography> 
                            </Grid>
                            {isMentor && task.isDeferred &&
                                <Grid xs={3} item
                                      style={{ display: 'flex',  alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <Chip label={"🕘 " + new Date(taskState.publicationDate).toLocaleString("ru-RU")}/>
                                </Grid>}
                            <Grid item
                                  xs={1}
                                  style={{ minWidth: 60, width: 60, display: "flex", justifyContent: "flex-end", alignItems: 'center', padding: 0 }}>
                                <Typography>
                                    {"⭐ " + task.maxRating}
                                </Typography>
                            </Grid>
                            {!editMode && renderMenuTask()}
                        </Grid>
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                            <p><ReactMarkdown children={task.description!}/></p>
                        </Typography>
                    </Grid>
                    : 
                    <Grid>
                        <Grid container
                              xs={12}
                              item
                              component="div"
                              alignItems={"flex-end"}
                        >
                            <Grid xs item>
                                <TextField fullWidth
                                           id="simple-tab-0"
                                           role="tabpanel"
                                           hidden={previewEdit}
                                           variant="standard"
                                           name="title"
                                           label={'Название задачи*'}
                                           autoComplete="off"
                                           value={taskState.title}
                                           onChange={(e) => {
                                               e.persist()
                                               setTaskState((prevState) => ({
                                                   ...prevState,
                                                   title: e.target.value,
                                               }))}}
                                />
                                <Typography role="tabpanel"
                                            hidden={!previewEdit}
                                            id="simple-tab-1"
                                            variant="h6"
                                            component="div">
                                    {taskState.title}
                                </Typography>
                            </Grid>
                            {isMentor && task.isDeferred &&
                                <Grid xs={3} item
                                      style={{ display: 'flex', justifyContent: 'center' }}
                                      hidden={!previewEdit}>
                                    <Chip label={"🕘 " + new Date(taskState.publicationDate).toLocaleString("ru-RU")}/>
                                </Grid>}
                            <Grid item
                                  xs={1}
                                  style={{ minWidth: 60, width: 60, display: "flex", justifyContent: "flex-end", padding: 0 }}>
                                <Box id="simple-tab-0"
                                     role="tabpanel"
                                     hidden={previewEdit}
                                     style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Typography>⭐ </Typography>
                                    <TextField id="input-max-rating"
                                               type="number"
                                               variant="standard"
                                               label={'Баллы*'}
                                               value={taskState.maxRating}
                                               onChange={(e) => {
                                                   e.persist()
                                                   setTaskState((prevState) => ({
                                                       ...prevState,
                                                       maxRating: +e.target.value,
                                                   }))
                                               }}
                                    />
                                </Box>
                                <Typography role="tabpanel"
                                            hidden={!previewEdit}
                                            id="simple-tab-1">
                                    {"⭐ " + taskState.maxRating}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <Grid>
                            <TextField id="simple-tab-0"
                                       role="tabpanel"
                                       hidden={previewEdit}
                                       style={{ padding: 0 }}
                                       variant="outlined"
                                       label={'Условие задачи'}
                                       multiline
                                       fullWidth
                                       minRows={1}
                                       maxRows={6}
                                       value={taskState.description!}
                                       onChange={(e) => {
                                           e.persist()
                                           setTaskState((prevState) => ({
                                               ...prevState,
                                               description: e.target.value
                                           }))
                                       }}
                            />
                            <Typography role="tabpanel"
                                        hidden={!previewEdit}
                                        id="simple-tab-1"
                                        style={{color: "GrayText"}}
                                        gutterBottom
                                        variant="body1">
                                <p><ReactMarkdown children={taskState.description!}/></p>
                            </Typography>
                            <Grid
                                container
                                xs={12}
                                item
                                hidden={previewEdit}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Grid xs={12} item style={{ marginTop: 16 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="datetime-local"
                                        label="Дата публикации"
                                        type="datetime-local"
                                        defaultValue={taskState.publicationDate?.toLocaleString("ru-RU")}
                                        onChange={(e) => {
                                            e.persist()
                                            let date = new Date(e.target.value)
                                            date = Utils.toMoscowDate(date)
                                            setTaskState((prevState) => ({
                                                ...prevState,
                                                publicationDate: date,
                                            }))
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                xs={12}
                                hidden={previewEdit}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                style={{marginTop: '10px'}}
                            >
                                <Grid xs={taskState.hasDeadline && 1} item>
                                    <label style={{margin: 0, padding: 0 }}>
                                        <Checkbox
                                            color="primary"
                                            checked={taskState.hasDeadline}
                                            onChange={(e) => {
                                                e.persist()
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    hasDeadline: e.target.checked,
                                                    deadlineDate: undefined,
                                                    isDeadlineStrict: false,
                                                }))
                                            }}
                                        />
                                        {!taskState.hasDeadline && 'Добавить дедлайн'}
                                    </label>
                                </Grid>
                                {taskState.hasDeadline &&
                                    <Grid xs item hidden={!taskState.hasDeadline}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="datetime-local"
                                            label="Дедлайн задачи"
                                            type="datetime-local"
                                            defaultValue={taskState.deadlineDate?.toLocaleString("ru-RU")}
                                            onChange={(e) => {
                                                e.persist()
                                                let date = new Date(e.target.value)
                                                date = Utils.toMoscowDate(date)
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    deadlineDate: date,
                                                }))
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            required
                                        />
                                    </Grid>
                                }
                            </Grid>
                            {taskState.hasDeadline &&
                                <Grid item hidden={previewEdit}>
                                    <label style={{margin: 0, padding: 0}}>
                                        <Checkbox
                                            color="primary"
                                            onChange={(e) => {
                                                e.persist()
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    isDeadlineStrict: e.target.checked
                                                }))
                                            }}
                                            checked={taskState.isDeadlineStrict}
                                        />
                                        Запретить отправку решений после дедлайна
                                    </label>
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                }
                {editMode &&
                    <Button
                        variant="contained"
                        color="primary"
                        type='submit'
                        style={{ marginTop: 8 }}
                        fullWidth>
                        Редактировать задачу
                    </Button>}
            </form>
        </CardContent>
    )
}

export default TaskExperimental
