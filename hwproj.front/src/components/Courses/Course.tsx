import * as React from "react";
import {FC, useEffect, useState, useMemo} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {AccountDataDto, CourseViewModel, GroupViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "@/api";
import StudentStats from "./StudentStats";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import EditIcon from "@mui/icons-material/Edit";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@mui/material";
import {CourseExperimental} from "./CourseExperimental";
import MentorsList from "../Common/MentorsList";
import {CourseTile} from "../Common/CourseTile";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';
import {QRCodeSVG} from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {MoreVert} from "@mui/icons-material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import Utils from "@/services/Utils";

type TabValue = "homeworks" | "stats" | "applications"

function isAcceptableTabValue(str: string): str is TabValue {
    return str === "homeworks" || str === "stats" || str === "applications";
}

interface ICourseState {
    isFound: boolean;
    course: CourseViewModel;
    courseHomeworks: HomeworkViewModel[];
    groups: GroupViewModel[];
    mentors: AccountDataDto[];
    acceptedStudents: AccountDataDto[];
    newStudents: AccountDataDto[];
    studentSolutions: StatisticsCourseMatesModel[];
    showQrCode: boolean;
}

interface IPageState {
    tabValue: TabValue
}

const studentPlurals = ["студент", "студента", "студентов"]

const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
}

// Плашка о завершении курса — верхняя часть шапки, а не отдельный блок над ней:
// поэтому у неё нет собственных скруглений и боковых рамок, а края совпадают с краями карточки
const completedAlertSx = {
    borderRadius: 0,
    px: {xs: 2, sm: 2.5},
    py: 1.25,
    alignItems: "flex-start",
    borderBottom: "1px solid #f2e2c4",
    "& .MuiAlert-icon": {py: 0.25, mr: 1.5},
    "& .MuiAlert-message": {py: 0},
}

// Статус заявки студент должен заметить сразу: заливка вместо бледной рамки, белый текст и иконка
const pendingChipSx = {
    backgroundColor: "info.dark",
    color: "#fff",
    fontWeight: 500,
    "& .MuiChip-icon": {color: "#fff"},
}

// Табы — это навигация, а не ещё одна панель: рамки и фона у полосы нет, она сливается со страницей.
// При скролле полоса залипает под шапкой приложения, чтобы переключаться можно было из любого места;
// полупрозрачный фон с размытием нужен только для того, чтобы контент уезжал под неё, а не сквозь неё
const tabsBarSx = {
    position: "sticky",
    top: {xs: 52, sm: 56},
    zIndex: 2,
    py: 0.25,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(8px)",
}

const tabsSx = {
    minHeight: 0,
    // Скроллер табов обрезает всё, что выходит за его границы, поэтому тень активной таблетки
    // помещается только за счёт его собственных отступов
    "& .MuiTabs-scroller": {py: 0.75},
    "& .MuiTabs-flexContainer": {gap: 0.75},
    "& .MuiTabs-scrollButtons": {width: 26},
    "& .MuiTab-root": {
        minHeight: 38,
        minWidth: 0,
        px: 1.75,
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: 500,
        color: "text.secondary",
        transition: "background-color .2s, color .2s, box-shadow .2s",
        "& .MuiTab-iconWrapper": {mr: 0.75, ml: 0},
        "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.06)", color: "#3f51b5"},
        // Активный таб — светлая таблетка в тон шапкам панелей: заметно, но без плотной заливки,
        // которая перетягивала бы внимание с содержимого страницы
        "&.Mui-selected": {
            color: "#3f51b5",
            backgroundColor: "#eef0fa",
            fontWeight: 600,
            boxShadow: "inset 0 0 0 1px rgba(63, 81, 181, 0.16)",
        },
        "&.Mui-selected:hover": {backgroundColor: "#e6e9f7"},
    },
}

const tabCountSx = {
    ml: 0.75,
    px: 0.625,
    minWidth: 20,
    height: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    // Внутри активной таблетки бейдж на тон плотнее её фона, иначе он бы на нём растворился
    ".Mui-selected &": {backgroundColor: "#dce1f5"},
}

// Счётчик показываем только когда есть что показать: ноль в бейдже — визуальный шум
const TabLabel: FC<{text: string, count: number}> = ({text, count}) =>
    <Box component={"span"} sx={{display: "inline-flex", alignItems: "center"}}>
        {text}
        {count > 0 && <Box component={"span"} sx={tabCountSx}>{count}</Box>}
    </Box>

