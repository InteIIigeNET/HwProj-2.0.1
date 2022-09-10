import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {Typography, CircularProgress, Box, Grid, Tabs, Tab} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {UnratedSolutionPreviews, UserDataDto} from "../api/";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link as RouterLink, Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import {CoursesList} from "./Courses/CoursesList";
import EditIcon from "@material-ui/icons/Edit";
import {TaskDeadlines} from "./Tasks/TaskDeadlines";
import UnratedSolutions from "./Solutions/UnratedSolutions";

interface IWorkspaceState {
    isLoaded: boolean;
    tabValue: number;
}

interface IWorkspaceProps {
    id: string;
}

const useStyles = makeStyles(() => ({
    info: {
        justifyContent: "space-between",
    },
}))

const Workspace: FC<RouteComponentProps<IWorkspaceProps>> = (props) => {
    const [profileState, setProfileState] = useState<IWorkspaceState>({
        isLoaded: false,
        tabValue: 0
    })

    const [accountState, setAccountState] = useState<UserDataDto & { unratedSolutionPreviews: UnratedSolutionPreviews | undefined }>({
        userData: undefined,
        unratedSolutionPreviews: undefined
    })

    const classes = useStyles()
    const isLecturer = ApiSingleton.authService.isLecturer()

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (props.match.params.id) {
            const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(props.match.params.id)
            setAccountState({userData: data, taskDeadlines: [], courses: [], unratedSolutionPreviews: undefined})
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
            isLoaded: true
        }))
    }

    const {userData, courses, taskDeadlines, unratedSolutionPreviews} = accountState
    const {tabValue} = profileState

    if (!ApiSingleton.authService.isLoggedIn()) {
        return <Redirect to={"/login"}/>;
    }

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
                            {isUserProfile &&
                                <Grid item style={{paddingRight: 5}}>
                                    <RouterLink to={"/user/edit"}>
                                        <EditIcon fontSize="small"/>
                                    </RouterLink>
                                </Grid>}
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
                            <Tab label="Курсы"/>
                            {isLecturer
                                ? <Tab
                                    label={`Ожидают проверки (${(unratedSolutionPreviews!.unratedSolutions!.length)})`}/>
                                : <Tab label={`Дедлайны (${(taskDeadlines!.length)})`}/>}
                        </Tabs>
                        {tabValue === 0 && courses &&
                            <div style={{marginTop: 15}}><CoursesList courses={courses!}/></div>}
                        {tabValue === 1 &&
                            (isLecturer
                                ? <div style={{marginTop: 15}}><UnratedSolutions unratedSolutionsPreviews={unratedSolutionPreviews!}/>
                                </div>
                                : <div style={{marginTop: 15}}><TaskDeadlines taskDeadlines={taskDeadlines!}/></div>)}
                    </Grid>}
                </Grid>
            </div>
        )
    }
    return (
        <Box m={2}>
            <p>Загрузка...</p>
            <CircularProgress/>
        </Box>
    )
}

export default Workspace
