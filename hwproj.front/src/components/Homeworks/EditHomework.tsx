import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';
import {Grid, Typography, Button, TextField} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";

interface IEditHomeworkState {
    isLoaded: boolean;
    title: string;
    description: string;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
}

const useStyles = makeStyles(theme => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    main: {
        marginTop: "20px"
    }
}))


const EditHomework: FC = () => {
    const { homeworkId } = useParams()

    const [editHomework, setEditHomework] = useState<IEditHomeworkState>({
        isLoaded: false,
        title: "",
        description: "",
        courseId: 0,
        courseMentorIds: [],
        edited: false,
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
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const homeworkViewModel = {
            title: editHomework.title,
            description: editHomework.description,
        };
        await ApiSingleton.homeworksApi
            .apiHomeworksUpdateByHomeworkIdPut(+homeworkId!, homeworkViewModel)

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
        if (
            !ApiSingleton.authService.isLoggedIn() ||
            !editHomework.courseMentorIds.includes(ApiSingleton.authService.getUserId())
        ) {
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
                            <Grid container justifyContent="center">
                                <Grid item xs={11}>
                                    <TextField
                                        style={{ width: '300px'}}
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
