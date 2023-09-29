import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import ReactMarkdown from "react-markdown";
import {FC, useEffect, useState} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {makeStyles} from "@material-ui/styles";
import Utils from "../../services/Utils";
import {Tab, Tabs, Checkbox, Typography, Button, TextField, Grid} from "@material-ui/core";

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
    isPreview: boolean;
}

const useStyles = makeStyles(theme => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    form: {
        marginTop: "20px"
    },
    checkBox: {
        width: '90%',
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
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
        deadlineDate: new Date(),
        isDeadlineStrict: false,
        publicationDate: new Date(),
        isPreview: false,
    })

    useEffect(() => {
        getTask()
    }, [])

    const getTask = async () => {
        const task = await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
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
            deadlineDate: task.deadlineDate!,
            isDeadlineStrict: task.isDeadlineStrict!,
            publicationDate: task.publicationDate! as Date
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
        if (
            !ApiSingleton.authService.isLoggedIn() ||
            !taskState.courseMentorIds.includes(ApiSingleton.authService.getUserId())
        ) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаваталь может редактировать задачу
                </Typography>
            );
        }
        return (
            <Grid container justifyContent="center">
                <Grid item xs={8}>
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
                                        style={{ width: '300px'}}
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
                                        style={{ width: '300px'}}
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
                            <Grid item xs={11}>
                                        <Tabs
                                            indicatorColor="primary"
                                            value={taskState.isPreview ? 1 : 0}
                                            onChange={(event, newValue) => setTaskState(prevState => ({
                                                ...prevState,
                                                isPreview: newValue === 1
                                            }))}
                                        >
                                            <Tab label="Редактировать" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
                                            <Tab label="Превью" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
                                        </Tabs>
                                    </Grid>

                                    <Grid item xs={11} role="tabpanel" hidden={taskState.isPreview} id="simple-tab-0">
                                        <TextField
                                            multiline
                                            rows="4"
                                            fullWidth
                                            rowsMax="20"
                                            label="Описание"
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
                                    <Grid item xs={11} role="tabpanel" hidden={!taskState.isPreview} id="simple-tab-1">
                                        <p><ReactMarkdown>{taskState.description}</ReactMarkdown></p>
                                    </Grid>
                            <Grid item className={classes.checkBox}>
                                <div>
                                    <TextField
                                        id="datetime-local"
                                        label="Дата публикации"
                                        type="datetime-local"
                                        defaultValue={taskState.publicationDate?.toLocaleString("ru-RU")}
                                        onChange={(e) => {
                                            let date = new Date(e.target.value)
                                            date = Utils.toMoscowDate(date)
                                            e.persist()
                                            setTaskState((prevState) => ({
                                                ...prevState,
                                                publicationDate: date,
                                            }))
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label>
                                        <Checkbox
                                            color="primary"
                                            checked={taskState.hasDeadline}
                                            onChange={(e) => {
                                                e.persist()
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    hasDeadline: e.target.checked,
                                                    deadlineDate: undefined,
                                                }))
                                            }}
                                        />
                                        Добавить дедлайн
                                    </label>
                                </div>
                            </Grid>
                            {taskState.hasDeadline &&
                                <Grid item className={classes.checkBox}>
                                    <div>
                                        <TextField
                                            id="datetime-local"
                                            label="Дедлайн задачи"
                                            type="datetime-local"
                                            defaultValue={taskState.deadlineDate?.toLocaleString("ru-RU")}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            required
                                            onChange={(e) => {
                                                e.persist()
                                                let date = new Date(e.target.value)
                                                date = Utils.toMoscowDate(date)
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    deadlineDate: date,
                                                }))
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>
                                            <Checkbox
                                                color="primary"
                                                onChange={(e) => {
                                                    e.persist()
                                                    setTaskState((prevState) => ({
                                                        ...prevState,
                                                        isDeadlineStrict: e.target.checked
                                                    }))
                                                }}
                                            />
                                            Запретить отправку после дедлайна
                                        </label>
                                    </div>
                                </Grid>
                            }
                            <Grid item xs={11} style={{marginTop : 10}}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Редактировать задачу
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        )
    }

    return (
        <div>

        </div>
    )
}

export default EditTask
