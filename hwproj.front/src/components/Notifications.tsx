import * as React from "react";
import {ChangeEvent, FC, useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel, FormGroup,
    Grid,
    Typography, Divider
} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {CategorizedNotifications, NotificationViewModel} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {Redirect} from "react-router-dom";
import Utils from "../services/Utils";

let CategoryEnum = CategorizedNotifications.CategoryEnum;
const dateTimeOptions = {year: '2-digit', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'};

function getAll(data: CategorizedNotifications[]) {
    let list: NotificationViewModel[] = [];
    data.forEach(function (item) {
            if (item && item.seenNotifications)
                list = list.concat(item.seenNotifications);
            if (item && item.notSeenNotifications)
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
    onMarkAsSeen: () => void;
}

interface IFilterState {
    categoryFlag: Map<CategorizedNotifications.CategoryEnum, boolean>;
    filteredNotifications: NotificationViewModel[];
    showOnlyUnread: boolean;
    showAll: boolean;
}

const Notifications: FC<IProfileProps> = (props) => {
    const [profileState, setProfileState] = useState<IProfileState>({
        isLoaded: false,
        notifications: []
    })

    const [filterState, setFilterState] = useState<IFilterState>({
        categoryFlag: new Map([
            [CategoryEnum.NUMBER_1, true],
            [CategoryEnum.NUMBER_2, true],
            [CategoryEnum.NUMBER_3, true]
        ]),
        filteredNotifications: [],
        showOnlyUnread: true,
        showAll: true
    });

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        const data = await ApiSingleton.notificationsApi.apiNotificationsGetGet()
        setProfileState((prevState) => ({
            ...prevState,
            isLoaded: true,
            notifications: data!
        }))
        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getAll(data!)?.filter(notification => !notification.hasSeen)!
        }))
    }

    let getNotifications = () => {
        const notifications = profileState.notifications.filter(notification =>
            filterState.categoryFlag.get(notification.category!));
        let array: NotificationViewModel[] = [];
        notifications.forEach(notification =>
            filterState.showOnlyUnread
                ? array = array.concat(notification.notSeenNotifications!)
                : array = array.concat(notification.notSeenNotifications!, notification.seenNotifications!)
        );
        return array;
    }

    let isAllChecked = () => {
        let result = true;
        filterState.categoryFlag.forEach((value) => result = result && value);
        return result;
    }

    const markAsSeenNotification = async (e: ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(e.target.id)
        await ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut([id]);
        await props.onMarkAsSeen()
        const notifications = profileState.notifications;
        notifications.forEach((item) => {
                const temp = item.notSeenNotifications!.find(notification => notification.id === id);
                if (temp != null) {
                    temp.hasSeen = true;
                    item.seenNotifications?.push(temp)
                    item.notSeenNotifications?.splice(item.notSeenNotifications?.indexOf(temp), 1)
                }
            }
        );

        e.persist()
        setProfileState((prevState) => ({
            ...prevState,
            notifications: notifications
        }))
        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getNotifications()
        }));
    }

    const changeShowOnlyUnread = (event: ChangeEvent<HTMLInputElement>) => {
        let notifications = filterState.filteredNotifications;
        if (event.target.checked) {
            notifications = notifications.filter(notification => !notification.hasSeen);
        } else {
            notifications = getAll(profileState.notifications);
        }
        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: notifications,
            showOnlyUnread: !prevState.showOnlyUnread
        }));
    };

    const changeCategory = (event: ChangeEvent<HTMLInputElement>) => {
        filterState.categoryFlag.forEach((value, key) =>
            key.toString() == event.target.value ? filterState.categoryFlag.set(key, !value) : value);

        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getNotifications(),
            showAll: isAllChecked()
        }));
    };

    const changeCheckAll = (event: ChangeEvent<HTMLInputElement>) => {
        filterState.categoryFlag.forEach((value, key) => filterState.categoryFlag.set(key, event.target.checked));

        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getNotifications(),
            showAll: !prevState.showAll
        }));
    };

    const renderNotifications = (notifications: NotificationViewModel[]) => {
        return (
            <div>
                {notifications.map((n, index) =>
                    <Box style={{marginBottom: '16px'}} key={index}>
                        <Card style={{backgroundColor: n.hasSeen! ? "#eceef8" : "aliceblue"}}>
                            <CardContent>
                                <Typography variant="body1" component="p">
                                    {parse(n.body!)}
                                </Typography>
                                <Typography variant="body1">
                                    {parse(Utils.convertUTCDateToLocalDate(n.date!).toLocaleDateString("ru-RU", dateTimeOptions))}
                                </Typography>
                            </CardContent>
                            {!n.hasSeen && <Box display="flex" flexDirection="row-reverse">
                                <Checkbox
                                    title="Прочитано"
                                    color="primary"
                                    id={n.id?.toString()}
                                    checked={n.hasSeen}
                                    onChange={markAsSeenNotification}
                                />
                            </Box>}
                        </Card>
                    </Box>
                )}
            </div>
        )
    }

    if (!ApiSingleton.authService.isLoggedIn()) {
        return <Redirect to={"/login"}/>;
    }

    if (profileState.isLoaded) {
        return <div className="container" style={{marginTop: 15}}>
            <Grid container spacing={2} direction={"row"}>
                <Grid lg={4} item>
                    <Card style={{backgroundColor: "#f7fafc"}}>
                        <CardContent>
                            <FormControlLabel control={
                                <Checkbox
                                    checked={filterState.showOnlyUnread}
                                    onChange={changeShowOnlyUnread}
                                    inputProps={{'aria-label': 'controlled'}}
                                />
                            } label="Только непрочитанные"/>
                            <Divider/>
                            <div style={{maxWidth: '300px'}}>
                                <FormGroup>
                                    <FormControlLabel control={
                                        <Checkbox
                                            checked={filterState.showAll}
                                            onChange={changeCheckAll}
                                            value={filterState.showAll}
                                            inputProps={{'aria-label': 'controlled'}}
                                        />
                                    } label="Показать все"
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
                                </FormGroup>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item lg={8}>
                    {renderNotifications(filterState.filteredNotifications
                        .sort((first, second) => first.date! <= second.date! ? 1 : -1))}
                </Grid>
            </Grid>
        </div>
    }
    return (
        <Box sx={{minWidth: 150}}>
            <p>Загрузка...</p>
            <CircularProgress/>
        </Box>
    )
}

export default Notifications
