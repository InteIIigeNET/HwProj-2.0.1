import * as React from "react";
import ApiSingleton from "api/ApiSingleton";
import {UnratedSolutionPreviews, UserDataDto} from "@/api";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import TaskDeadlines from "./Tasks/TaskDeadlines";
import UnratedSolutionsAndOpenQuestions from "./Solutions/UnratedSolutionsAndOpenQuestions";
import {Alert, Box, Chip, Divider, Grid, Paper, Stack, Tab, Tabs, Typography} from "@mui/material";
import {UserInitialsAvatar} from "./Common/UserInitialsAvatar";
import NewCourseEvents from "./Courses/NewCourseEvents";
import {TestTag} from "./Common/HomeworkTags";
import Utils from "../services/Utils";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";


interface IWorkspaceState {
    isLoaded: boolean;
    tabValue: number;
}

const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
}

const tabsSx = {
    minHeight: 44,
    "& .MuiTab-root": {
        minHeight: 44,
        px: 2,
        textTransform: "none",
        fontSize: "0.95rem",
        fontWeight: 500,
    },
    "& .MuiTabs-indicator": {height: 3, borderRadius: "3px 3px 0 0"},
}

const roleTitles: Record<string, string> = {
    "Lecturer": "Преподаватель",
    "Expert": "Эксперт",
    "Student": "Студент",
}

