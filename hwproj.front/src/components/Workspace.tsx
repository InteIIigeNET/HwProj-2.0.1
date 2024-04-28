import * as React from "react";
import {Typography, CircularProgress, Grid, Tabs, Tab} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {UnratedSolutionPreviews, UserDataDto} from "../api/";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link as RouterLink, useParams} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import EditIcon from "@material-ui/icons/Edit";
import TaskDeadlines from "./Tasks/TaskDeadlines";
import UnratedSolutions from "./Solutions/UnratedSolutions";
import {Chip, Stack} from "@mui/material";
import NewCourseEvents from "./Courses/NewCourseEvents";

interface IWorkspaceState {
    isLoaded: boolean;
    tabValue: number;
}

const useStyles = makeStyles(() => ({
    info: {
        justifyContent: "space-between",
    },
}))

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

    const classes = useStyles()
    const isLecturer = ApiSingleton.authService.isLecturer()

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (id) {
            const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(id)
            setAccountState({userData: data, taskDeadlines: [], courseEvents: [], unratedSolutionPreviews: undefined})
            setProfileState(prevState => ({
                ...prevState,
                isLoaded: true
            }))
            return
        }
        const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet()
        const unratedSolutions = isLecturer
            ? await ApiSingleton.solutionsApi.apiSolutionsUnratedSolutionsGet()
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
    const pastTaskDeadlines = taskDeadlines?.filter(x => x.deadlinePast) || []

    if (profileState.isLoaded) {
        const isUserProfile = userData!.userId === ApiSingleton.authService.getUserId()
        const fullName = userData?.middleName
            ? userData.name + ' ' + userData.middleName + ' ' + userData.surname
            : userData!.name + ' ' + userData!.surname

        return (
            <div className="container" style={{marginBottom: '50px'}}>
                <Grid container style={{marginTop: "15px"}} spacing={2}>
                    <Grid item container className={classes.info} direction={"row"}>
                        <Grid item direction={"row"} spacing={2} style={{display: "flex"}}>
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
                    {isUserProfile && <Grid item>
                        <Tabs
                            value={tabValue}
                            style={{marginTop: 15}}
                            indicatorColor="primary"
                            onChange={(event, value) => {
                                setProfileState(prevState => ({
                                    ...prevState,
                                    tabValue: value
                                }));
                            }}
                        >
                            {isLecturer && <Tab label={
                                <Stack direction="row" spacing={1}>
                                    <div>Ожидают проверки</div>
                                    <Chip size={"small"} color={"default"}
                                          label={(unratedSolutionPreviews!.unratedSolutions!.length)}/>
                                </Stack>}/>}
                            {isLecturer && courseEvents!.length > 0 && <Tab label={<Stack direction="row" spacing={1}>
                                <div>Курсы</div>
                                <Chip size={"small"} color={"primary"}
                                      label={(courseEvents!.length)}/>
                            </Stack>}/>}

                            {!isLecturer && <Tab label={
                                <Stack direction="row" spacing={1}>
                                    <div>Дедлайны</div>
                                    <Chip size={"small"} color={"default"}
                                          label={(nearestTaskDeadlines!.length)}/>
                                </Stack>}/>}
                            {!isLecturer && pastTaskDeadlines.length > 0 &&
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
                                (isLecturer
                                    ? <UnratedSolutions unratedSolutionsPreviews={unratedSolutionPreviews!}/>
                                    : <TaskDeadlines taskDeadlines={nearestTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                            {tabValue === 1 &&
                                (isLecturer
                                    ? <NewCourseEvents courseEvents={courseEvents!}/>
                                    : <TaskDeadlines taskDeadlines={pastTaskDeadlines}
                                                     onGiveUpClick={onGiveUpClick}/>)}
                        </div>
                    </Grid>}
                </Grid>
            </div>
        )
    }
    return (
        <div className="container">
            <p>Загрузка...</p>
            <CircularProgress/>
        </div>
    )
}

export default Workspace
