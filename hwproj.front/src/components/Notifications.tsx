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
import {Button} from "@mui/material";

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

function getAllNotSeen(data: CategorizedNotifications[]) {
    let list: NotificationViewModel[] = [];
    data.forEach(function (item) {
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

    const allNotSeen = getAllNotSeen(profileState.notifications)

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

    const markAsSeenNotifications = async (ids: number[]) => {
        await ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut(ids);
        await props.onMarkAsSeen();
        await getUserInfo();
    }

    const markAllNotificationsAsSeen = async () => {
        const ids = allNotSeen.map(x => x.id!)
        await markAsSeenNotifications(ids)
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
                                    {parse(new Date(n.date!).toLocaleString("ru-RU", dateTimeOptions))}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </div>
        )
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
                            <div>
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
                                    {allNotSeen.length != 0 && <Button fullWidth variant="contained" onClick={markAllNotificationsAsSeen}>Прочитать все</Button>}
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
