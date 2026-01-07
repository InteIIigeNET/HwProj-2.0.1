import * as React from "react";
import {useSearchParams} from "react-router-dom";
import {FileInfoDTO,ScopeDTO,} from "@/api";
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
import {CourseUnitType} from "../Files/CourseUnitType";
import {FileStatus} from "../Files/FileStatus";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setCourse, setMentors, setAcceptedStudents, setNewStudents} from "@/store/slices/courseSlice";
import {setHomeworks} from "@/store/slices/homeworkSlice";
import {setStudentSolutions} from "@/store/slices/solutionSlice";
import {setCourseFiles, updateCourseFiles, setProcessingLoading} from "@/store/slices/courseFileSlice";
import {setAuth} from "@/store/slices/authSlice";

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
}

interface IPageState {
    tabValue: TabValue
}

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const {enqueueSnackbar} = useSnackbar()

    const dispatch = useAppDispatch();
    const course = useAppSelector(state => state.course.course);
    const isFound = useAppSelector(state => state.course.isFound);
    const mentors = useAppSelector(state => state.course.mentors);
    const acceptedStudents = useAppSelector(state => state.course.acceptedStudents);
    const newStudents = useAppSelector(state => state.course.newStudents);
    const courseHomeworks = useAppSelector(state => state.homeworks.homeworks);
    const studentSolutions = useAppSelector(state => state.solutions.studentSolutions);
    const courseFiles = useAppSelector(state => state.courseFiles.courseFiles);
    const processingFilesState = useAppSelector(state => state.courseFiles.processingFilesState);
    const [showQrCode, setShowQrCode] = useState(false);

    const intervalsRef = React.useRef<Record<number, { interval: NodeJS.Timeout, timeout: NodeJS.Timeout }>>({});

    const handleUpdateCourseFiles = (files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        dispatch(updateCourseFiles({ files, unitType, unitId }));
    };

    const setCommonLoading = (homeworkId: number) => {
        dispatch(setProcessingLoading({ homeworkId, isLoading: true }));
    }

    const unsetCommonLoading = (homeworkId: number) => {
        dispatch(setProcessingLoading({ homeworkId, isLoading: false }));
    }

    const stopProcessing = (homeworkId: number) => {
        if (intervalsRef.current[homeworkId]) {
            const {interval, timeout} = intervalsRef.current[homeworkId];
            clearInterval(interval);
            clearTimeout(timeout);
            delete intervalsRef.current[homeworkId];
        }
    };

    // Запускает получение информации о файлах элемента курса с интервалом в 1 секунду и 5 попытками
    const getFilesByInterval = (homeworkId: number, previouslyExistingFilesCount: number, waitingNewFilesCount: number, deletingFilesIds: number[]) => {
        // Очищаем предыдущие таймеры
        stopProcessing(homeworkId);

        let attempt = 0;
        const maxAttempts = 10;
        let delay = 1000; // Начальная задержка 1 сек

        const scopeDto: ScopeDTO = {
            courseId: +courseId!,
            courseUnitType: CourseUnitType.Homework,
            courseUnitId: homeworkId
        }

        const fetchFiles = async () => {
            if (attempt >= maxAttempts) {
                stopProcessing(homeworkId);
                enqueueSnackbar("Превышено допустимое количество попыток получения информации о файлах", {
                    variant: "warning",
                    autoHideDuration: 2000
                });
                return;
            }

            attempt++;
            try {
                const files = await ApiSingleton.filesApi.filesGetStatuses(scopeDto);
                console.log(`Попытка ${attempt}:`, files);

                // Первый вариант для явного отображения всех файлов
                if (waitingNewFilesCount === 0
                    && files.filter(f => f.status === FileStatus.ReadyToUse).length === previouslyExistingFilesCount - deletingFilesIds.length) {
                    handleUpdateCourseFiles(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                    unsetCommonLoading(homeworkId)
                }

                // Второй вариант для явного отображения всех файлов
                if (waitingNewFilesCount > 0
                    && files.filter(f => !deletingFilesIds.some(dfi => dfi === f.id)).length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount) {
                    handleUpdateCourseFiles(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                    unsetCommonLoading(homeworkId)
                }

                // Условие прекращения отправки запросов на получения записей файлов
                if (files.length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount
                    && files.every(f => f.status !== FileStatus.Uploading && f.status !== FileStatus.Deleting)) {
                    stopProcessing(homeworkId);
                    unsetCommonLoading(homeworkId)
                }

            } catch (error) {
                console.error(`Ошибка (попытка ${attempt}):`, error);
            }
        }

        // Создаем интервал с задержкой
        const interval = setInterval(fetchFiles, delay);

        // Создаем таймаут для автоматической остановки
        const timeout = setTimeout(() => {
            stopProcessing(homeworkId);
            unsetCommonLoading(homeworkId)
        }, 10000);

        // Сохраняем интервал и таймаут в ref
        intervalsRef.current[homeworkId] = {interval, timeout};

        // Сигнализируем о начале загрузки через состояние
        setCommonLoading(homeworkId)
    }

    // Останавливаем все активные интевалы при размонтировании
    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach(({interval, timeout}) => {
                clearInterval(interval);
                clearTimeout(timeout);
            });
            intervalsRef.current = {};
        };
    }, []);

    const [pageState, setPageState] = useState<IPageState>({
        tabValue: "homeworks"
    })

    useEffect(() => {
        const userId = ApiSingleton.authService.getUserId();
        const isLecturer = ApiSingleton.authService.isLecturer();
        const isExpert = ApiSingleton.authService.isExpert();
        dispatch(setAuth({ userId, isLecturer, isExpert }))
    }, [])

    const userId = useAppSelector(state => state.auth.userId);
    const isLecturer = useAppSelector(state => state.auth.isLecturer);
    const isExpert = useAppSelector(state => state.auth.isExpert);
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

        dispatch(setCourse(course));
        dispatch(setMentors(course.mentors!));
        dispatch(setAcceptedStudents(course.acceptedStudents!));
        dispatch(setNewStudents(course.newStudents!));
        dispatch(setHomeworks(course.homeworks!));
    }

    const getCourseFilesInfo = async () => {
        let courseFilesInfo = [] as FileInfoDTO[]
        try {
            courseFilesInfo = isCourseMentor
                ? await ApiSingleton.filesApi.filesGetFilesInfo(+courseId!)
                : await ApiSingleton.filesApi.filesGetUploadedFilesInfo(+courseId!);
        } catch (e) {
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 1990});
        }
        dispatch(setCourseFiles(courseFilesInfo));
    }

    useEffect(() => {
        setCurrentState()
    }, [courseId])

    useEffect(() => {
        getCourseFilesInfo()
    }, [isCourseMentor])

    useEffect(() => {
        ApiSingleton.statisticsApi.statisticsGetCourseStatistics(+courseId!)
            .then(res => dispatch(setStudentSolutions(res)))
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
                    <MenuItem onClick={() => setShowQrCode(true)}>
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
                    open={showQrCode}
                    onClose={() => setShowQrCode(false)}
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
                        {course?.isCompleted && <Grid item>
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
                                        {NameBuilder.getCourseFullName(course?.name || "", course?.groupName || "")}
                                    </Typography>
                                    <CourseMenu/>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center" justifyContent="flex-end">
                                    <Grid item>
                                        <MentorsList />
                                    </Grid>
                                    {lecturerStatsState &&
                                        <LecturerStatistics
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
                        onStartProcessing={getFilesByInterval}
                    />
                    }
                    {tabValue === "stats" &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={12}>
                                <StudentStats />
                            </Grid>
                        </Grid>}
                    {tabValue === "applications" && showApplicationsTab &&
                        <NewCourseStudents/>
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