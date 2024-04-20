import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import EditIcon from "@material-ui/icons/Edit";
import CalculateIcon from '@mui/icons-material/Calculate';
import {makeStyles} from "@material-ui/styles";
import {Typography, TextField, Grid, Divider} from "@mui/material";
import Button from '@material-ui/core/Button'
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import {HomeworkViewModel} from "../../api";
import CodeWindow from '../CodeWindow';
import AutomaticUtils from '../Common/AutomaticUtils'

interface IEditTaskState {
    isLoaded: boolean;
    title: string;
    description: string;
    maxRating: number;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    publicationDate: Date | undefined;
    homework: HomeworkViewModel | undefined;
    hasErrors: boolean;
    isTaskPublished: boolean;
    homeworkId: number;
}

const useStyles = makeStyles(theme => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    form: {
        marginTop: "20px"
    },
    button: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        fontSize: '0.9rem'
    }
}))

const EditTask: FC = () => {
    const {taskId} = useParams()

    const [taskState, setTaskState] = useState<IEditTaskState>({
        isLoaded: false,
        title: "",
        description: "",
        maxRating: 0,
        courseId: 0,
        courseMentorIds: [],
        edited: false,
        hasDeadline: false,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        publicationDate: undefined,
        homework: undefined,
        hasErrors: false,
        isTaskPublished: false,
        homeworkId: 0,
})

    useEffect(() => {
        getTask()
    }, [])

    const [isOpenCodeWindow, setIsOpenCodeWindow] = useState<boolean>(false)

    const onCloseCodeWindow = () => {
        setIsOpenCodeWindow(false)
    }

    const onOpenCodeWindow = () => {
        setIsOpenCodeWindow(true)
    }

    const getTask = async () => {
        const taskForEditing = await ApiSingleton.tasksApi.apiTasksGetForEditingByTaskIdGet(+taskId!)
        const homework = taskForEditing.homework!
        const task = taskForEditing.task!
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)

        const publication = task.publicationDate == undefined
            ? undefined
            : new Date(task.publicationDate)

        const deadline = task.deadlineDate == undefined
            ? undefined
            : new Date(task.deadlineDate)

        setTaskState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: task.title!,
            description: task.description!,
            maxRating: task.maxRating!,
            courseId: homework.courseId!,
            hasDeadline: task.hasDeadline!,
            deadlineDate: deadline,
            isDeadlineStrict: task.isDeadlineStrict!,
            publicationDate: publication,
            homeworkId: task.homeworkId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            homework: homework,
            hasErrors: false,
            isTaskPublished: !task.isDeferred,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await ApiSingleton.tasksApi.apiTasksUpdateByTaskIdPut(+taskId!, taskState)

        setTaskState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    const classes = useStyles()

    if (taskState.edited) {
        return <Navigate to={"/courses/" + taskState.courseId}/>;
    }

    if (taskState.isLoaded) {
        if (!taskState.courseMentorIds.includes(ApiSingleton.authService.getUserId())) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаватель может редактировать задачу
                </Typography>
            );
        }
        return (
            <Grid container justifyContent="center">
                <Grid item xs={6}>
                    <Grid container style={{marginTop: '20px'}}>
                        <Grid item xs={11}>
                            <Link
                                style={{color: '#212529'}}
                                to={"/courses/" + taskState.courseId.toString()}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                    </Grid>

                    <div className={classes.logo}>
                        <div>
                            <EditIcon style={{color: 'red'}}/>
                        </div>
                        <div>
                            <Typography style={{fontSize: '22px'}}>
                                Редактирование задачи
                            </Typography>
                        </div>
                    </div>
                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={classes.form}
                    >
                        <Grid container spacing={1}>
                            <Grid container xs={"auto"} spacing={1} direction={"row"}>
                                <Grid item>
                                    <TextField
                                        required
                                        fullWidth
                                        style={{width: '250px'}}
                                        label="Название задачи"
                                        variant="outlined"
                                        margin="normal"
                                        value={taskState.title}
                                        onChange={(e) => {
                                            e.persist()
                                            setTaskState((prevState) => ({
                                                ...prevState,
                                                title: e.target.value,
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        required
                                        fullWidth
                                        style={{width: '75px'}}
                                        label="Баллы"
                                        variant="outlined"
                                        margin="normal"
                                        type="number"
                                        value={taskState.maxRating}
                                        onChange={(e) => {
                                            e.persist()
                                            setTaskState((prevState) => ({
                                                ...prevState,
                                                maxRating: +e.target.value,
                                            }))
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldWithPreview
                                    multiline
                                    fullWidth
                                    minRows={7}
                                    maxRows="20"
                                    label="Условие задачи"
                                    variant="outlined"
                                    margin="normal"
                                    value={taskState.description}
                                    onChange={(e) => {
                                        e.persist()
                                        setTaskState((prevState) => ({
                                            ...prevState,
                                            description: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item style={{width: "90%", marginBottom: '10px'}}>
                                <TaskPublicationAndDeadlineDates
                                    homework={taskState.homework!}
                                    hasDeadline={taskState.hasDeadline}
                                    isDeadlineStrict={taskState.isDeadlineStrict}
                                    publicationDate={taskState.publicationDate}
                                    deadlineDate={taskState.deadlineDate}
                                    disabledPublicationDate={taskState.isTaskPublished}
                                    onChange={(state) => setTaskState(prevState => ({
                                        ...prevState,
                                        hasDeadline: state.hasDeadline,
                                        isDeadlineStrict: state.isDeadlineStrict,
                                        publicationDate: state.publicationDate,
                                        deadlineDate: state.deadlineDate,
                                        hasErrors: state.hasErrors
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    className={classes.button}
                                    style={{textTransform: 'none', borderRadius: '0.5rem'}}
                                    color="primary"
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    type="submit"
                                    disabled={taskState.hasErrors}
                                >
                                    Редактировать задачу
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    <Divider textAlign="left" style={{marginTop: '2rem', marginBottom: '1.5rem'}}>
                        <Typography color="textSecondary">Автоматическая сдача</Typography>
                    </Divider>
                    <Button
                        className={classes.button}
                        style={{textTransform: 'none'}}
                        color="primary"
                        startIcon={<CalculateIcon />}
                        onClick={onOpenCodeWindow}
                        >
                        Сгенерировать команду для автоматической отправки решений
                    </Button>
                </Grid>

                <CodeWindow
                    onClose={onCloseCodeWindow}
                    open={isOpenCodeWindow}
                    code={AutomaticUtils.getAutoSendSolutionScript(+taskId!)}
                    title="bash"
                    language="bash"/>
            </Grid>
        )
    }

    return (
        <div>

        </div>
    )
}

export default EditTask
