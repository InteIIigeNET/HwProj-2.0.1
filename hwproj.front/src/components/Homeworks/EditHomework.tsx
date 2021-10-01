import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Redirect, Link} from "react-router-dom";
import {RouteComponentProps} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import ReactMarkdown from "react-markdown";
import {Tabs, Tab} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';

interface IEditHomeworkState {
    isLoaded: boolean;
    title: string;
    description: string;
    courseId: number;
    courseMentorId: string;
    edited: boolean;
    isPreview: boolean;
}

interface IEditHomeworkProps {
    homeworkId: string;
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


const EditHomework: FC<RouteComponentProps<IEditHomeworkProps>> = (props) => {
    const [editHomework, setEditHomework] = useState<IEditHomeworkState>({
        isLoaded: false,
        title: "",
        description: "",
        courseId: 0,
        courseMentorId: "",
        edited: false,
        isPreview: false,
    })

    useEffect(() => {
        getHomework()
    }, [])

    const getHomework = async () => {
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(+props.match.params.homeworkId)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)
        setEditHomework((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: homework.title!,
            description: homework.description!,
            courseId: homework.courseId!,
            courseMentorId: course.mentorIds!,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const homeworkViewModel = {
            title: editHomework.title,
            description: editHomework.description,
        };
        await ApiSingleton.homeworksApi
            .apiHomeworksUpdateByHomeworkIdPut(+props.match.params.homeworkId, homeworkViewModel)

        setEditHomework((prevState) => ({
            ...prevState,
            edited: true
        }))
    }

    const classes = useStyles()

    if (editHomework.edited) {
        return <Redirect to={"/courses/" + editHomework.courseId}/>;
    }

    if (editHomework.isLoaded) {
        if (
            !ApiSingleton.authService.isLoggedIn() ||
            !editHomework.courseMentorId.includes(ApiSingleton.authService.getUserId())
        ) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаватель может редактировать домашку
                </Typography>
            );
        }
        return (
            <div>
                <Grid container justify="center" style={{marginTop: '20px'}}>
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
                <div>
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
                            <Grid container justify="center">
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
                                    <Tabs
                                        indicatorColor="primary"
                                        value={editHomework.isPreview ? 1 : 0}
                                        onChange={(event, newValue) => setEditHomework(prevState => ({
                                            ...prevState,
                                            isPreview: newValue === 1
                                        }))}
                                    >
                                        <Tab label="Write" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
                                        <Tab label="Preview" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
                                    </Tabs>
                                </Grid>

                                <Grid item xs={11} role="tabpanel" hidden={editHomework.isPreview} id="simple-tab-0">
                                    <TextField
                                        multiline
                                        rows="4"
                                        fullWidth
                                        rowsMax="20"
                                        label="Описание домашки"
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
                                <Grid item xs={11} role="tabpanel" hidden={!editHomework.isPreview} id="simple-tab-1">
                                    <p><ReactMarkdown>{editHomework.description}</ReactMarkdown></p>
                                </Grid>
                                <Grid item xs={11}>
                                    <Button
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
                </div>
            </div>
        );
    }
    return (
        <div>

        </div>
    );
}

export default EditHomework
