import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {Typography, CircularProgress, Box, Grid, Divider, IconButton} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto, UserDataDto} from "../api/";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Link as RouterLink, Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import {CoursesList} from "./Courses/CoursesList";
import EditIcon from "@material-ui/icons/Edit";

interface IProfileState {
    isLoaded: boolean;
}

interface IProfileProps {
    id: string;
}

const useStyles = makeStyles(() => ({
    info: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

const Profile: FC<RouteComponentProps<IProfileProps>> = (props) => {
    const [profileState, setProfileState] = useState<IProfileState>({
        isLoaded: false
    })

    const [accountState, setAccountState] = useState<UserDataDto>({
        userData: undefined,
        notifications: []
    })

    const classes = useStyles()

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (props.match.params.id) {
            const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(props.match.params.id)
            setAccountState({userData: data, courses: [], notifications: []})
            setProfileState(() => ({
                isLoaded: true
            }))
            return
        }
        const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet()
        setAccountState(data!)
        setProfileState(() => ({
            isLoaded: true
        }))
    }

    const {userData, courses} = accountState


    if (!ApiSingleton.authService.isLoggedIn()) {
        return <Redirect to={"/login"}/>;
    }

    if (profileState.isLoaded) {
        const fullName = userData?.middleName
            ? userData.name + ' ' + userData.middleName + ' ' + userData.surname
            : userData!.name + ' ' + userData!.surname

        return (
            <div className="container" style={{marginBottom: '50px'}}>
                <Grid container style={{marginTop: "15px"}} spacing={2}>
                    <Grid item>
                        <RouterLink to={"/user/edit"}>
                            <EditIcon fontSize="small"/>
                        </RouterLink></Grid>
                    <Grid item xs={11} className={classes.info}>
                        <Typography style={{fontSize: '20px'}}>
                            {fullName}
                        </Typography>
                        <Typography style={{fontSize: '20px', color: "GrayText"}}>
                            {userData!.email}
                        </Typography>
                    </Grid>
                    {courses && <div style={{marginTop: 30}}><CoursesList courses={courses!}/></div>}
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

export default Profile