const Course: React.FC = () => {
    const {courseId, tab} = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [courseState, setCourseState] = useState<ICourseState>({
        isFound: false,
        course: {},
        courseHomeworks: [],
        mentors: [],
        groups: [],
        acceptedStudents: [],
        newStudents: [],
        studentSolutions: [],
        showQrCode: false
    })
    const [studentSolutions, setStudentSolutions] = useState<StatisticsCourseMatesModel[] | undefined>(undefined)

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
        groups
    } = courseState

    const loadGroups = async () => {
        const groups = await ApiSingleton.courseGroupsApi.courseGroupsGetAllCourseGroups(course.id!)
        setCourseState(prevState => ({
            ...prevState,
            groups: groups
        }))
    };

    const userId = ApiSingleton.authService.getUserId()

    const isLecturer = ApiSingleton.authService.isLecturer()
    const isExpert = ApiSingleton.authService.isExpert()
    const isMentor = isLecturer || isExpert
    const isCourseMentor = mentors.some(t => t.userId === userId)
    const isSignedInCourse = newStudents!.some(cm => cm.userId === userId)

    const {
        courseFilesState,
        updateCourseUnitFiles,
    } = FilesUploadWaiter(+courseId!, CourseUnitType.Homework, !isCourseMentor);

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
            groups: course.groups || [],
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
        .filter(t => t!.solutions!.slice(-1)[0]?.state === 0) //last solution
        .length

    // Эксперту доступны не все табы, поэтому выделять нечего, если текущего таба в полосе нет
    const visibleTabs: TabValue[] = [
        ...(!isExpert ? ["homeworks" as TabValue] : []),
        ...(showStatsTab ? ["stats" as TabValue] : []),
        ...(showApplicationsTab && !isExpert ? ["applications" as TabValue] : []),
    ]
    const activeTab = visibleTabs.includes(tabValue) ? tabValue : false

    const [lecturerStatsState, setLecturerStatsState] = useState(false);

    const studentsWithoutGroup = useMemo(() => {
        const inGroupIds = new Set(groups.flatMap(g => g.studentsIds));
        return acceptedStudents.filter(s => !inGroupIds.has(s.userId!));
    }, [groups, acceptedStudents]);

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
            <div>
                <Tooltip title={"Ещё"} arrow>
                    <IconButton
                        aria-label="more"
                        id="long-button"
                        size={"small"}
                        onClick={handleClick}
                    >
                        <MoreVert fontSize={"small"}/>
                    </IconButton>
                </Tooltip>
                <Menu
                    id="long-menu"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    transformOrigin={{vertical: "top", horizontal: "right"}}
                    PaperProps={{
                        variant: "outlined",
                        sx: {borderRadius: "12px", mt: 0.5, minWidth: 210},
                    }}
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
        const courseName = course.name ?? ""

        return (
            <div className="container">
                <Dialog
                    open={courseState.showQrCode}
                    onClose={() => setCourseState(prevState => ({...prevState, showQrCode: false}))}
                    PaperProps={{sx: {borderRadius: "16px"}}}
                >
                    <DialogTitle sx={{pb: 1, fontSize: "1.1rem", fontWeight: 500, textAlign: "center"}}>
                        Поделитесь ссылкой на курс
                    </DialogTitle>
                    <DialogContent>
                        <Stack alignItems={"center"} spacing={1.5}>
                            <Box
                                sx={{
                                    p: 2,
                                    lineHeight: 0,
                                    border: "1px solid #e0e3e7",
                                    borderRadius: "14px",
                                    backgroundColor: "#fff",
                                }}
                            >
                                <QRCodeSVG size={200} value={window.location.href.replace(tabValue, "")}/>
                            </Box>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Отсканируйте код, чтобы открыть страницу курса
                            </Typography>
                        </Stack>
                    </DialogContent>
                </Dialog>
                <Stack spacing={2} sx={{mt: 2, mb: 2}}>
                    <Paper variant={"outlined"} sx={{...panelSx, overflow: "hidden"}}>
                        {course.isCompleted &&
                            <Alert severity="warning" sx={completedAlertSx}>
                                <AlertTitle sx={{mb: 0.25, fontSize: "0.9375rem"}}>Курс завершен!</AlertTitle>
                                {isAcceptedStudent
                                    ? "Вы можете отправлять решения и получать уведомления об их проверке."
                                    : isCourseMentor && !isExpert
                                        ? "Вы продолжите получать уведомления о новых заявках на вступление и решениях."
                                        : !isMentor ? "Вы можете записаться на курс и отправлять решения." : ""}
                            </Alert>}
                        <Stack
                            direction={{xs: "column", sm: "row"}}
                            spacing={2}
                            alignItems={{xs: "stretch", sm: "flex-start"}}
                            sx={{p: {xs: 2, sm: 2.5}}}
                        >
                            <Stack direction={"row"} spacing={2} sx={{flexGrow: 1, minWidth: 0}}>
                                <CourseTile
                                    name={courseName}
                                    size={52}
                                    fontSize={"1.15rem"}
                                    borderRadius={"14px"}
                                />
                                <Box sx={{minWidth: 0}}>
                                    <Typography
                                        component={"h1"}
                                        sx={{fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25, m: 0}}
                                    >
                                        {courseName}
                                    </Typography>
                                    {course.groupName &&
                                        <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                            {course.groupName}
                                        </Typography>}
                                    <Box sx={{mt: 1, minWidth: 0}}>
                                        <MentorsList mentors={mentors} size={30}/>
                                    </Box>
                                </Box>
                            </Stack>
                            <Stack
                                direction={"row"}
                                spacing={1}
                                alignItems={"center"}
                                flexWrap={"wrap"}
                                justifyContent={{xs: "flex-start", sm: "flex-end"}}
                                sx={{flexShrink: 0, rowGap: 1}}
                            >
                                {showStatsTab &&
                                    <Tooltip
                                        arrow
                                        title={`${acceptedStudents.length} ${Utils.pluralizeHelper(studentPlurals, acceptedStudents.length)} на курсе`}
                                    >
                                        <Chip
                                            size={"small"}
                                            variant={"outlined"}
                                            icon={<GroupIcon fontSize={"small"}/>}
                                            label={acceptedStudents.length}
                                            sx={{color: "text.secondary"}}
                                        />
                                    </Tooltip>}
                                {isCourseMentor && groups.length > 0 && studentsWithoutGroup.length > 0 &&
                                    <Tooltip
                                        arrow
                                        title={`${studentsWithoutGroup.length} ${Utils.pluralizeHelper(studentPlurals, studentsWithoutGroup.length)} без группы`}
                                    >
                                        <Chip
                                            size={"small"}
                                            color={"primary"}
                                            variant={"outlined"}
                                            label={`${studentsWithoutGroup.length} без группы`}
                                        />
                                    </Tooltip>}
                                {/* Чип «Завершён» не нужен: о завершении курса говорит плашка над шапкой */}
                                {!isSignedInCourse && !isMentor && !isAcceptedStudent &&
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disableElevation
                                        onClick={() => joinCourse()}
                                        sx={{borderRadius: "10px", textTransform: "none", px: 2.5}}
                                    >
                                        Записаться
                                    </Button>}
                                {isSignedInCourse && !isAcceptedStudent &&
                                    <Chip
                                        size={"small"}
                                        icon={<HourglassEmptyIcon fontSize={"small"}/>}
                                        label={"Заявка рассматривается"}
                                        sx={pendingChipSx}
                                    />}
                                <CourseMenu/>
                            </Stack>
                        </Stack>
                        {lecturerStatsState &&
                            <LecturerStatistics
                                courseId={+courseId!}
                                onClose={() => setLecturerStatsState(false)}
                            />
                        }
                    </Paper>
                    <Box sx={tabsBarSx}>
                        <Tabs
                            variant="scrollable"
                            scrollButtons={"auto"}
                            allowScrollButtonsMobile
                            value={activeTab}
                            onChange={(event, value: TabValue) => navigate(`/courses/${courseId}/${value}`)}
                            TabIndicatorProps={{sx: {display: "none"}}}
                            sx={tabsSx}
                        >
                            {!isExpert &&
                                <Tab
                                    value={"homeworks"}
                                    icon={<AssignmentOutlinedIcon fontSize={"small"}/>}
                                    iconPosition={"start"}
                                    label={"Задания"}
                                />}
                            {showStatsTab &&
                                <Tab
                                    value={"stats"}
                                    icon={<FactCheckOutlinedIcon fontSize={"small"}/>}
                                    iconPosition={"start"}
                                    label={<TabLabel text={"Решения"} count={unratedSolutionsCount}/>}
                                />}
                            {showApplicationsTab && !isExpert &&
                                <Tab
                                    value={"applications"}
                                    icon={<PersonAddIcon fontSize={"small"}/>}
                                    iconPosition={"start"}
                                    label={<TabLabel text={"Заявки"} count={newStudents.length}/>}
                                />}
                        </Tabs>
                    </Box>
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
                        onStartProcessing={updateCourseUnitFiles}
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
                        onGroupsUpdate={loadGroups}
                        groups={groups}
                    />
                    }
                    {tabValue === "stats" &&
                        <Grid container>
                            <Grid item xs={12}>
                                <StudentStats
                                    homeworks={courseHomeworks}
                                    userId={userId as string}
                                    isMentor={isCourseMentor}
                                    course={courseState.course}
                                    solutions={studentSolutions}
                                    groups={groups}
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
                </Stack>
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
