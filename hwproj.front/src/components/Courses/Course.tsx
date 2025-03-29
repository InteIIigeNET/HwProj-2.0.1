import * as React from "react";
import {Link as RouterLink, useSearchParams} from "react-router-dom";
import {AccountDataDto, CourseViewModel, FileInfoDTO, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import StudentStats from "./StudentStats";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, Tab, Tabs, Typography, IconButton, CircularProgress} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Alert, AlertTitle, Chip, Dialog, DialogContent, DialogTitle, Stack, Tooltip} from "@mui/material";
import CourseExperimental from "./CourseExperimental";
import {useParams, useNavigate} from 'react-router-dom';
import MentorsList from "../Common/MentorsList";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';
import NameBuilder from "../Utils/NameBuilder";
import {QRCodeSVG} from 'qrcode.react';
import {Center} from "@skbkontur/react-ui";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {useSnackbar} from 'notistack';
import QrCode2Icon from '@mui/icons-material/QrCode2';

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
}

interface ICourseProps {
    isReadingMode?: boolean;
}

interface ICourseState {
    isFound: boolean;
    course: CourseViewModel;
    courseHomework: HomeworkViewModel[];
    createHomework: boolean;
    mentors: AccountDataDto[];
    acceptedStudents: AccountDataDto[];
    newStudents: AccountDataDto[];
    isReadingMode: boolean;
    studentSolutions: StatisticsCourseMatesModel[];
    showQrCode: boolean;
}

interface IPageState {
    tabValue: TabValue
}

