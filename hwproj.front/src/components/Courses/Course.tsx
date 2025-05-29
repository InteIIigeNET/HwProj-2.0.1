import * as React from "react";
import {useSearchParams} from "react-router-dom";
import {AccountDataDto, CourseViewModel, FileInfoDTO, HomeworkViewModel, StatisticsCourseMatesModel} from "@/api";
import StudentStats from "./StudentStats";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Tab, Tabs, IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {FC, useEffect, useState} from "react";
import {
    Alert,
    AlertTitle, Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle, Grid, ListItemIcon, ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
    TextField,
    DialogActions
} from "@mui/material";
import {CourseExperimental} from "./CourseExperimental";
import {useParams, useNavigate} from 'react-router-dom';
import MentorsList from "../Common/MentorsList";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';
import NameBuilder from "../Utils/NameBuilder";
import {QRCodeSVG} from 'qrcode.react';
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {useSnackbar} from 'notistack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import {MoreVert} from "@mui/icons-material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import Avatar from "@material-ui/core/Avatar";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {makeStyles} from '@material-ui/core/styles';
import Autocomplete from '@mui/material/Autocomplete';
import ValidationUtils from "../Utils/ValidationUtils";

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
}

interface ICourseState {
    isFound: boolean;
    course: CourseViewModel;
    courseHomeworks: HomeworkViewModel[];
    mentors: AccountDataDto[];
    acceptedStudents: AccountDataDto[];
    newStudents: AccountDataDto[];
    studentSolutions: StatisticsCourseMatesModel[];
    showQrCode: boolean;
}

interface IPageState {
    tabValue: TabValue
}

interface InviteStudentDialogProps {
    courseId: number;
    open: boolean;
    onClose: () => void;
    onStudentInvited: () => Promise<void>;
    email?: string;
}

interface RegisterStudentDialogProps {
    courseId: number;
    open: boolean;
    onClose: () => void;
    onStudentRegistered: () => Promise<void>;
    initialEmail?: string;
}

