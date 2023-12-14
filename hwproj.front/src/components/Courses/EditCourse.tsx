import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import {Navigate, useParams} from 'react-router-dom';
import ApiSingleton from "../../api/ApiSingleton";
import {Grid} from '@material-ui/core';
import {FC, useEffect, useState} from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/styles/makeStyles";
import EditIcon from "@material-ui/icons/Edit";
import DeletionConfirmation from "../DeletionConfirmation";
import Link from "@material-ui/core/Link";
import DeleteIcon from '@material-ui/icons/Delete';
import Lecturers from "./Lecturers";
import {AccountDataDto} from "../../api";

interface IEditCourseState {
    isLoaded: boolean,
    name: string,
    groupName?: string,
    isCompleted: boolean,
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
    }
}))

const EditCourse: FC = () => {
    const {courseId} = useParams()

    const [courseState, setCourseState] = useState<IEditCourseState>({
        isLoaded: false,
        name: "",
        groupName: "",
        isCompleted: false,
        mentors: [],
        edited: false,
        deleted: false,
        lecturerEmail: "",
    })

    const [isOpenDialogDeleteCourse, setIsOpenDialogDeleteCourse] = useState<boolean>(false)

    useEffect(() => {
        getCourse()
    }, [])

    const getCourse = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId!)
        setCourseState((prevState) => ({
            ...prevState,
            isLoaded: true,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isCompleted: course.isCompleted!,
            mentors: course.mentors!,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const courseViewModel = {
            name: courseState.name,
            groupName: courseState.groupName,
            isOpen: true,
            isCompleted: courseState.isCompleted
        };

        await ApiSingleton.coursesApi.apiCoursesUpdateByCourseIdPost(+courseId!, courseViewModel)
        setCourseState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    const openDialogDeleteCourse = () => {
        setIsOpenDialogDeleteCourse(true)
    }

    const closeDialogDeleteCourse = () => {
        setIsOpenDialogDeleteCourse(false)
    }

    const onDeleteCourse = async () => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdDelete(+courseId!)
        setCourseState((prevState) => ({
            ...prevState,
            deleted: true
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
            <div>
                <Grid container justify="center" style={{marginTop: '20px'}}>
                    <Grid container justifyContent="space-between" xs={11}>
                        <Grid item>
                            <Link
                                component="button"
                                style={{color: '#212529'}}
                                onClick={() => window.location.assign('/courses/' + courseId)}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
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
                <Container component="main" maxWidth="xs">
                    <div className={classes.paper}>
                        <div className={classes.logo}>
                            <div>
                                <EditIcon style={{color: 'red'}}/>
                            </div>
                            <Typography style={{fontSize: '22px'}}>
                                Редактировать курс
                            </Typography>
                        </div>
                        <form onSubmit={e => handleSubmit(e)} className={classes.form}>
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
                            <Grid container spacing={2} className={classes.item}>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        style={{margin: 0}}
                                        control={
                                            <Checkbox
                                                defaultChecked
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
                            </Grid>
                            <div className={classes.item}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Редактировать курс
                                </Button>
                            </div>
                        </form>
                    </div>
                </Container>
                <Grid container justify="center" style={{marginTop: '20px', marginBottom: '20px'}}>
                    <Grid container xs={11} justifyContent="flex-end">
                        <Grid>
                            <Button
                                onClick={openDialogDeleteCourse}
                                fullWidth
                                variant="contained"
                                style={{color: '#8d8686'}}
                                startIcon={<DeleteIcon/>}
                            >
                                Удалить курс
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <DeletionConfirmation
                    onCancel={closeDialogDeleteCourse}
                    onSubmit={onDeleteCourse}
                    isOpen={isOpenDialogDeleteCourse}
                    dialogTitle={"Удаление курса"}
                    dialogContentText={`Вы точно хотите удалить курс "${courseState.name}"?`}
                    confirmationWord={courseState.name}
                    confirmationText={"Для подтверждения введите название курса."}
                />
            </div>
        );
    }

    return (
        <div>

        </div>
    )
}

export default EditCourse
