import * as React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import ApiSingleton from "../../api/ApiSingleton";
import Button from '@material-ui/core/Button'
import {Grid, Box, Checkbox, TextField, FormControlLabel, Typography} from '@mui/material';
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import Lecturers from "./Lecturers";
import {AccountDataDto} from "../../api";
import {appBarStateManager} from "../AppBar";
import {MarkdownEditor} from '../Common/MarkdownEditor';
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface IEditCourseState {
    isLoaded: boolean,
    name: string,
    groupName?: string,
    isCompleted: boolean,
    description: string,
    mentors: AccountDataDto[],
    edited: boolean,
    deleted: boolean,
    lecturerEmail: string;
}

const useStyles = makeStyles((theme) => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    item: {
        marginTop: theme.spacing(2),
    },
    button: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        fontSize: '0.9rem',
        borderRadius: '0.5rem',
    }
}))

const EditCourse: FC = () => {
    const {courseId} = useParams()

    const [courseState, setCourseState] = useState<IEditCourseState>({
        isLoaded: false,
        name: "",
        groupName: "",
        isCompleted: false,
        description: "",
        mentors: [],
        edited: false,
        deleted: false,
        lecturerEmail: "",
    })

    useEffect(() => {
        getCourse()
        appBarStateManager.setContextAction({actionName: "К курсу", link: `/courses/${courseId}`})
        return () => appBarStateManager.reset()
    }, [])

    const getCourse = async () => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(+courseId!)
        setCourseState((prevState) => ({
            ...prevState,
            isLoaded: true,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isCompleted: course.isCompleted!,
            mentors: course.mentors!,
            description: course.description!,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const courseViewModel = {
            name: courseState.name,
            groupName: courseState.groupName,
            isOpen: true,
            isCompleted: courseState.isCompleted,
            description: courseState.description,
        };

        await ApiSingleton.coursesApi.coursesUpdateCourse(+courseId!, courseViewModel)
        setCourseState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    const classes = useStyles()

    if (courseState.isLoaded) {
        if (courseState.edited) {
            return <Navigate to={'/courses/' + courseId}/>
        }

        if (courseState.deleted) {
            return <Navigate to='/'/>
        }

        if (!courseState.mentors.filter((mentor) =>
            mentor.email === ApiSingleton.authService.getUserEmail())) {
            return (
                <Typography variant='h6' gutterBottom>
                    Только преподаватель может редактировать курс
                </Typography>
            )
        }

        return (
            <Grid container justifyContent="center" className="container" style={{marginTop: 20}}>
                <Grid container spacing={3} direction='row'>
                    <Grid item>
                        <Box display="flex" justifyContent="center" mb={3}>
                            <EditIcon color='primary' style={{marginRight: '0.5rem'}}/>
                            <Typography variant="h5">Редактировать курс</Typography>
                        </Box>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                className={classes.item}
                                margin="normal"
                                fullWidth
                                required
                                label="Название курса"
                                variant="outlined"
                                value={courseState.name}
                                onChange={(e) => {
                                    e.persist()
                                    setCourseState((prevState) => ({
                                        ...prevState,
                                        name: e.target.value
                                    }))
                                }}
                            />
                            <TextField
                                className={classes.item}
                                label="Номер группы"
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                value={courseState.groupName}
                                onChange={(e) => {
                                    e.persist()
                                    setCourseState((prevState) => ({
                                        ...prevState,
                                        groupName: e.target.value
                                    }))
                                }}
                            />
                            <Grid>
                                <MarkdownEditor
                                    label={"Описание курса"}
                                    value={courseState.description}
                                    height={130}
                                    onChange={(value) => {
                                        setCourseState((prevState) => ({
                                            ...prevState,
                                            description: value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid>
                                <FormControlLabel
                                    style={{margin: 0}}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={courseState.isCompleted}
                                            onChange={(e) => {
                                                e.persist()
                                                setCourseState((prevState) => ({
                                                    ...prevState,
                                                    isCompleted: e.target.checked
                                                }))
                                            }}
                                        />
                                    }
                                    label="Завершённый курс"
                                />
                            </Grid>
                            <Grid className={classes.item} style={{alignItems: 'center'}}>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="contained"
                                    type="submit">
                                    Редактировать курс
                                </Button>
                            </Grid>
                        </form>
                    </Grid>
                    <Grid item>
                        <Lecturers
                            update={getCourse}
                            mentors={courseState.mentors}
                            courseId={courseId!}
                            isEditCourse={true}
                        />
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    return (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}

export default EditCourse
