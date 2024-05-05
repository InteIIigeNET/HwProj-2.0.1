import React, {FC, useState, useEffect} from "react";
import TextField from "@material-ui/core/TextField";
import {Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions} from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Navigate} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import { RegisterExpertViewModel, CoursePreviewView, HomeworkViewModel } from "../../api/";
import "./Styles/Register.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import Avatar from "@material-ui/core/Avatar";
import Utils from "../../services/Utils";
// import {CopyField, DefaultCopyField} from "@eisberg-labs/mui-copy-field";

interface  ICommonState {
    lecturerCourses: CoursePreviewView[];
    courseHomeworks: HomeworkViewModel[];
    expertToken: string | undefined;
    error: string[];
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

const RegisterExpert: FC = () => {
    const classes = useStyles()
    
    const getInitialTokenExpirationDate = () => {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const expirationDate = new Date(Date.now() + oneWeek)
        expirationDate.setHours(0, 0, 0, 0)
        return expirationDate
    }
    
    const [expertRegisterState, setExpertRegisterState] = useState<RegisterExpertViewModel>({
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
        error: [],
        expertToken: ""
    })
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки
    const [isOpenRegisterResult, setIsOpenRegisterExpertResult] = useState<boolean>(false)

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
            const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(expertRegisterState.courseId);
            setCommonState(prevState => ({
                ...prevState,
                courseHomeworks: courseViewModel.homeworks ?? []
            }));
        };

        fetchHomeworks();
    }, [expertRegisterState.courseId]);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const result = await ApiSingleton.authService.registerExpert(expertRegisterState);
            setCommonState((prevState) => ({
                ...prevState,
                error: result!.error!,
                expertToken: result.token,
            }));
            openRegisterResult();
        }
        catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                error: ['Сервис недоступен'],
            }))
        }
    }

    const closeRegisterResult = () => {
        setIsOpenRegisterExpertResult(false)
    }

    const openRegisterResult = () => {
        setIsOpenRegisterExpertResult(true)
    }

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <div className={classes.paper}>
                    <Avatar className={classes.avatar} style={{ color: 'white', backgroundColor: '#00AB00' }}>
                        <PersonAddOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Зарегистрировать эксперта
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
                                    name={expertRegisterState.name} 
                                    onChange={(e) => 
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
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
                                    name={expertRegisterState.surname} 
                                    onChange={(e) => 
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
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
                                    name={expertRegisterState.middleName} 
                                    onChange={(e) => 
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
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
                                    name={expertRegisterState.email}
                                    onChange={(e) =>
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
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
                                    value={expertRegisterState.companyName}
                                    onChange={(e) =>
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
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
                                    value={expertRegisterState.bio}
                                    onChange={(e) =>
                                    {
                                        e.persist()
                                        setExpertRegisterState((prevState) => ({
                                            ...prevState,
                                            bio: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            {/*<Grid item xs={12}>*/}
                            {/*    <TextField*/}
                            {/*        required*/}
                            {/*        fullWidth*/}
                            {/*        type="datetime-local"*/}
                            {/*        label="Срок действия ссылки"*/}
                            {/*        variant="outlined"*/}
                            {/*        value={Utils.toISOString(expertRegisterState.tokenExpirationTime)}*/}
                            {/*        onChange={(e) =>*/}
                            {/*        {*/}
                            {/*            e.persist()*/}
                            {/*            setExpertRegisterState((prevState) => ({*/}
                            {/*                ...prevState,*/}
                            {/*                tokenExpirationTime: new Date(e.target.value)*/}
                            {/*            }))*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/*</Grid>*/}
                            {/*<Grid item xs={12} sm={12}>*/}
                            {/*    <FormControl fullWidth>*/}
                            {/*        <InputLabel id="course-select-label">Курс</InputLabel>*/}
                            {/*        <Select*/}
                            {/*            required*/}
                            {/*            fullWidth*/}
                            {/*            label="Курс"*/}
                            {/*            labelId="course-select-label"*/}
                            {/*            value={expertRegisterState.courseId === -1 ? '' : expertRegisterState.courseId}*/}
                            {/*            onChange={async (e) =>*/}
                            {/*            {*/}
                            {/*                const selectedId = Number(e.target.value)*/}
                            {/*                setExpertRegisterState((prevState) => ({*/}
                            {/*                    ...prevState,*/}
                            {/*                    courseId: selectedId*/}
                            {/*                }));*/}
                            {/*            }}>*/}
                            {/*            {commonState.lecturerCourses.map((courseViewModel, i) =>*/}
                            {/*                <MenuItem key={i} value={courseViewModel.id}>*/}
                            {/*                    {courseViewModel.name}*/}
                            {/*                </MenuItem>)}*/}
                            {/*        </Select>*/}
                            {/*    </FormControl>*/}
                            {/*</Grid>*/}
                            {/*<Grid item xs={12} sm={12}>*/}
                            {/*    <FormControl fullWidth>*/}
                            {/*        <InputLabel id="homework-select-label">Домашняя работа</InputLabel>*/}
                            {/*        <Select*/}
                            {/*            required*/}
                            {/*            fullWidth*/}
                            {/*            label="Домашняя работа"*/}
                            {/*            labelId="homework-select-label"*/}
                            {/*            value={expertRegisterState.homeworkId === -1 ? '' : expertRegisterState.homeworkId}*/}
                            {/*            onChange={async (e) =>*/}
                            {/*            {*/}
                            {/*                const selectedId = Number(e.target.value)*/}
                            {/*                setExpertRegisterState((prevState) => ({*/}
                            {/*                    ...prevState,*/}
                            {/*                    homeworkId: selectedId*/}
                            {/*                }));*/}
                            {/*            }}>*/}
                            {/*            {commonState.courseHomeworks.map((homeworkViewModel, i) =>*/}
                            {/*                <MenuItem value={homeworkViewModel.id}>*/}
                            {/*                    {homeworkViewModel.title}*/}
                            {/*                </MenuItem>)}*/}
                            {/*        </Select>*/}
                            {/*    </FormControl>*/}
                            {/*</Grid>*/}
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
            {isOpenRegisterResult && (
                commonState.error.length === 0 &&
                        <Dialog open={true} onClose={closeRegisterResult} aria-labelledby="form-dialog-title">
                            <DialogTitle id="form-dialog-title">
                                Эксперт успешно зарегистрирован
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                </DialogContentText>
                                <div style={{marginTop: '3px'}}>
                                    {/*<DefaultCopyField*/}
                                    {/*    label="Ссылка"*/}
                                    {/*    value={ApiSingleton.authService.buildInvitationLink(commonState.expertToken!)}*/}
                                    {/*    fullWidth*/}
                                    {/*/>*/}
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={closeRegisterResult}
                                    color="primary"
                                    variant="contained"
                                >
                                    Закрыть
                                </Button>
                            </DialogActions>
                        </Dialog>
            )}
        </div>
    )
}

export default RegisterExpert