const Workspace: FC = () => {
    const {id} = useParams()

    const [profileState, setProfileState] = useState<IWorkspaceState>({
        isLoaded: false,
        tabValue: 0
    })

    const [accountState, setAccountState] = useState<UserDataDto & {
        unratedSolutionPreviews: UnratedSolutionPreviews | undefined
    }>({
        userData: undefined,
        unratedSolutionPreviews: undefined
    })

    const isLecturer = ApiSingleton.authService.isLecturer()
    const isExpert = ApiSingleton.authService.isExpert()
    const isMentor = isLecturer || isExpert

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (id) {
            const data = await ApiSingleton.accountApi.accountGetUserDataById(id)
            setAccountState({userData: data, taskDeadlines: [], courseEvents: [], unratedSolutionPreviews: undefined})
            setProfileState(prevState => ({
                ...prevState,
                isLoaded: true
            }))
            return
        }
        const data = await ApiSingleton.accountApi.accountGetUserData()
        const unratedSolutions = isMentor
            ? await ApiSingleton.solutionsApi.solutionsGetUnratedSolutions()
            : undefined
        setAccountState({...data, unratedSolutionPreviews: unratedSolutions})
        setProfileState(prevState => ({
            ...prevState,
            tabValue: taskDeadlines?.some(x => x.deadlinePast) ? prevState.tabValue : 0,
            isLoaded: true
        }))
    }

    const onGiveUpClick = () => {
        getUserInfo()
    }

    const {userData, courseEvents, taskDeadlines, unratedSolutionPreviews} = accountState
    const {tabValue} = profileState

    const nearestTaskDeadlines = taskDeadlines?.filter(x => !x.deadlinePast) || []
    const testDeadlines = nearestTaskDeadlines
        .filter(x => x.deadline!.tags!.includes(TestTag))
        .map(x => x.deadline!)
        .map(x => ({
            courseId: x.courseId!,
            courseTitle: x.courseTitle!,
            homeworkId: x.homeworkId!,
            deadlineDate: x.deadlineDate!
        })) || []
    const pastTaskDeadlines = taskDeadlines?.filter(x => x.deadlinePast) || []

    if (profileState.isLoaded) {
        const isUserProfile = userData!.userId === ApiSingleton.authService.getUserId()
        const fullName = userData?.middleName
            ? userData.name + ' ' + userData.middleName + ' ' + userData.surname
            : userData!.name + ' ' + userData!.surname
        const roleTitle = userData!.role ? roleTitles[userData!.role] : undefined

        return (
            <div className="container" style={{marginBottom: '50px'}}>
                <Grid container style={{marginTop: "5px"}} spacing={2}>
                    <Grid item xs={12}>
                        <Paper variant={"outlined"} sx={{...panelSx, p: {xs: 2, sm: 2.5}}}>
                            <Stack
                                direction={{xs: "column", sm: "row"}}
                                spacing={2}
                                alignItems={{xs: "stretch", sm: "center"}}
                            >
                                <Stack
                                    direction={"row"}
                                    spacing={2}
                                    alignItems={"center"}
                                    sx={{flexGrow: 1, minWidth: 0}}
                                >
                                    <UserInitialsAvatar user={userData!} size={52} fontSize={"1.15rem"}/>
                                    <Box sx={{minWidth: 0}}>
                                        <Typography
                                            component={"h1"}
                                            sx={{fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25, m: 0}}
                                        >
                                            {fullName}
                                        </Typography>
                                        <Typography
                                            variant={"body2"}
                                            sx={{color: "text.secondary", wordBreak: "break-word"}}
                                        >
                                            {userData!.email}
                                        </Typography>
                                        {userData!.companyName &&
                                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                                {userData!.companyName}
                                            </Typography>}
                                    </Box>
                                </Stack>
                                {roleTitle &&
                                    <Stack
                                        direction={"row"}
                                        justifyContent={{xs: "flex-start", sm: "flex-end"}}
                                        sx={{flexShrink: 0}}
                                    >
                                        <Chip label={roleTitle} size={"small"} sx={{color: "GrayText"}}/>
                                    </Stack>}
                            </Stack>
                        </Paper>
                    </Grid>
                    {isUserProfile && !isMentor && testDeadlines &&
                        <Grid container item spacing={1} alignContent={"stretch"}>
                            {[...new Set(testDeadlines.map(x => x.courseId))].map(courseId => {
                                const test = testDeadlines.find(x => x.courseId === courseId)!
                                const timeLeft = Math.ceil((new Date(test.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60))
                                return <Grid item>
                                    <Alert severity="info"
                                           action={<Link to={`/courses/${test.courseId}?homeworkId=${test.homeworkId}`}
                                                         style={{marginTop: 4}}> Перейти к заданиям </Link>}>
                                        На курсе <b>{test.courseTitle}</b> проходит контрольная работа. До конца работы
                                        осталось {timeLeft} {Utils.pluralizeHelper(["минута", "минуты", "минут"], timeLeft)}.
                                    </Alert>
                                </Grid>;
                            })}
                        </Grid>}
                    {isUserProfile && <Grid item xs={12}>
                        <Tabs
                            variant="scrollable"
                            scrollButtons={"auto"}
                            value={tabValue}
                            indicatorColor="primary"
                            sx={tabsSx}
                            onChange={(event, value) => {
                                setProfileState(prevState => ({
                                    ...prevState,
                                    tabValue: value
                                }));
                            }}
                        >
                            {isMentor && <Tab label={
                                <Stack direction="row" spacing={1} alignItems={"center"}>
                                    <div>Ожидают проверки</div>
                                    <Chip size={"small"} color={"primary"}
                                          label={(unratedSolutionPreviews!.unratedSolutions!.length)}/>
                                </Stack>}/>}
                            {isLecturer && courseEvents!.length > 0 &&
                                <Tab label={<Stack direction="row" spacing={1} alignItems={"center"}>
                                    <div>Курсы</div>
                                    <Chip size={"small"} color={"primary"}
                                          label={(courseEvents!.length)}/>
                                </Stack>}/>}

                            {!isMentor && <Tab label={
                                <Stack direction="row" spacing={1} alignItems={"center"}>
                                    <div>Дедлайны</div>
                                    <Chip size={"small"} color={"default"}
                                          label={(nearestTaskDeadlines!.length)}/>
                                </Stack>}/>}
                            {!isMentor && pastTaskDeadlines.length > 0 &&
                                <Tab style={{minWidth: "fit-content"}}
                                     label={
                                         <Stack direction="row" spacing={1} alignItems={"center"}>
                                             <div>Пропущенные дедлайны</div>
                                             <Chip size={"small"}
                                                   color={"error"}
                                                   label={pastTaskDeadlines.length}/>
                                         </Stack>}
                                />}
                        </Tabs>
                        <Divider/>
                        <Box sx={{mt: 2}}>
                            {tabValue === 0 &&
                                (isMentor
                                    ? <UnratedSolutionsAndOpenQuestions unratedSolutionsPreviews={unratedSolutionPreviews!}/>
                                    : <TaskDeadlines taskDeadlines={nearestTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                            {tabValue === 1 && !isExpert &&
                                (isLecturer
                                    ? <NewCourseEvents courseEvents={courseEvents!}/>
                                    : <TaskDeadlines taskDeadlines={pastTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                        </Box>
                    </Grid>}
                    <Grid item alignSelf="flex-start" sx={{width: 300, maxWidth: "100%"}}>
                        <DotLottieReact
                            src="https://lottie.host/3f7405d2-3644-4abf-80de-cea68a618ca5/NYIk0RI1Mw.lottie"
                            loop
                            autoplay
                        />
                    </Grid>
                </Grid>
            </div>
        )
    }
    return (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}

export default Workspace
