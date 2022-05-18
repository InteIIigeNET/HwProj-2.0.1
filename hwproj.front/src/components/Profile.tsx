import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {Typography, CircularProgress, Box, Grid} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto} from "../api/";
import "./Styles/Profile.css";
import {FC, useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";

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

    const [accountState, setAccountState] = useState<AccountDataDto>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        role: ""
    })

    const classes = useStyles()

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        if (props.match.params.id) {
            const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(props.match.params.id)
            setProfileState(() => ({
                isLoaded: true
            }))
            setAccountState(data)
            return
        }
        const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet()
        setProfileState(() => ({
            isLoaded: true
        }))
        setAccountState(data.userData!)
    }


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
            <div style={{marginBottom: '50px'}}>
                <Grid container justifyContent="center" style={{marginTop: "15px"}}>
                    <Grid item xs={11} className={classes.info}>
                        <Typography style={{fontSize: '20px'}}>
                            {fullName}
                        </Typography>
                        <Typography style={{fontSize: '20px'}}>
                            {accountState.email}
                        </Typography>
                    </Grid>
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