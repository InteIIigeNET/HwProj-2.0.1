import * as React from "react";
import {Tabs, Tab} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {UnratedSolutionPreviews, UserDataDto} from "@/api";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import TaskDeadlines from "./Tasks/TaskDeadlines";
import UnratedSolutions from "./Solutions/UnratedSolutions";
import {Alert, Chip, Grid, Stack, Typography} from "@mui/material";
import NewCourseEvents from "./Courses/NewCourseEvents";
import {TestTag} from "./Common/HomeworkTags";
import Utils from "../services/Utils";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";


interface IWorkspaceState {
    isLoaded: boolean;
    tabValue: number;
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

        return (
            <div className="container" style={{marginBottom: '50px'}}>
                <Grid container style={{marginTop: "15px"}} spacing={2}>
                    <Grid item container direction={"row"} justifyContent={"space-between"}>
                        <Grid item direction={"row"} spacing={2}>
                            <Grid item>
                                <Typography style={{fontSize: '20px'}}>
                                    {fullName}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Typography style={{fontSize: '20px', color: "GrayText"}}>
                                {userData!.email}
                            </Typography>
                        </Grid>
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
                    {isUserProfile && <Grid item>
                        <Tabs
                            variant="scrollable"
                            scrollButtons={"auto"}
                            value={tabValue}
                            style={{marginTop: 10}}
                            indicatorColor="primary"
                            onChange={(event, value) => {
                                setProfileState(prevState => ({
                                    ...prevState,
                                    tabValue: value
                                }));
                            }}
                        >
                            {isMentor && <Tab label={
                                <Stack direction="row" spacing={1}>
                                    <div>Ожидают проверки</div>
                                    <Chip size={"small"} color={"default"}
                                          label={(unratedSolutionPreviews!.unratedSolutions!.length)}/>
                                </Stack>}/>}
                            {isLecturer && courseEvents!.length > 0 &&
                                <Tab label={<Stack direction="row" spacing={1}>
                                    <div>Курсы</div>
                                    <Chip size={"small"} color={"primary"}
                                          label={(courseEvents!.length)}/>
                                </Stack>}/>}

                            {!isMentor && <Tab label={
                                <Stack direction="row" spacing={1}>
                                    <div>Дедлайны</div>
                                    <Chip size={"small"} color={"default"}
                                          label={(nearestTaskDeadlines!.length)}/>
                                </Stack>}/>}
                            {!isMentor && pastTaskDeadlines.length > 0 &&
                                <Tab style={{minWidth: "fit-content"}}
                                     label={
                                         <Stack direction="row" spacing={1}>
                                             <div>Пропущенные дедлайны</div>
                                             <Chip size={"small"}
                                                   color={"error"}
                                                   label={pastTaskDeadlines.length}/>
                                         </Stack>}
                                />}
                        </Tabs>
                        <div style={{marginTop: 15}}>
                            {tabValue === 0 &&
                                (isMentor
                                    ? <UnratedSolutions unratedSolutionsPreviews={unratedSolutionPreviews!}/>
                                    : <TaskDeadlines taskDeadlines={nearestTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                            {tabValue === 1 && !isExpert &&
                                (isLecturer
                                    ? <NewCourseEvents courseEvents={courseEvents!}/>
                                    : <TaskDeadlines taskDeadlines={pastTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                        </div>
                    </Grid>}
                    <Grid item>
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
