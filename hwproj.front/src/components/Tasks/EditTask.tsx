import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {makeStyles} from "@material-ui/styles";
import {Button} from "@material-ui/core";
import {Typography, TextField, Grid} from "@mui/material";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
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
                                <Grid item style={{width: "90%", marginBottom: "10px"}}>
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
        <div>

        </div>
    )
}

export default EditTask