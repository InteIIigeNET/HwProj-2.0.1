import * as React from "react";
import {FC, useCallback, useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import StudentStats from "./StudentStats";
import NewCourseStudents from "./NewCourseStudents";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, IconButton, Tab, Tabs} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {
    Alert,
    AlertTitle,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import {CourseExperimental} from "./CourseExperimental";
import MentorsList from "../Common/MentorsList";
import LecturerStatistics from "./Statistics/LecturerStatistics";
import AssessmentIcon from '@mui/icons-material/Assessment';
import NameBuilder from "../Utils/NameBuilder";
import {QRCodeSVG} from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import {MoreVert} from "@mui/icons-material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {useCourseLoader, useCourseFiles, useIsCourseMentor, useCoursePageData, useUnratedSolutionsCount} from "@/store/storeHooks/courseHooks";

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

    const {
        course,
        isFound,
        mentors,
        newStudents,
        courseHomeworks,
        studentSolutions,
        userId,
        isLecturer,
        isExpert,
        isLecturerOrExpertOnSite,
        isSignedInCourse,
        isAcceptedStudent,
    } = useCoursePageData();
    const isCourseMentor = useIsCourseMentor();
    const unratedSolutionsCount = useUnratedSolutionsCount();
    const {initUser, loadCourse, loadStudentSolutions, resetEditing} = useCourseLoader(+courseId!);
    const [showQrCode, setShowQrCode] = useState(false);
    const [shouldLoadFilesAfterCourseReload, setShouldLoadFilesAfterCourseReload] = useState(false);
    const [pageState, setPageState] = useState<IPageState>({
        tabValue: "homeworks"
    })

    const {loadCourseFiles} = useCourseFiles(+courseId!);

    const showStatsTab = isCourseMentor || isAcceptedStudent
    const showApplicationsTab = isCourseMentor

    const changeTab = useCallback((newTab: string) => {
        if (!isAcceptableTabValue(newTab)) return;
        if (newTab === "stats" && !showStatsTab) return;
        if (newTab === "applications" && !showApplicationsTab) return;

        setPageState(prevState => prevState.tabValue === newTab
            ? prevState
            : {
                ...prevState,
                tabValue: newTab
            });
    }, [showApplicationsTab, showStatsTab])

    const reloadCoursePage = useCallback(async () => {
        initUser();
        resetEditing();
        setShouldLoadFilesAfterCourseReload(false);
        const loadedCourse = await loadCourse();
        if (loadedCourse == null) return;
        setShouldLoadFilesAfterCourseReload(true);
    }, [initUser, loadCourse, resetEditing])

    useEffect(() => {
        reloadCoursePage()
    }, [courseId, reloadCoursePage])

    useEffect(() => {
        if (!shouldLoadFilesAfterCourseReload || userId == null || !isFound) return;

        loadCourseFiles(isCourseMentor);
        setShouldLoadFilesAfterCourseReload(false);
    }, [shouldLoadFilesAfterCourseReload, userId, isFound, isCourseMentor, loadCourseFiles])

    useEffect(() => {
        loadStudentSolutions()
    }, [loadStudentSolutions])

    useEffect(() => {
        changeTab(tab || "homeworks")
    }, [changeTab, tab])

    const joinCourse = async () => {
        await ApiSingleton.coursesApi.coursesSignInCourse(+courseId!);
        await reloadCoursePage();
    }

    const {tabValue} = pageState
    const searchedHomeworkId = searchParams.get("homeworkId")

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
                                        : !isLecturerOrExpertOnSite ? "Вы можете записаться на курс и отправлять решения." : ""}
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
                                        <MentorsList mentors={mentors} />
                                    </Grid>
                                    {lecturerStatsState &&
                                        <LecturerStatistics
                                            courseId={course?.id!}
                                            onClose={() => setLecturerStatsState(false)}
                                        />
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item style={{width: 187}}>
                            {!isSignedInCourse && !isLecturerOrExpertOnSite && !isAcceptedStudent && (
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
                        selectedHomeworkId={searchedHomeworkId == null ? undefined : +searchedHomeworkId}
                    />
                    }
                    {tabValue === "stats" &&
                        <Grid container style={{marginBottom: "15px"}}>
                            <Grid item xs={12}>
                                <StudentStats
                                    course={course!}
                                    homeworks={courseHomeworks}
                                    isMentor={isCourseMentor}
                                    userId={userId!}
                                    solutions={studentSolutions}
                                />
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