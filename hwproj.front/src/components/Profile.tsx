import * as React from "react";
import {ChangeEvent, FC, useEffect, useState} from "react";
import {RouteComponentProps} from 'react-router';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel, Link, ListItem,
    MenuItem,
    OutlinedInput,
    Typography
} from "@material-ui/core";
import Select, {SelectChangeEvent} from '@mui/material/Select';
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto, CategorizedNotifications, NotificationViewModel} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import List from "@material-ui/core/List";

let CategoryEnum = CategorizedNotifications.CategoryEnum;
const options = {year: '2-digit', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'};

function getAll(data: CategorizedNotifications[]) {
    let list: NotificationViewModel[] = [];
    data.forEach(function (item) {
            if (item != null && item.seenNotifications != undefined)
                list = list.concat(item.seenNotifications);
            if (item != null && item.notSeenNotifications != undefined)
                list = list.concat(item.notSeenNotifications);
        }
    );
    return list!;
}

interface IProfileState {
    isLoaded: boolean;
    notifications: CategorizedNotifications[];
}

interface IProfileProps {
    id: string;
}

interface IFilterState {
    categoryFlag: Map<CategorizedNotifications.CategoryEnum, boolean>;
    filteredNotifications: NotificationViewModel[];
    showAll: boolean;
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
        categoryFlag: new Map([
            [CategoryEnum.NUMBER_0, false],
            [CategoryEnum.NUMBER_1, true],
            [CategoryEnum.NUMBER_2, true],
            [CategoryEnum.NUMBER_3, true]
        ]),
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
        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getAll(data.notifications!)!
        }))
        setAccountState(data.userData!)
    }

    const markAsSeenNotification = async (e: ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(e.target.id)
        await ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut([id]);
        const notifications = profileState.notifications;
        notifications.forEach((item) => {
                const temp = item.notSeenNotifications!.find(notification => notification.id === id);
                if (temp != null)
                    temp.hasSeen = true;
            }
        );

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
                                <Typography variant="body1">
                                    {parse(ApiSingleton.utils.convertUTCDateToLocalDate(n.date!).toLocaleDateString("ru-RU", options))}
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

    const changeShowAll = (event: ChangeEvent<HTMLInputElement>) => {
        let notifications = filterState.filteredNotifications;
        if (!event.target.checked) {
            notifications = notifications.filter(notification => !notification.hasSeen);
        } else {
            notifications = getAll(profileState.notifications);
            // profileState.notifications.forEach(item =>
            //     filterState.categoryFlag.get(item.category!) ? notifications.concat(item.seenNotifications!) : notifications);
        }
        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: notifications,
            showAll: !prevState.showAll
        }));
    };

    const changeCategory = (event: ChangeEvent<HTMLInputElement>) => {
        filterState.categoryFlag.forEach((value, key) =>
            key.toString() == event.target.value ? filterState.categoryFlag.set(key, !value) : value);

        const notifications = profileState.notifications.filter(notification =>
            filterState.categoryFlag.get(notification.category!));
        let array: NotificationViewModel[] = [];
        notifications.forEach(notification =>
            filterState.showAll
                ? array = array.concat(notification.notSeenNotifications!, notification.seenNotifications!)
                : array = array.concat(notification.notSeenNotifications!)
        );

        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: array
        }));
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


                {/*Нужно обернуть в accordion*/}
                <Grid item xs={11}>
                    <FormControlLabel control={
                        <Checkbox
                            checked={filterState.showAll}
                            onChange={changeShowAll}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    } label="Показывать все уведомления"
                    />
                    <FormControlLabel control={
                        <Checkbox
                            checked={filterState.categoryFlag.get(CategoryEnum.NUMBER_1)}
                            onChange={changeCategory}
                            value={CategoryEnum.NUMBER_1}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    } label="Профиль"
                    />
                    <FormControlLabel control={
                        <Checkbox
                            checked={filterState.categoryFlag.get(CategoryEnum.NUMBER_2)}
                            onChange={changeCategory}
                            value={CategoryEnum.NUMBER_2}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    } label="Курсы"
                    />
                    <FormControlLabel control={
                        <Checkbox
                            checked={filterState.categoryFlag.get(CategoryEnum.NUMBER_3)}
                            onChange={changeCategory}
                            value={CategoryEnum.NUMBER_3}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    } label="Домашние задания"
                    />
                    {renderNotifications(filterState.filteredNotifications)}
                </Grid>
            </Grid>
        </div>
    }
    return (
        <Box sx={{minWidth: 150}}>
            <p>Loading...</p>
            <CircularProgress/>
        </Box>
    )
}

export default Profile
