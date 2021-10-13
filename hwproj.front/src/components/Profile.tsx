import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {
    Card,
    Typography,
    CardContent,
    Checkbox,
    CircularProgress,
    TextField, Box,
    Tabs, Tab, Grid, ListItem
} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto, NotificationViewModel, UserCourseDescription} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {ChangeEvent, FC, useEffect, useState} from "react";
import {BrowserRouter as Router, Link as RouterLink, Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import {CoursesList} from "./Courses/CoursesList";

interface IProfileState {
    isLoaded: boolean;
    notifications: NotificationViewModel[];
    tab: number;
    courses: UserCourseDescription[];
}

interface IProfileProps {
    id: string;
}

const useStyles = makeStyles(theme => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const Profile: FC<RouteComponentProps<IProfileProps>> = (props) => {
    const [profileState, setProfileState] = useState<IProfileState>({
        isLoaded: false,
        notifications: [],
        tab: 0,
        courses: [],
    })

    const [accountState, setAccountState] = useState<AccountDataDto>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        role: ""
    })

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (props.match.params.id) {
            const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(props.match.params.id)
            setProfileState((prevState) => ({
                ...prevState,
                isLoaded: true
            }))
            setAccountState(data)
            return
        }
        const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet()
        const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet()
        setProfileState((prevState) => ({
            ...prevState,
            isLoaded: true,
            notifications: data.notifications!,
            courses: courses
        }))
        setAccountState(data.userData!)
    }

    const markAsSeenNotification = async (e: ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(e.target.id)
        await ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut([id]);
        const notifications = profileState.notifications;
        notifications.find(not => not.id === id)!.hasSeen = true;
        e.persist()
        setProfileState((prevState) => ({
            ...prevState,
            notifications: notifications
        }))
    }

    const renderNotifications = (notifications: NotificationViewModel[]) => {
        return (
            <div>
                {notifications.map(n =>
                    <Box style={{marginTop: '16px'}}>
                        <Card style={{backgroundColor: "AliceBlue"}}>
                            <CardContent>
                                <Typography variant="body1" component="p">
                                    {parse(n.body!)}
                                </Typography>
                            </CardContent>
                            <Box display="flex" flexDirection="row-reverse">
                                <Checkbox
                                    title="Прочитано"
                                    color="primary"
                                    id={n.id?.toString()}
                                    checked={n.hasSeen}
                                    onChange={markAsSeenNotification}
                                />
                            </Box>
                        </Card>
                    </Box>
                )}
            </div>
        )
    }

    const classes = useStyles()

    if (!ApiSingleton.authService.isLoggedIn()) {
        return <Redirect to={"/login"}/>;
    }

    if (profileState.isLoaded) {
        const fullName = accountState.middleName && accountState.surname
            ? accountState.name + ' ' + accountState.middleName + ' ' + accountState.surname
            : accountState.surname
                ? accountState.name + ' ' + accountState.surname
                : accountState.name
        return (
            <div>
                <Grid container justify="center" style={{marginTop: "15px"}}>
                    <Grid item xs={11} className={classes.info}>
                        <Typography style={{fontSize: '20px'}}>
                            {fullName}
                        </Typography>
                        <Typography style={{fontSize: '20px'}}>
                            {accountState.email}
                        </Typography>
                    </Grid>
                    <Grid item xs={11} style={{marginTop: "25px"}}>
                        {!props.match.params.id &&
                        <div>
                            <Tabs
                                indicatorColor="primary"
                                value={profileState.tab}
                                variant="fullWidth"
                                onChange={(e: React.ChangeEvent<{}>, newValue: number) => {
                                    e.persist()
                                    setProfileState((prevState) => ({
                                        ...prevState,
                                        tab: newValue
                                    }))
                                }}
                            >
                                <Tab label="Курсы" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
                                <Tab label="Новые уведомления" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
                                <Tab label="Все уведомления" id="simple-tab-2" aria-controls="simple-tabpanel-2"/>
                            </Tabs>

                            <div role="tabpanel" hidden={profileState.tab !== 0} id="simple-tab-0">
                                {
                                    <Grid
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="flex-end"
                                        container
                                    >
                                        <Grid item>
                                            <CoursesList courses={profileState.courses}/>
                                        </Grid>
                                    </Grid>
                                }
                            </div>

                            <div role="tabpanel" hidden={profileState.tab !== 1} id="simple-tab-1">
                                {renderNotifications(profileState.notifications.filter(n => !n.hasSeen))}
                            </div>

                            <div role="tabpanel" hidden={profileState.tab !== 2} id="simple-tab-2">
                                {renderNotifications(profileState.notifications)}
                            </div>
                        </div>
                        }
                    </Grid>
                </Grid>
            </div>
        )
    }
    return (
        <Box m={2}>
            <p>Loading...</p>
            <CircularProgress/>
        </Box>
    )
}

export default Profile
