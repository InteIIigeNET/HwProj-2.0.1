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
    FormControlLabel, FormGroup,
    Grid,
    Typography
} from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import {AccountDataDto, CategorizedNotifications, NotificationViewModel} from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

let CategoryEnum = CategorizedNotifications.CategoryEnum;
const dateTimeOptions = {year: '2-digit', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'};

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
    showOnlyUnread: boolean;
    isCheckAll: boolean;
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
            [CategoryEnum.NUMBER_1, true],
            [CategoryEnum.NUMBER_2, true],
            [CategoryEnum.NUMBER_3, true]
        ]),
        filteredNotifications: [],
        showOnlyUnread: true,
        isCheckAll: true
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
            filteredNotifications: getAll(data.notifications!)?.filter(notification => !notification.hasSeen)!
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
                                    {parse(ApiSingleton.utils.convertUTCDateToLocalDate(n.date!).toLocaleDateString("ru-RU", dateTimeOptions))}
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

    if (!ApiSingleton.authService.isLoggedIn()) {
        return <Redirect to={"/login"}/>;
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
        filterState.categoryFlag.forEach((value, key) => result = result && value);
        return result;
    }

    const changeCategory = (event: ChangeEvent<HTMLInputElement>) => {
        filterState.categoryFlag.forEach((value, key) =>
            key.toString() == event.target.value ? filterState.categoryFlag.set(key, !value) : value);

        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getNotifications(),
            isCheckAll: isAllChecked()
        }));
    };

    const changeCheckAll = (event: ChangeEvent<HTMLInputElement>) => {
        filterState.categoryFlag.forEach((value, key) => filterState.categoryFlag.set(key, event.target.checked));

        setFilterState((prevState) => ({
            ...prevState,
            filteredNotifications: getNotifications(),
            isCheckAll: !prevState.isCheckAll
        }));
    };

    if (profileState.isLoaded) {
        return <div style={{marginBottom: '50px'}}>
            <Grid container justifyContent="center" style={{marginTop: "15px"}}>
                <Grid item xs={11}>
                    <FormControlLabel control={
                        <Checkbox
                            checked={filterState.showOnlyUnread}
                            onChange={changeShowOnlyUnread}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    } label="Показывать только непрочитанные"
                    />
                    <div style={{maxWidth: '300px'}}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <div>
                                    <Typography style={{fontSize: '16px'}}>
                                        Фильтрация
                                    </Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormGroup>
                                    <FormControlLabel control={
                                        <Checkbox
                                            checked={filterState.isCheckAll}
                                            onChange={changeCheckAll}
                                            value={filterState.isCheckAll}
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
                            </AccordionDetails>
                        </Accordion>
                    </div>

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
