import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';
import {Grid, Typography, Button, TextField, Checkbox} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import Utils from "../../services/Utils";

interface IEditHomeworkState {
    isLoaded: boolean;
    title: string;
    description: string;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    publicationDate: Date;
}

const useStyles = makeStyles(theme => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    main: {
        marginTop: "20px"
    },
    checkBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
}))


const EditHomework: FC = () => {
    const {homeworkId} = useParams()

    const [editHomework, setEditHomework] = useState<IEditHomeworkState>({
        isLoaded: false,
        title: "",
        description: "",
        courseId: 0,
        courseMentorIds: [],
        edited: false,
        hasDeadline: false,
        deadlineDate: new Date(),
        isDeadlineStrict: false,
        publicationDate: new Date()
    })

    useEffect(() => {
        getHomework()
    }, [])

    const getHomework = async () => {
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(+homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)

        
        setEditHomework((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: homework.title!,
            description: homework.description!,
            courseId: homework.courseId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            hasDeadline: homework.hasDeadline!,
            deadlineDate: homework.deadlineDate!,
            isDeadlineStrict: homework.isDeadlineStrict!,
            publicationDate: homework.publicationDate!
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        
        await ApiSingleton.homeworksApi
            .apiHomeworksUpdateByHomeworkIdPut(+homeworkId!, editHomework)

        setEditHomework((prevState) => ({
            ...prevState,
            edited: true
        }))
    }

    const classes = useStyles()

    if (editHomework.edited) {
        return <Navigate to={"/courses/" + editHomework.courseId}/>;
    }

    if (editHomework.isLoaded) {
        if (!editHomework.courseMentorIds.includes(ApiSingleton.authService.getUserId())) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаватель может редактировать домашнюю работу
                </Typography>
            );
        }
        return (
            <Grid container justifyContent="center">
                <Grid item xs={9}>
                    <Grid container justifyContent="center" style={{marginTop: '20px'}}>
                        <Grid xs={11}>
                            <Link
                                style={{color: '#212529'}}
                                to={"/courses/" + editHomework.courseId.toString()}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                    </Grid>

                    <Grid style={{marginTop: "15px"}}>
                        <div className={classes.logo}>
                            <div>
                                <EditIcon style={{color: 'red'}}/>
                            </div>
                            <div>
                                <Typography style={{fontSize: '22px'}}>
                                    Редактировать домашнее задание
                                </Typography>
                            </div>
                        </div>
                        <form
                            className={classes.main}
                            onSubmit={(e) => handleSubmit(e)}
                        >
                            <Grid container justifyContent="center" spacing={1}>
                                <Grid item xs={11}>
                                    <TextField
                                        style={{width: '300px'}}
                                        required
                                        label="Название задания"
                                        variant="outlined"
                                        margin="normal"
                                        size="medium"
                                        value={editHomework.title}
                                        onChange={(e) => {
                                            e.persist()
                                            setEditHomework((prevState) => ({
                                                ...prevState,
                                                title: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={11}>
                                    <TextFieldWithPreview
                                        multiline
                                        minRows="4"
                                        fullWidth
                                        maxRows="20"
                                        label="Описание"
                                        variant="outlined"
                                        margin="normal"
                                        value={editHomework.description}
                                        onChange={(e) => {
                                            e.persist()
                                            setEditHomework((prevState) => ({
                                                ...prevState,
                                                description: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={11} className={classes.checkBox}>
                                <div>
                                    <TextField
                                        id="datetime-local"
                                        label="Дата публикации"
                                        type="datetime-local"
                                        defaultValue={editHomework.publicationDate?.toLocaleString("ru-RU")}
                                        onChange={(e) => {
                                            let date = new Date(e.target.value)
                                            date = Utils.toMoscowDate(date)
                                            e.persist()
                                            setEditHomework((prevState) => ({
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
                                                checked={editHomework.hasDeadline}
                                                onChange={(e) => {
                                                    e.persist()
                                                    setEditHomework((prevState) => ({
                                                        ...prevState,
                                                        hasDeadline: e.target.checked,
                                                        isDeadlineStrict: false,
                                                        deadlineDate: undefined,
                                                    }))
                                                }}
                                            />
                                            Добавить дедлайн
                                        </label>
                                    </div>
                             </Grid>
                            {editHomework.hasDeadline &&
                                <Grid item xs={11} className={classes.checkBox}>
                                    <div>
                                        <TextField
                                            id="datetime-local"
                                            label="Дедлайн задания"
                                            type="datetime-local"
                                            defaultValue={editHomework.deadlineDate?.toLocaleString("ru-RU")}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            required
                                            onChange={(e) => {
                                                e.persist()
                                                let date = new Date(e.target.value)
                                                date = Utils.toMoscowDate(date)
                                                setEditHomework((prevState) => ({
                                                    ...prevState,
                                                    deadlineDate: date,
                                                }))
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>
                                            <Checkbox
                                                checked={editHomework.isDeadlineStrict}
                                                color="primary"
                                                onChange={(e) => {
                                                    e.persist()
                                                    setEditHomework((prevState) => ({
                                                        ...prevState,
                                                        isDeadlineStrict: e.target.checked
                                                    }))
                                                }}
                                            />
                                            Запретить отправку после дедлайна
                                        </label>
                                    </div>
                                </Grid>}
                                <Grid item xs={11}>
                                    <Button
                                        fullWidth
                                        size="medium"
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                    >
                                        Редактировать
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
    return (
        <div>

        </div>
    );
}

export default EditHomework