const RegisterStudentDialog: FC<RegisterStudentDialogProps> = ({courseId, open, onClose, onStudentRegistered, initialEmail}) => {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [email, setEmail] = useState(initialEmail || "");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const registerStudent = async () => {
        setIsRegistering(true);
        setErrors([]);
        try {
            await ApiSingleton.coursesApi.coursesInviteStudent({
                courseId: courseId,
                email: email,
                name: name,
                surname: surname,
                middleName: middleName
            });
            enqueueSnackbar("Студент успешно зарегистрирован и приглашен", {variant: "success"});
            onClose();
            await onStudentRegistered();
        } catch (error) {
            const responseErrors = await ErrorsHandler.getErrorMessages(error as Response);
            if (responseErrors.length > 0) {
                setErrors(responseErrors);
            } else {
                setErrors(['Не удалось зарегистрировать студента']);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !isRegistering && onClose()}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Grid container>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#00AB00'}}>
                            <MailOutlineIcon/>
                        </Avatar>
                    </Grid>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        <Typography variant="h5">
                            Зарегистрировать студента
                        </Typography>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {errors.length > 0 && (
                    <Typography color="error" align="center" style={{marginBottom: '16px'}}>
                        {errors[0]}
                    </Typography>
                )}
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-email"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Имя"
                                variant="outlined"
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-name"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Фамилия"
                                variant="outlined"
                                size="small"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-surname"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Отчество"
                                variant="outlined"
                                size="small"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-middlename"
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-end"
                        container
                        style={{marginTop: '16px'}}
                    >
                        <Grid item>
                            <Button
                                variant="text"
                                onClick={registerStudent}
                                disabled={!email || !name || !surname || isRegistering}
                                style={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    color: '#3f51b5',
                                    transition: 'opacity 0.3s ease',
                                    opacity: (!email || !name || !surname || isRegistering) ? 0.5 : 1,
                                    padding: '6px 16px',
                                    marginRight: '8px'
                                }}
                            >
                                {isRegistering ? 'Регистрация...' : 'Зарегистрировать'}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="text"
                                onClick={onClose}
                                disabled={isRegistering}
                                style={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    color: '#3f51b5',
                                    transition: 'opacity 0.3s ease',
                                    opacity: isRegistering ? 0.5 : 1,
                                    padding: '6px 16px'
                                }}
                            >
                                Закрыть
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const InviteStudentDialog: FC<InviteStudentDialogProps> = ({courseId, open, onClose, onStudentInvited, email: initialEmail}) => {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [email, setEmail] = useState(initialEmail || "");
    const [errors, setErrors] = useState<string[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [students, setStudents] = useState<AccountDataDto[]>([]);

    const getStudents = async () => {
        try {
            const data = await ApiSingleton.accountApi.accountGetAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    const getCleanEmail = (input: string) => {
        return input.split(' / ')[0].trim();
    };

    const inviteStudent = async () => {
        setIsInviting(true);
        setErrors([]);
        try {
            const cleanEmail = getCleanEmail(email);
            await ApiSingleton.coursesApi.coursesInviteStudent({
                courseId: courseId,
                email: cleanEmail,
                name: "",
                surname: "",
                middleName: ""
            });
            enqueueSnackbar("Студент успешно приглашен", {variant: "success"});
            setEmail("");
            onClose();
            await onStudentInvited();
        } catch (error) {
            const responseErrors = await ErrorsHandler.getErrorMessages(error as Response);
            if (responseErrors.length > 0) {
                setErrors(responseErrors);
            } else {
                setErrors(['Студент с такой почтой не найден']);
            }
        } finally {
            setIsInviting(false);
        }
    };

    const hasMatchingStudent = () => {
        const cleanEmail = getCleanEmail(email);
        return students.some(student => 
            student.email === cleanEmail ||
            `${student.surname} ${student.name}`.includes(cleanEmail)
        );
    };
    
    return (
        <>
            <Dialog
                open={open}
                onClose={() => !isInviting && onClose()}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Grid container>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#00AB00'}}>
                                <MailOutlineIcon/>
                            </Avatar>
                        </Grid>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Typography variant="h5">
                                Пригласить студента
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    {errors.length > 0 && (
                        <Typography color="error" align="center" style={{marginBottom: '16px'}}>
                            {errors[0]}
                        </Typography>
                    )}
                    <form className={classes.form}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                            <Autocomplete
                                freeSolo
                                options={students}
                                getOptionLabel={(option) => 
                                    typeof option === 'string' 
                                        ? option 
                                        : `${option.email} / ${option.surname} ${option.name}`
                                }
                                inputValue={email}
                                onInputChange={(event, newInputValue) => {
                                    setEmail(newInputValue);
                                }}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Grid container alignItems="center">
                                            <Grid item>
                                                <Box fontWeight="fontWeightMedium">
                                                    {option.email} /
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <Typography style={{marginLeft: '3px'}}>
                                                    {option.surname} {option.name}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Введите email или ФИО"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={1}
                            justifyContent="flex-end"
                            style={{marginTop: '16px'}}
                        >
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowRegisterDialog(true);
                                        onClose();
                                    }}
                                    disabled={hasMatchingStudent() || !getCleanEmail(email)}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: hasMatchingStudent() || !getCleanEmail(email) ? 0.5 : 1,
                                        padding: '6px 16px',
                                        marginRight: '8px'
                                    }}
                                >
                                    Зарегистрировать
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={inviteStudent}
                                    disabled={!hasMatchingStudent() || isInviting}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: !hasMatchingStudent() || isInviting ? 0.5 : 1,
                                        padding: '6px 16px',
                                        marginRight: '8px'
                                    }}
                                >
                                    {isInviting ? 'Отправка...' : 'Пригласить'}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={onClose}
                                    disabled={isInviting}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: isInviting ? 0.5 : 1,
                                        padding: '6px 16px'
                                    }}
                                >
                                    Закрыть
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>
            
            <RegisterStudentDialog
                courseId={courseId}
                open={showRegisterDialog}
                onClose={() => setShowRegisterDialog(false)}
                onStudentRegistered={onStudentInvited}
                initialEmail={getCleanEmail(email)}
            />
        </>
    );
};

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

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const {enqueueSnackbar} = useSnackbar()
    const classes = useStyles()

    const [courseState, setCourseState] = useState<ICourseState>({
        isFound: false,
        course: {},
        courseHomeworks: [],
        mentors: [],
        acceptedStudents: [],
        newStudents: [],
        studentSolutions: [],
        showQrCode: false
    })
    const [studentSolutions, setStudentSolutions] = useState<StatisticsCourseMatesModel[]>([])
    const [courseFilesInfo, setCourseFilesInfo] = useState<FileInfoDTO[]>([])
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [pageState, setPageState] = useState<IPageState>({
        tabValue: "homeworks"
    })

    const {
        isFound,
        course,
        mentors,
        newStudents,
        acceptedStudents,
        courseHomeworks,
    } = courseState

    const userId = ApiSingleton.authService.getUserId()

    const isLecturer = ApiSingleton.authService.isLecturer()
    const isExpert = ApiSingleton.authService.isExpert()
    const isMentor = isLecturer || isExpert
    const isCourseMentor = mentors.some(t => t.userId === userId)

    const isSignedInCourse = newStudents!.some(cm => cm.userId === userId)

    const isAcceptedStudent = acceptedStudents!.some(cm => cm.userId === userId)

    const showStatsTab = isCourseMentor || isAcceptedStudent
    const showApplicationsTab = isCourseMentor

    const changeTab = (newTab: string) => {
        if (isAcceptableTabValue(newTab) && newTab !== pageState.tabValue) {
            if (newTab === "stats" && !showStatsTab) return;
            if (newTab === "applications" && !showApplicationsTab) return;

            setPageState(prevState => ({
                ...prevState,
                tabValue: newTab
            }));
        }
    }

    const setCurrentState = async () => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(+courseId!)

        // У пользователя изменилась роль (иначе он не может стать лектором в курсе),
        // однако он все ещё использует токен с прежней ролью
        const shouldRefreshToken =
            !isMentor &&
            course &&
            course.mentors!.some(t => t.userId === userId)
        if (shouldRefreshToken) {
            const newToken = await ApiSingleton.accountApi.accountRefreshToken()
            newToken.value && ApiSingleton.authService.refreshToken(newToken.value.accessToken!)
            return
        }

        setCourseState(prevState => ({
            ...prevState,
            isFound: true,
            course: course,
            courseHomeworks: course.homeworks!,
            courseFilesInfo: courseFilesInfo,
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
        }))
    }

    const getCourseFilesInfo = async () => {
        let courseFilesInfo = [] as FileInfoDTO[]
        try {
            courseFilesInfo = await ApiSingleton.filesApi.filesGetFilesInfo(+courseId!)
        } catch (e) {
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 4000});
        }
        setCourseFilesInfo(courseFilesInfo)
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    useEffect(() => {
        ApiSingleton.statisticsApi.statisticsGetCourseStatistics(+courseId!)
            .then(res => setStudentSolutions(res))
    }, [courseId])

    useEffect(() => {
        getCourseFilesInfo()
    }, [courseId])

    useEffect(() => changeTab(tab || "homeworks"), [tab, courseId, isFound])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi.coursesSignInCourse(+courseId!)
            .then(() => setCurrentState());
    }

    const {tabValue} = pageState
    const searchedHomeworkId = searchParams.get("homeworkId")

    const unratedSolutionsCount = studentSolutions
        .flatMap(x => x.homeworks)
        .flatMap(x => x!.tasks)
        .filter(t => t!.solution!.slice(-1)[0]?.state === 0)
        .length

    const [lecturerStatsState, setLecturerStatsState] = useState(false);

    const CourseMenu: FC = () => {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <div style={{paddingTop: 4}}>
                <IconButton
                    aria-label="more"
                    id="long-button"
                    size={"small"}
                    onClick={handleClick}
                >
                    <MoreVert fontSize={"small"}/>
                </IconButton>
                <Menu
                    id="long-menu"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    {isCourseMentor && isLecturer &&
                        <MenuItem onClick={() => navigate(`/courses/${courseId}/editInfo`)}>
                            <ListItemIcon>
                                <EditIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Управление</ListItemText>
                        </MenuItem>}
                    <MenuItem onClick={() => setCourseState(prevState => ({
                        ...prevState,
                        showQrCode: true
                    }))}>
                        <ListItemIcon>
                            <QrCode2Icon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Поделиться</ListItemText>
                    </MenuItem>
                    {isCourseMentor && 
                        <MenuItem onClick={() => {
                            setShowInviteDialog(true)
                        }}>
                            <ListItemIcon>
                                <MailOutlineIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Пригласить студента</ListItemText>
                        </MenuItem>
                    }
                    {isCourseMentor && isLecturer && <MenuItem onClick={() => setLecturerStatsState(true)}>
                        <ListItemIcon>
                            <AssessmentIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Статистика <br/>по преподавателям</ListItemText>
                    </MenuItem>}
                </Menu>
            </div>
        );
    }

    if (isFound) {
        return (
            <div className="container">
                <Dialog
                    open={courseState.showQrCode}
                    onClose={() => setCourseState(prevState => ({...prevState, showQrCode: false}))}
                >
                    <DialogTitle>
                        Поделитесь ссылкой на курс с помощью QR-кода
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex"
                             justifyContent="center"
                             alignItems="center">
                            <QRCodeSVG size={200} value={window.location.href.replace(tabValue, "")}/>
                        </Box>
                    </DialogContent>
                </Dialog>

                <InviteStudentDialog
                    courseId={+courseId!}
                    open={showInviteDialog}
                    onClose={() => setShowInviteDialog(false)}
                    onStudentInvited={setCurrentState}
                />

                <Grid style={{marginTop: "15px"}}>
                    <Grid container direction={"column"} spacing={2}>
                        {course.isCompleted && <Grid item>
                            <Alert severity="warning">
                                <AlertTitle>Курс завершен!</AlertTitle>
                                {isAcceptedStudent
                                    ? "Вы можете отправлять решения и получать уведомления об их проверке."
                                    : isCourseMentor && !isExpert
                                        ? "Вы продолжите получать уведомления о новых заявках на вступление и решениях."
                                        : !isMentor ? "Вы можете записаться на курс и отправлять решения." : ""}
                            </Alert>
                        </Grid>}
                        <Grid item container xs={12} alignItems="center"
                              justifyContent="space-between">
                            <Grid item>
                                <Stack direction={"row"} spacing={1} alignItems={"start"}>
                                    <Typography component="div" style={{fontSize: '22px'}}>
                                        {NameBuilder.getCourseFullName(course.name!, course.groupName)}
                                    </Typography>
                                    <CourseMenu/>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center" justifyContent="flex-end">
                                    <Grid item>
                                        <MentorsList mentors={mentors}/>
                                    </Grid>
                                    {lecturerStatsState &&
                                        <LecturerStatistics
                                            courseId={+courseId!}
                                            onClose={() => setLecturerStatsState(false)}
                                        />
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item style={{width: 187}}>
                            {!isSignedInCourse && !isMentor && !isAcceptedStudent && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => joinCourse()}
                                >
                                    Записаться
                                </Button>
                            )}
                            {isSignedInCourse && !isAcceptedStudent &&
                                <Typography style={{fontSize: '15px'}}>
                                    Ваша заявка рассматривается
                                </Typography>
                            }
                        </Grid>
                    </Grid>
                    <Tabs
                        style={{marginBottom: 10}}
                        variant="scrollable"
                        scrollButtons={"auto"}
                        value={tabValue === "homeworks" ? 0 : tabValue === "stats" ? 1 : 2}
                        indicatorColor="primary"
                        onChange={(event, value) => {
                            if (value === 0 && !isExpert) navigate(`/courses/${courseId}/homeworks`)
                            if (value === 1) navigate(`/courses/${courseId}/stats`)
                            if (value === 2 && !isExpert) navigate(`/courses/${courseId}/applications`)
                        }}
                    >
                        {!isExpert &&
                            <Tab label={<div>Задания</div>}/>}
                        {showStatsTab && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Решения</div>
                                <Chip size={"small"} color={"default"}
                                      label={unratedSolutionsCount}/>
                            </Stack>
                        }/>}
                        {showApplicationsTab && !isExpert && <Tab label={
                            <Stack direction="row" spacing={1}>
                                <div>Заявки</div>
                                <Chip size={"small"} color={"default"}
                                      label={newStudents.length}/>
                            </Stack>}/>}
                    </Tabs>
                    {tabValue === "homeworks" && <CourseExperimental
                        courseId={+courseId!}
                        homeworks={courseHomeworks}
                        courseFilesInfo={courseFilesInfo}
                        isMentor={isCourseMentor}
                        studentSolutions={studentSolutions}
                        isStudentAccepted={isAcceptedStudent}
                        selectedHomeworkId={searchedHomeworkId == null ? undefined : +searchedHomeworkId}
                        userId={userId!}
                        onHomeworkUpdate={({fileInfos, homework, isDeleted}) => {
                            const homeworkIndex = courseState.courseHomeworks.findIndex(x => x.id === homework.id)
                            const homeworks = courseState.courseHomeworks

                            if (isDeleted) homeworks.splice(homeworkIndex, 1)
                            else if (homeworkIndex === -1) homeworks.push(homework)
                            else homeworks[homeworkIndex] = homework

                            setCourseState(prevState => ({
                                ...prevState,
                                courseHomeworks: homeworks
                            }))

                            if (fileInfos.length > 0 || isDeleted) {
                                const newCourseFiles = courseFilesInfo
                                    .filter(x => x.homeworkId !== homework.id)
                                    .concat(isDeleted ? [] : fileInfos)
                                setCourseFilesInfo(newCourseFiles)
                            }
                        }}
                        onTaskUpdate={update => {
                            const task = update.task
                            const homeworks = courseState.courseHomeworks
                            const homework = homeworks.find(x => x.id === task.homeworkId)!
                            const tasks = [...homework.tasks!]
                            const taskIndex = tasks.findIndex(x => x!.id === task.id)

                            if (update.isDeleted) tasks.splice(taskIndex, 1)
                            else if (taskIndex !== -1) tasks![taskIndex] = task
                            else tasks.push(task)

                            homework.tasks = tasks

                            setCourseState(prevState => ({
                                ...prevState,
                                courseHomeworks: homeworks
                            }))
                        }}
                    />
                    }
                    {tabValue === "stats" &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={12}>
                                <StudentStats
                                    homeworks={courseHomeworks}
                                    userId={userId as string}
                                    isMentor={isCourseMentor}
                                    course={courseState.course}
                                    solutions={studentSolutions}
                                />
                            </Grid>
                        </Grid>}
                    {tabValue === "applications" && showApplicationsTab &&
                        <NewCourseStudents
                            onUpdate={() => setCurrentState()}
                            course={courseState.course}
                            students={courseState.newStudents}
                            courseId={courseId!}
                        />
                    }
                </Grid>
            </div>
        );
    }
    return <div className="container">
        <DotLottieReact
            src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
            loop
            autoplay
        />
    </div>
}

export default Course