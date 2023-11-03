import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {makeStyles} from "@material-ui/styles";
import Utils from "../../services/Utils";
import {Checkbox, Typography, Button, TextField, Grid, Tooltip, Link as LinkMUI} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import {CreateTaskViewModel} from "../../api";

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
    homeworkPublicationDate: Date;
    homeworkHasDeadline: boolean;
    homeworkDeadlineDate: Date | undefined;
    homeworkIsDeadlineStrict: boolean;
    hasError: boolean;
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
        homeworkPublicationDate: new Date(),
        homeworkHasDeadline: false,
        homeworkDeadlineDate: undefined,
        homeworkIsDeadlineStrict: false,
        hasError: false,
        isTaskPublished: false,
        homeworkId: 0,
})

    const [isOpenDates, setIsOpenDates] = useState<boolean>()

    useEffect(() => {
        getTask()
    }, [])

    const getTask = async () => {
        const task = await ApiSingleton.tasksApi.apiTasksGetForEditingByTaskIdGet(+taskId!)
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)

        const publication = task.publicationDate == undefined
            ? undefined
            : Utils.toMoscowDate(new Date(task.publicationDate))

        const deadline = task.deadlineDate == undefined
            ? undefined
            : Utils.toMoscowDate(new Date(task.deadlineDate))

        const isTaskPublished = new Date(task.publicationDate ?? homework.publicationDate!) <= new Date(Date.now())

        setIsOpenDates(publication != undefined)

        setTaskState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: task.title!,
            description: task.description!,
            maxRating: task.maxRating!,
            courseId: homework.courseId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            hasDeadline: task.hasDeadline!,
            deadlineDate: deadline,
            isDeadlineStrict: task.isDeadlineStrict!,
            publicationDate: publication,
            homeworkPublicationDate: homework.publicationDate!,
            homeworkHasDeadline: homework.hasDeadline!,
            homeworkDeadlineDate: homework.deadlineDate,
            homeworkIsDeadlineStrict: homework.isDeadlineStrict!,
            hasError: false,
            isTaskPublished: isTaskPublished,
            homeworkId: task.homeworkId!
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const addHomework: CreateTaskViewModel = {
            ...taskState,
            id: +taskId!
        }

        await ApiSingleton.tasksApi.apiTasksUpdatePut(addHomework)

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
                                        style={{width: '300px'}}
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
                            {!isOpenDates && 
                            <Grid item>
                                <Tooltip arrow title={"Позволяет установить даты для определенной задачи"}>
                                    <Typography variant={"caption"} style={{fontSize: "14px"}}>
                                        <LinkMUI onClick={() => {
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    hasDeadline: undefined,
                                                    deadlineDate: undefined,
                                                    isDeadlineStrict: undefined,
                                                    publicationDate: undefined,
                                                    hasError: false,
                                                }))

                                                setIsOpenDates(true)
                                            }}>
                                            Нужны особые даты?
                                        </LinkMUI>
                                    </Typography>
                                </Tooltip>
                            </Grid>}
                                
                            {isOpenDates &&
                            <Grid container>
                                <Grid item>
                                    <Tooltip arrow title={"Позволяет выставить даты как у домашнего задания"}>
                                        <Typography variant={"caption"} style={{fontSize: "14px"}}>
                                            <LinkMUI onClick={() => {
                                                setTaskState((prevState) => ({
                                                    ...prevState,
                                                    hasDeadline: undefined,
                                                    deadlineDate: undefined,
                                                    isDeadlineStrict: undefined,
                                                    publicationDate: undefined,
                                                    hasError: false,
                                                }))

                                                setIsOpenDates(false)
                                            }}>
                                                Оставить обычные даты
                                            </LinkMUI>
                                        </Typography>
                                    </Tooltip>
                                </Grid>
                                <Grid item style={{width: "90%"}}>
                                    <TaskPublicationAndDeadlineDates
                                    homeworkPublicationDate={taskState.homeworkPublicationDate}
                                    homeworkHasDeadline={taskState.homeworkHasDeadline}
                                    homeworkDeadlineDate={taskState.homeworkDeadlineDate}
                                    homeworkIsDeadlineStrict={taskState.homeworkIsDeadlineStrict}
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
                                        hasError: state.hasError
                                    }))}
                                    />
                                </Grid>
                            </Grid>
                            }
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={taskState.hasError}
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
