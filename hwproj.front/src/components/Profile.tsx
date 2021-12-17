import * as React from "react";
import {RouteComponentProps} from 'react-router';
import {
    Card,
    Typography,
    CardContent,
    Checkbox,
    CircularProgress,
    Box,
    Grid,
    InputLabel,
    MenuItem, FormControlLabel
} from "@material-ui/core";
import Select, {SelectChangeEvent} from '@mui/material/Select';
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto, CategorizedNotifications, NotificationViewModel} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {ChangeEvent, FC, useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";

interface IProfileState {
    isLoaded: boolean;
    notifications: CategorizedNotifications[];
}

interface IProfileProps {
    id: string;
}

type CategoriesMap<T> = {
    [Property in keyof T]: boolean;
};

interface IFilterState {
    categoryFlag: CategoriesMap<CategorizedNotifications.CategoryEnum>;
    filteredNotifications: NotificationViewModel[];
    showAll: boolean
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
        notifications: []
    })

    const [accountState, setAccountState] = useState<AccountDataDto>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        role: ""
    })
    
    const [filterState, setFilterState] = useState<IFilterState>({
        categoryFlag: 0,
        filteredNotifications: [],
        showAll: true
    });

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
        setProfileState((prevState) => ({
            ...prevState,
            isLoaded: true,
            notifications: data.notifications!
        }))
        setAccountState(data.userData!)
    }

    const markAsSeenNotification = async (e: ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(e.target.id)
        await ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut([id]);
        const notifications = profileState.notifications;
        notifications.forEach(item => item.notSeenNotifications!.find(not => not.id === id)!.hasSeen = true);
        e.persist()
        setProfileState((prevState) => ({
            ...prevState,
            notifications: notifications
        }))
    }

    const renderNotifications = (notifications: NotificationViewModel[]) => {
        return (
            <div>
                {notifications.map((n, index) =>
                    <Box style={{marginTop: '16px'}} key={index}>
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

    const markShowAll = (event: ChangeEvent<HTMLInputElement>) => {
        setFilterState((prevState) => ({
            ...prevState,
            showAll: event.target.checked
        }))
    };

    const handleChange = (event: SelectChangeEvent<typeof NotificationViewModel.CategoryEnum>) => {
        //change state
        
        const notifications = profileState.notifications.filter(not => not.category!.toString() === event.target.value);
        const array = [] as NotificationViewModel[];
        notifications.forEach(not => array.concat(not.notSeenNotifications!));
    };

    if (profileState.isLoaded) {
        const fullName = accountState.middleName && accountState.surname
            ? accountState.name + ' ' + accountState.middleName + ' ' + accountState.surname
            : accountState.surname
                ? accountState.name + ' ' + accountState.surname
                : accountState.name
        return <div style={{marginBottom: '50px'}}>
            <Grid container justifyContent="center" style={{marginTop: "15px"}}>
                <Grid item xs={11} className={classes.info}>
                    <Typography style={{fontSize: '20px'}}>
                        {fullName}
                    </Typography>
                    <Typography style={{fontSize: '20px'}}>
                        {accountState.email}
                    </Typography>
                </Grid>
                
                <FormControlLabel control={
                    <Checkbox
                        checked={filterState.showAll}
                        onChange={markShowAll}
                        inputProps={{'aria-label': 'controlled'}}
                    />
                } label="Показывать все уведомления"
                />

                <InputLabel id="notification-category-label">Категория</InputLabel>
                <Select
                    labelId="notification-category-label"
                    id="notification-category"
                    multiple
                    value={NotificationViewModel.CategoryEnum}
                    label="Категория"
                    onChange={handleChange}
                >
                    <MenuItem value={NotificationViewModel.CategoryEnum.NUMBER_1}>Профиль</MenuItem>
                    <MenuItem value={NotificationViewModel.CategoryEnum.NUMBER_2}>Курсы</MenuItem>
                    <MenuItem value={NotificationViewModel.CategoryEnum.NUMBER_3}>Домашки</MenuItem>
                </Select>
                //renderNotifications
            </Grid>
        </div>
    }
    return (
        <Box m={2}>
            <p>Loading...</p>
            <CircularProgress/>
        </Box>
    )
}

export default Profile
