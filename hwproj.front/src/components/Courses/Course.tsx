import * as React from "react";
import {useSearchParams} from "react-router-dom";
import {
    AccountDataDto,
    CourseViewModel,
    FileInfoDTO,
    HomeworkViewModel,
    ScopeDTO,
    StatisticsCourseMatesModel
} from "@/api";
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
    Typography
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
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";

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

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const {enqueueSnackbar} = useSnackbar()

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
    const [studentSolutions, setStudentSolutions] = useState<StatisticsCourseMatesModel[] | undefined>(undefined)

    const {
        courseFilesState,
        updCourseUnitFiles,
    } = FilesUploadWaiter(+courseId!, true);

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
            createHomework: false,
            mentors: course.mentors!,
            acceptedStudents: course.acceptedStudents!,
            newStudents: course.newStudents!,
        }))
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    useEffect(() => {
        ApiSingleton.statisticsApi.statisticsGetCourseStatistics(+courseId!)
            .then(res => setStudentSolutions(res))
    }, [courseId])

    useEffect(() => changeTab(tab || "homeworks"), [tab, courseId, isFound])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi.coursesSignInCourse(+courseId!)
            .then(() => setCurrentState());
    }

    const {tabValue} = pageState
    const searchedHomeworkId = searchParams.get("homeworkId")

    const unratedSolutionsCount = (studentSolutions || [])
        .flatMap(x => x.homeworks)
        .flatMap(x => x!.tasks)
        .filter(t => t!.solution!.slice(-1)[0]?.state === 0) //last solution
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
                        courseFilesInfo={courseFilesState.courseFiles}
                        isMentor={isCourseMentor}
                        studentSolutions={studentSolutions || []}
                        isStudentAccepted={isAcceptedStudent}
                        selectedHomeworkId={searchedHomeworkId == null ? undefined : +searchedHomeworkId}
                        userId={userId!}
                        processingFiles={courseFilesState.processingFilesState}
                        onStartProcessing={updCourseUnitFiles}
                        onHomeworkUpdate={({homework, isDeleted}) => {
                            const homeworkIndex = courseState.courseHomeworks.findIndex(x => x.id === homework.id)
                            const homeworks = courseState.courseHomeworks

                            if (isDeleted) homeworks.splice(homeworkIndex, 1)
                            else if (homeworkIndex === -1) homeworks.push(homework)
                            else homeworks[homeworkIndex] = homework

                            setCourseState(prevState => ({
                                ...prevState,
                                courseHomeworks: homeworks
                            }))
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
