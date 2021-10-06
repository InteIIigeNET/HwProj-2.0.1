import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import {Redirect} from 'react-router-dom';
import {RouteComponentProps} from "react-router-dom"
import ApiSingleton from "../../api/ApiSingleton";
import {Dialog, DialogTitle, Grid} from '@material-ui/core';
import {FC, useEffect, useState} from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/styles/makeStyles";
import EditIcon from "@material-ui/icons/Edit";
import AddLecturerInCourse from './AddLecturerInCourse';
import DeletionConfirmation from "../DeletionConfirmation";
import Link from "@material-ui/core/Link";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from "@material-ui/core/IconButton";
import Lecturers from "./Lecturers";
import {AccountDataDto} from "../../api";


interface IEditCourseState {
    isLoaded: boolean,
    name: string,
    groupName?: string,
    isComplete: boolean,
    mentors: AccountDataDto[],
    edited: boolean,
    deleted: boolean,
    lecturerEmail: string;
}

interface IEditCourseProps {
    courseId: string
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

const EditCourse: FC<RouteComponentProps<IEditCourseProps>> = (props) => {

    const [courseState, setCourseState] = useState<IEditCourseState>({
        isLoaded: false,
        name: "",
        groupName: "",
        isComplete: false,
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
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+props.match.params.courseId)
        const mentors = await Promise.all(course.mentorIds!.split('/')
                .map(mentor => ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(mentor)))
        setCourseState((prevState) => ({
            ...prevState,
            isLoaded: true,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isComplete: course.isCompleted!,
            mentors: mentors,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const courseViewModel = {
            name: courseState.name,
            groupName: courseState.groupName,
            isOpen: true,
            isComplete: courseState.isComplete
        };

        await ApiSingleton.coursesApi.apiCoursesUpdateByCourseIdPost(+props.match.params.courseId, courseViewModel)
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
        await ApiSingleton.coursesApi.apiCoursesByCourseIdDelete(+props.match.params.courseId)
        setCourseState((prevState) => ({
            ...prevState,
            deleted: true
        }))
    }

    const classes = useStyles()

    if (courseState.isLoaded) {
        if (courseState.edited) {
            return <Redirect to={'/courses/' + props.match.params.courseId}/>
        }

        if (courseState.deleted) {
            return <Redirect to='/'/>
        }

        if (!ApiSingleton.authService.isLoggedIn() || !ApiSingleton.authService.isLecturer())
        {
            return (
                <Typography variant='h6' gutterBottom>
                    Только преподаватель может редактировать курс
                </Typography>
            )
        }

        return (
            <div>
                <Grid container justify="center" style={{marginTop: '20px'}}>
                    <Grid container justifyContent="space-between" xs={11} >
                        <Grid item>
                            <Link
                                component="button"
                                style={{color: '#212529'}}
                                onClick={() => window.location.assign('/courses/' + props.match.params.courseId)}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Lecturers
                                mentors={courseState.mentors}
                                courseId={props.match.params.courseId}
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
                                        style={{ margin: 0 }}
                                        control={
                                            <Checkbox
                                                defaultChecked
                                                color="primary"
                                                checked={courseState.isComplete}
                                                onChange={(e) => {
                                                    e.persist()
                                                    setCourseState((prevState) => ({
                                                        ...prevState,
                                                        isComplete: e.target.checked
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
                <Grid container justify="center" style={{marginTop: '20px', marginBottom: '20px' }}>
                    <Grid container xs={11} justifyContent="flex-end" >
                        <Grid>
                            <Button
                                onClick={openDialogDeleteCourse}
                                fullWidth
                                variant="contained"
                                style={{ color: '#8d8686'}}
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