import * as React from "react";
import ApiSingleton from "api/ApiSingleton";
import {UnratedSolutionPreviews, UserDataDto} from "@/api";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link, useParams, useSearchParams} from "react-router-dom";
import TaskDeadlines from "./Tasks/TaskDeadlines";
import UnratedSolutionsAndOpenQuestions from "./Solutions/UnratedSolutionsAndOpenQuestions";
import {
    Alert,
    Box,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import {UserInitialsAvatar} from "./Common/UserInitialsAvatar";
import NewCourseEvents from "./Courses/NewCourseEvents";
import EditProfileModal from "./EditProfileModal";
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

// Кнопка редактирования не должна отвлекать: на десктопе проявляется при наведении на карточку,
// на тач-устройствах курсор наводить некуда, поэтому там она видна всегда
const profileCardSx = {
    ...panelSx,
    p: {xs: 2, sm: 2.5},
    "&:hover .editProfileAction, &:focus-within .editProfileAction": {opacity: 1, pointerEvents: "auto"},
}

const editProfileButtonSx = {
    flexShrink: 0,
    color: "text.secondary",
    transition: "opacity .2s",
    opacity: {xs: 1, sm: 0},
    pointerEvents: {xs: "auto", sm: "none"},
    "&:hover": {color: "#3f51b5", backgroundColor: "rgba(63, 81, 181, 0.08)"},
}

// Ник GitHub — ссылка на профиль, поэтому оформляем как чип-кнопку в цветах GitHub
const githubChipSx = {
    height: 24,
    maxWidth: "100%",
    border: "1px solid #d5d9e6",
    backgroundColor: "#f6f7fb",
    color: "#24292f",
    fontWeight: 500,
    transition: "background-color .15s, border-color .15s",
    "& .MuiChip-icon": {fontSize: 15, ml: 0.75, mr: -0.25, color: "inherit"},
    "& .MuiChip-label": {px: 0.75, fontSize: "0.8125rem"},
    "&:hover, &:focus": {
        backgroundColor: "#eef0f8",
        borderColor: "#a8b0d8",
        color: "#24292f",
        textDecoration: "none",
    },
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
    const [searchParams, setSearchParams] = useSearchParams()

    const [profileState, setProfileState] = useState<IWorkspaceState>({
        isLoaded: false,
        tabValue: 0
    })

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [githubError, setGithubError] = useState<string | undefined>(undefined)

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

    // Привязка GitHub уводит на github.com и возвращает обратно с кодом авторизации:
    // дообрабатываем его здесь и снова открываем редактирование профиля
    useEffect(() => {
        const code = searchParams.get("code")
        if (id || !code) return

        const authorizeGithub = async () => {
            try {
                await ApiSingleton.accountApi.accountAuthorizeGithub(code)
                setGithubError(undefined)
                await getUserInfo()
            } catch (e) {
                setGithubError("Не удалось привязать аккаунт GitHub")
            }
            searchParams.delete("code")
            setSearchParams(searchParams, {replace: true})
            setIsEditProfileOpen(true)
        }

        authorizeGithub()
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
                        <Paper variant={"outlined"} sx={profileCardSx}>
                            <Stack
                                direction={{xs: "column", sm: "row"}}
                                spacing={2}
                                alignItems={{xs: "stretch", sm: "flex-start"}}
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
                                        {(userData!.githubId || userData!.companyName) &&
                                            <Stack
                                                direction={"row"}
                                                alignItems={"center"}
                                                spacing={1}
                                                flexWrap={"wrap"}
                                                sx={{mt: 0.75, rowGap: 0.75}}
                                            >
                                                {userData!.githubId &&
                                                    <Chip
                                                        component={"a"}
                                                        href={`https://github.com/${userData!.githubId}`}
                                                        target={"_blank"}
                                                        rel={"noopener noreferrer"}
                                                        clickable
                                                        size={"small"}
                                                        icon={<GitHubIcon/>}
                                                        label={userData!.githubId}
                                                        sx={githubChipSx}
                                                    />}
                                                {userData!.companyName &&
                                                    <Stack
                                                        direction={"row"}
                                                        alignItems={"center"}
                                                        spacing={0.5}
                                                        sx={{minWidth: 0, color: "text.secondary"}}
                                                    >
                                                        <BusinessOutlinedIcon sx={{fontSize: 15}}/>
                                                        <Typography variant={"caption"} noWrap>
                                                            {userData!.companyName}
                                                        </Typography>
                                                    </Stack>}
                                            </Stack>}
                                    </Box>
                                </Stack>
                                <Stack
                                    direction={"row"}
                                    alignItems={"center"}
                                    spacing={0.5}
                                    justifyContent={{xs: "flex-start", sm: "flex-end"}}
                                    sx={{flexShrink: 0}}
                                >
                                    {roleTitle &&
                                        <Chip label={roleTitle} size={"small"} sx={{color: "GrayText"}}/>}
                                    {isUserProfile &&
                                        <Tooltip arrow title={"Редактировать профиль"}>
                                            <IconButton
                                                className={"editProfileAction"}
                                                size={"small"}
                                                aria-label={"Редактировать профиль"}
                                                onClick={() => setIsEditProfileOpen(true)}
                                                sx={editProfileButtonSx}
                                            >
                                                <EditOutlinedIcon fontSize={"small"}/>
                                            </IconButton>
                                        </Tooltip>}
                                </Stack>
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
                                    <Chip size={"small"} color={"default"}
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
                {isUserProfile && <EditProfileModal
                    isOpen={isEditProfileOpen}
                    isExpert={isExpert}
                    user={userData!}
                    githubError={githubError}
                    onClose={() => {
                        setGithubError(undefined)
                        setIsEditProfileOpen(false)
                    }}
                    onSaved={() => {
                        setGithubError(undefined)
                        setIsEditProfileOpen(false)
                        getUserInfo()
                    }}
                />}
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