const styles = makeStyles(() => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const Course: React.FC<ICourseProps> = (props: ICourseProps) => {
    const {courseId, tab} = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const classes = styles()
    const {enqueueSnackbar} = useSnackbar()

    const [courseState, setCourseState] = useState<ICourseState>({
        isFound: false,
        course: {},
        courseHomework: [],
        createHomework: false,
        mentors: [],
        acceptedStudents: [],
        newStudents: [],
        isReadingMode: props.isReadingMode ?? true,
        studentSolutions: [],
        showQrCode: false
    })

    const [courseFilesInfo, setCourseFilesInfo] = useState<FileInfoDTO[]>([])

    const [pageState, setPageState] = useState<IPageState>({
        tabValue: "homeworks"
    })

    const {
        isFound,
        course,
        createHomework,
        mentors,
        newStudents,
        acceptedStudents,
        isReadingMode,
        studentSolutions,
    } = courseState;

    const getPostedHomeworks = (homeworks: HomeworkViewModel[]) =>
        homeworks.filter(h => !h.isDeferred).map(h => ({
            ...h,
            tasks: h.tasks?.filter(t => !t.isDeferred)
        }))

    const userId = ApiSingleton.authService.getUserId()

    const isLecturer = ApiSingleton.authService.isLecturer()
    const isExpert = ApiSingleton.authService.isExpert()
    const isMentor = isLecturer || isExpert
    const isCourseMentor = mentors.some(t => t.userId === userId)

    const courseHomeworks = isCourseMentor && isReadingMode
        ? getPostedHomeworks(courseState.courseHomework)
        : courseState.courseHomework

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

        const solutions = await ApiSingleton.statisticsApi.statisticsGetCourseStatistics(+courseId!)

        setCourseState(prevState => ({
            ...prevState,
            isFound: true,
            course: course,
            courseHomework: course.homeworks!,
            courseFilesInfo: courseFilesInfo,
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
            studentSolutions: solutions
        }))
    }

    const getCourseFilesInfo = async () => {
        // В случае, если сервис файлов недоступен, показываем пользователю сообщение
        // и не блокируем остальную функциональность системы
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
        .filter(t => t!.solution!.slice(-1)[0]?.state === 0) //last solution
        .length

    const [lecturerStatsState, setLecturerStatsState] = useState(false);

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
                        <Center>
                            <QRCodeSVG size={200} value={window.location.href.replace(tabValue, "")}/>
                        </Center>
                    </DialogContent>
                </Dialog>
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
                        <Grid item container xs={12} className={classes.info} alignItems="center"
                              justifyContent="space-between">
                            <Grid item>
                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    <Typography style={{fontSize: '22px'}}>
                                        {NameBuilder.getCourseFullName(course.name!, course.groupName)}
                                    </Typography>
                                    <QrCode2Icon fontSize="small"
                                                 style={{marginBottom: "18px", cursor: "pointer"}}
                                                 onClick={() => setCourseState(prevState => ({
                                                     ...prevState,
                                                     showQrCode: true
                                                 }))}/>
                                    {isCourseMentor && isLecturer && (
                                        <Tooltip arrow placement={"right"}
                                                 PopperProps={{
                                                     modifiers: [{name: "offset", options: {offset: [0, -5],}}]
                                                 }}
                                                 title="Редактировать курс">
                                            <RouterLink to={`/courses/${courseId}/editInfo`}
                                                        style={{marginBottom: "20px"}}>
                                                <EditIcon style={{fontSize: 15}}/>
                                            </RouterLink>
                                        </Tooltip>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center" justifyContent="flex-end">
                                    <Grid item>
                                        <MentorsList mentors={mentors}/>
                                    </Grid>
                                    {isCourseMentor && isLecturer && isReadingMode &&
                                        <Grid item>
                                            <IconButton size="small" style={{marginLeft: 5}}
                                                        onClick={() => setLecturerStatsState(true)}>
                                                <AssessmentIcon>
                                                    Статистика лекторов по курсу
                                                </AssessmentIcon>
                                            </IconButton>
                                        </Grid>
                                    }
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
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <div>Задания</div>
                                        {isCourseMentor && <IconButton
                                            size="small"
                                            onClick={() =>
                                                setCourseState(prevState => ({
                                                        ...prevState,
                                                        isReadingMode: !isReadingMode
                                                    })
                                                )}
                                            style={{backgroundColor: '#f1f1f1', padding: 3, marginLeft: 8}}
                                        >
                                            <Tooltip arrow placement={"top"}
                                                     PopperProps={{
                                                         modifiers: [{name: "offset", options: {offset: [0, -5],}}]
                                                     }}
                                                     title={isReadingMode ? "В режим редактирования" : "В режим чтения"}>
                                                {isReadingMode
                                                    ? <EditIcon style={{fontSize: 15}}/>
                                                    : <VisibilityIcon style={{fontSize: 15}}/>}
                                            </Tooltip>
                                        </IconButton>}
                                    </Stack>
                                }
                            />}
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
                    {tabValue === "homeworks" && <div>
                        {
                            isReadingMode
                                ?
                                <CourseExperimental
                                    homeworks={courseHomeworks}
                                    courseFilesInfo={courseFilesInfo}
                                    isMentor={isCourseMentor}
                                    studentSolutions={studentSolutions}
                                    isStudentAccepted={isAcceptedStudent}
                                    selectedHomeworkId={searchedHomeworkId == null ? undefined : +searchedHomeworkId}
                                    userId={userId!}/>
                                :
                                <div>
                                    {createHomework && (
                                        <div>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <AddHomework
                                                        id={+courseId!}
                                                        onCancel={() => setCurrentState()}
                                                        onSubmit={() => setCurrentState()}
                                                        previousHomeworks={courseState.courseHomework}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <CourseHomework
                                                        onUpdate={() => setCurrentState()}
                                                        isStudent={isAcceptedStudent}
                                                        isMentor={isCourseMentor}
                                                        isReadingMode={isReadingMode}
                                                        homework={courseHomeworks}
                                                        courseFilesInfo={courseFilesInfo}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </div>
                                    )}
                                    {isLecturer && !createHomework && (
                                        <div>
                                            <Grid container>
                                                {!isReadingMode! &&
                                                    <Button
                                                        style={{marginBottom: 15}}
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            setCourseState(prevState => ({
                                                                ...prevState,
                                                                createHomework: true
                                                            }));
                                                        }}
                                                    >
                                                        Добавить задание
                                                    </Button>
                                                }
                                                <CourseHomework
                                                    onUpdate={() => setCurrentState()}
                                                    isStudent={isAcceptedStudent}
                                                    isMentor={isCourseMentor}
                                                    isReadingMode={isReadingMode}
                                                    homework={courseHomeworks}
                                                    courseFilesInfo={courseFilesInfo}
                                                />
                                            </Grid>
                                        </div>
                                    )}
                                    {!isCourseMentor && (
                                        <CourseHomework
                                            onUpdate={() => setCurrentState()}
                                            homework={courseHomeworks}
                                            isStudent={isAcceptedStudent}
                                            isMentor={isCourseMentor}
                                            isReadingMode={isReadingMode}
                                            courseFilesInfo={courseFilesInfo}
                                        />
                                    )}
                                </div>
                        }
                    </div>}
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
        <p>Загрузка...</p>
        <CircularProgress/>
    </div>
}

export default Course
