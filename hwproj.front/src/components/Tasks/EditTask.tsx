import * as React from "react";
import {Navigate, Link, useParams, useNavigate} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {makeStyles} from "@material-ui/styles";
import {Button, CircularProgress} from "@material-ui/core";
import {Typography, TextField, Grid, Alert} from "@mui/material";
import {MarkdownEditor} from "../Common/MarkdownEditor";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import {HomeworkViewModel} from "../../api";

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
        marginTop: "15px"
    },
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

    const getTask = async () => {
        const taskForEditing = await ApiSingleton.tasksApi.tasksGetForEditingTask(+taskId!)
        const homework = taskForEditing.homework!
        const task = taskForEditing.task!
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(homework.courseId!)

        const publicationDate = task.publicationDateNotSet
            ? undefined
            : new Date(task.publicationDate!)

        const deadlineDate = task.deadlineDateNotSet
            ? undefined
            : new Date(task.deadlineDate!)

        setTaskState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: task.title!,
            description: task.description!,
            maxRating: task.maxRating!,
            courseId: homework.courseId!,
            hasDeadline: task.hasDeadline!,
            deadlineDate: deadlineDate,
            isDeadlineStrict: task.isDeadlineStrict!,
            publicationDate: publicationDate,
            homeworkId: task.homeworkId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            homework: homework,
            hasErrors: false,
            isTaskPublished: !task.isDeferred,
        }))
    }

    const navigate = useNavigate()

    const toEditHomework = () =>
        navigate(`/homework/${taskState.homeworkId}/edit`)

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await ApiSingleton.tasksApi.tasksUpdateTask(+taskId!, taskState)

        setTaskState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    const classes = useStyles()

    if (taskState.edited) {
        return <Navigate to={`/courses/${taskState.courseId}/editHomeworks`}/>;
    }

    if (taskState.isLoaded) {
        if (!taskState.courseMentorIds.includes(ApiSingleton.authService.getUserId())) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаватель может редактировать задачу
                </Typography>
            );
        }

        const homeworkPublicationDateIsSet = !taskState.homework!.publicationDateNotSet

        return (
            <div className="container">
                <Grid container xs={12} justifyContent="center">
                    <Grid item xs={12} style={{marginTop: '20px'}}>
                        <Link
                            style={{color: '#212529'}}
                            to={"/courses/" + taskState.courseId.toString()}
                        >
                            <Typography>
                                Назад к курсу
                            </Typography>
                        </Link>
                    </Grid>

                    <Grid item className={classes.logo}>
                        <div>
                            <EditIcon color="primary" style={{marginRight: '0.5rem'}}/>
                        </div>
                        <div>
                            <Typography style={{fontSize: '22px'}}>
                                Редактирование задачи
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <form
                            onSubmit={(e) => handleSubmit(e)}
                            className={classes.form}
                        >
                            <Grid container spacing={0.5}>
                                <Grid container item xs={"auto"} spacing={1} direction={"row"}>
                                    <Grid item>
                                        <TextField
                                            required
                                            fullWidth
                                            style={{width: '300px'}}
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
                                <Grid item xs={12} marginBottom={-1} marginTop={-1}>
                                    <MarkdownEditor
                                        label={"Условие задачи"}
                                        height={240}
                                        maxHeight={400}
                                        value={taskState.description}
                                        onChange={(value) => {
                                            setTaskState((prevState) => ({
                                                ...prevState,
                                                description: value
                                            }))
                                        }}
                                    />
                                </Grid>
                                {homeworkPublicationDateIsSet &&
                                    <Grid item xs={12} style={{width: "90%", marginBottom: "10px"}}>
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
                                }
                                {!homeworkPublicationDateIsSet &&
                                    <Grid item xs={12} style={{width: "90%", marginBottom: "10px"}}>
                                        <Alert
                                            severity="info"
                                            icon={false}
                                            action={
                                                <Button
                                                    color="inherit"
                                                    size="small"
                                                    onClick={toEditHomework}
                                                >
                                                    К заданию
                                                </Button>
                                            }
                                        >
                                            Для изменения дат укажите дату публикации домашнего задания
                                        </Alert>
                                    </Grid>
                                }
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={taskState.hasErrors}
                                    >
                                        Редактировать задачу
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </div>
        )
    }

    return (
        <div className="container">
            <p>Загрузка...</p>
            <CircularProgress/>
        </div>
    )
}

export default EditTask