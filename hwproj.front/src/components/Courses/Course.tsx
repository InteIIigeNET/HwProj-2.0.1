import * as React from "react";
import {Link as RouterLink, useSearchParams} from "react-router-dom";
import {AccountDataDto, CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api";
import CourseHomework from "../Homeworks/CourseHomework";
import AddHomework from "../Homeworks/AddHomework";
import StudentStats from "./StudentStats";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Grid, Tab, Tabs, Typography, IconButton, Switch, CircularProgress} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Alert, AlertTitle, Chip, Stack} from "@mui/material";
import CourseExperimental from "./CourseExperimental";
import {useParams, useNavigate} from 'react-router-dom';
import MentorsList from "../Common/MentorsList";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';
import {UserRoles} from "../Auth/UserRoles";
const Roles = UserRoles.Roles;

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
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

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const classes = styles()

    const [courseState, setCourseState] = useState<ICourseState>({
        isFound: false,
        course: {},
        courseHomework: [],
        createHomework: false,
        mentors: [],
        acceptedStudents: [],
        newStudents: [],
        isReadingMode: true,
        studentSolutions: [],
    })

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

    const role = ApiSingleton.authService.getRole()
    const isCourseMentor = mentors.some(t => t.userId === userId)
    const isExpert = isCourseMentor && role == Roles.Expert
    const isLecturer = isCourseMentor && role == Roles.Lecturer

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
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId!)

        // У пользователя изменилась роль (иначе он не может стать лектором в курсе), 
        // однако он все ещё использует токен с прежней ролью
        const shouldRefreshToken =
            role != Roles.Lecturer && role != Roles.Expert &&
            course &&
            course.mentors!.some(t => t.userId === userId)
        if (shouldRefreshToken) {
            const newToken = await ApiSingleton.accountApi.apiAccountRefreshTokenGet()
            newToken.value && ApiSingleton.authService.refreshToken(newToken.value.accessToken!)
            return
        }

        const solutions = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdGet(+courseId!)

        setCourseState(prevState => ({
            ...prevState,
            isFound: true,
            course: course,
            courseHomework: course.homeworks!,
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
            studentSolutions: solutions
        }))
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    useEffect(() => changeTab(tab || "homeworks"), [tab, courseId, isFound])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi
            .apiCoursesSignInCourseByCourseIdPost(+courseId!)
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
                <Grid style={{marginTop: "15px"}}>
                    <Grid container direction={"column"} spacing={2}>
                        {course.isCompleted && <Grid item>
                            <Alert severity="warning">
                                <AlertTitle>Курс завершен!</AlertTitle>
                                {isAcceptedStudent
                                    ? "Вы можете отправлять решения и получать уведомления об их проверке."
                                    : isLecturer
                                        ? "Вы продолжите получать уведомления о новых заявках на вступление и решениях."
                                        : role == Roles.Student ? "Вы можете записаться на курс и отправлять решения." : ""}
                            </Alert>
                        </Grid>}
                        <Grid item container xs={12} className={classes.info} alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography style={{fontSize: '22px'}}>
                                    {`${course.name} / ${course.groupName}`} &nbsp;
                                    {isLecturer &&
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                setCourseState(prevState => ({
                                                        ...prevState,
                                                        isReadingMode: !isReadingMode
                                                    })
                                                )}
                                        >
                                            {isReadingMode
                                                ? <VisibilityIcon
                                                    titleAccess="Режим чтения включен"
                                                    fontSize={"small"}/>
                                                : <VisibilityOffIcon
                                                    titleAccess="Режим чтения выключен"
                                                    fontSize={"small"}
                                                />}
                                        </IconButton>
                                    }
                                    {isLecturer && !isReadingMode! && (
                                        <RouterLink to={`/courses/${courseId}/edit`}>
                                            <EditIcon style={{marginLeft: 5}} fontSize="small"/>
                                        </RouterLink>
                                    )}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center" justifyContent="flex-end">
                                    <Grid item>
                                        <MentorsList mentors={mentors}/>
                                    </Grid>
                                    {isLecturer && isReadingMode &&
                                        <Grid item>
                                            <IconButton size="small" style={{marginLeft: 5}} onClick={() => setLecturerStatsState(true)}>
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
                            {!isSignedInCourse && role == Roles.Student && !isAcceptedStudent && (
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
                        value={tabValue == "homeworks" ? 0 : tabValue === "stats" ? 1 : 2}
                        indicatorColor="primary"
                        onChange={(event, value) => {
                            if (value === 0) navigate(`/courses/${courseId}/homeworks`)
                            if (value === 1) navigate(`/courses/${courseId}/stats`)
                            if (value === 2) navigate(`/courses/${courseId}/applications`)
                        }}
                    >
                        <Tab label="Домашние задания"/>
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
                    <br/>
                    {tabValue === "homeworks" && <div>
                        {
                            isReadingMode
                                ?
                                <CourseExperimental
                                    homeworks={courseHomeworks}
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
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <CourseHomework
                                                        onDelete={() => setCurrentState()}
                                                        isStudent={isAcceptedStudent}
                                                        isMentor={isCourseMentor}
                                                        isReadingMode={isReadingMode}
                                                        homework={courseHomeworks}
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
                                                    onDelete={() => setCurrentState()}
                                                    isStudent={isAcceptedStudent}
                                                    isMentor={isCourseMentor}
                                                    isReadingMode={isReadingMode}
                                                    homework={courseHomeworks}
                                                />
                                            </Grid>
                                        </div>
                                    )}
                                    {!isCourseMentor && (
                                        <CourseHomework
                                            onDelete={() => setCurrentState()}
                                            homework={courseHomeworks}
                                            isStudent={isAcceptedStudent}
                                            isMentor={isCourseMentor}
                                            isReadingMode={isReadingMode}
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
