import React, {FC, useState, useEffect} from "react";
import TextField from "@material-ui/core/TextField";
import {Select, MenuItem, InputLabel, FormControl} from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Navigate} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import { RegisterExpertViewModel, CoursePreviewView, HomeworkViewModel } from "../../api/";
import "./Styles/Register.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import PermIdentityOutlinedIcon from '@material-ui/icons/PermIdentityOutlined';
import Avatar from "@material-ui/core/Avatar";
import Utils from "../../services/Utils";

interface  ICommonState {
    lecturerCourses: CoursePreviewView[];
    courseHomeworks: HomeworkViewModel[];
    error: string[];
}

interface LoginProps {
    onLogin: () => void;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    button: {
        marginTop: theme.spacing(1)
    },
}))

const RegisterExpert: FC<LoginProps> = (props) => {
    const classes = useStyles()
    
    const getInitialTokenExpirationDate = () => {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const expirationDate = new Date(Date.now() + oneWeek)
        expirationDate.setHours(0, 0, 0, 0)
        return expirationDate
    }
    
    const [registerState, setRegisterState] = useState<RegisterExpertViewModel>({
        name: "",
        surname: "",
        email: "",
        middleName: "",
        companyName: "",
        bio: "",
        courseId: -1,
        homeworkId: -1,
        tokenExpirationTime: getInitialTokenExpirationDate()
    })
    
    const [commonState, setCommonState] = useState<ICommonState>({
        lecturerCourses: [],
        courseHomeworks: [],
        error: []
    })
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки

    useEffect(() => {
        const fetchCourses = async () => {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet();
            setCommonState(prevState => ({
                ...prevState,
                lecturerCourses: courses
            }));
        };
        
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchHomeworks = async () => {
            const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(registerState.courseId);
            setCommonState(prevState => ({
                ...prevState,
                courseHomeworks: courseViewModel.homeworks ?? []
            }));
        };

        fetchHomeworks();
    }, [registerState.courseId]);
    
    const handleSubmit = async (e: any) => {
        // e.preventDefault();
        // if (registerState.password !== registerState.passwordConfirm) {
        //     setPasswordError("Пароли не совпадают");
        //     setIsRegisterButtonDisabled(true);
        //     return;
        // }
        // e.preventDefault()
        // try {
        //     const result = await ApiSingleton.authService.register(registerState)
        //     setCommonState((prevState) => ({
        //         ...prevState,
        //         error: result!.error!,
        //         loggedIn: result.loggedIn
        //     }))
        //     if (result.loggedIn) {
        //         props.onLogin()
        //     }
        // }
        // catch (e) {
        //     setCommonState((prevState) => ({
        //         ...prevState,
        //         error: ['Сервис недоступен'],
        //         loggedIn: false
        //     }))
        // }
        // if (commonState.loggedIn) {
        //     window.location.assign("/")
        // }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} style={{ color: 'white', backgroundColor: '#ba2e2e' }}>
                    <PermIdentityOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Регистрация эксперта
                </Typography>
                {commonState.error.length > 0 && (
                    <p style={{ color: "red", marginBottom: "0" }}>{commonState.error}</p>
                )}
                <form onSubmit={handleSubmit} className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required 
                                label="Имя" 
                                variant="outlined" 
                                name={registerState.name} 
                                onChange={(e) => 
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState, 
                                        name: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                fullWidth 
                                label="Фамилия" 
                                variant="outlined" 
                                name={registerState.surname} 
                                onChange={(e) => 
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState, 
                                        surname: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth
                                label="Отчество" 
                                variant="outlined" 
                                name={registerState.middleName} 
                                onChange={(e) => 
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState, 
                                        middleName: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                name={registerState.email}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        email: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Компания"
                                variant="outlined"
                                value={registerState.companyName}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        companyName: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                label="Дополнительная информация (bio)"
                                variant="outlined"
                                value={registerState.bio}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        bio: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="datetime-local"
                                label="Срок действия ссылки"
                                variant="outlined"
                                value={Utils.toISOString(registerState.tokenExpirationTime)}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        tokenExpirationTime: new Date(e.target.value)
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth>
                                <InputLabel id="course-select-label">Курс</InputLabel>
                                <Select
                                    required
                                    fullWidth
                                    label="Курс"
                                    labelId="course-select-label"
                                    value={registerState.courseId === -1 ? '' : registerState.courseId}
                                    onChange={async (e) =>
                                    {
                                        const selectedId = Number(e.target.value)
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            courseId: selectedId
                                        }));
                                    }}>
                                    {commonState.lecturerCourses.map((courseViewModel, i) =>
                                        <MenuItem key={i} value={courseViewModel.id}>
                                            {courseViewModel.name}
                                        </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth>
                                <InputLabel id="homework-select-label">Домашняя работа</InputLabel>
                                <Select
                                    required
                                    fullWidth
                                    label="Домашняя работа"
                                    labelId="homework-select-label"
                                    value={registerState.homeworkId === -1 ? '' : registerState.homeworkId}
                                    onChange={async (e) =>
                                    {
                                        const selectedId = Number(e.target.value)
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            homeworkId: selectedId
                                        }));
                                    }}>
                                    {commonState.courseHomeworks.map((homeworkViewModel, i) =>
                                        <MenuItem value={homeworkViewModel.id}>
                                            {homeworkViewModel.title}
                                        </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button
                        style={{ marginTop: '15px'}}
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isRegisterButtonDisabled}
                    >
                        Зарегистрировать эксперта
                    </Button>
                </form>
            </div>
        </Container>
    )
}

export default RegisterExpert
