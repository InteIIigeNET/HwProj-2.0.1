import * as React from "react";
import {RouteComponentProps} from 'react-router';
import { Card,
	Typography,
	CardContent,
	Checkbox,
	CircularProgress,
	TextField, Box,
	Tabs, Tab, Grid } from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import { AccountDataDto, NotificationViewModel } from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';
import {ChangeEvent, FC, useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";

interface IProfileState {
  isLoaded: boolean;
  notifications: NotificationViewModel[];
  tab: number;
}

interface IProfileProps {
  id: string;
}

const useStyles = makeStyles( theme => ({
	info: {
		display: "flex",
		justifyContent: "space-between",
	},
}));

const Profile: FC<RouteComponentProps<IProfileProps>> = (props) => {
	const [profileState, setProfileState] = useState<IProfileState>({
		isLoaded: false,
		notifications: [],
		tab: 0,
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
					<Box m={2}>
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
				<Grid container justify="center" style={{ marginTop: "15px" }}>
					<Grid item xs={11} className={classes.info}>
						<Typography component="h1" variant="h5">
							{fullName}
						</Typography>
						<Typography component="h1" variant="h5">
							{accountState.email}
						</Typography>
					</Grid>
					<Grid item xs={12} style={{ marginTop: "15px" }}>
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
								<Tab label="Новые уведомления" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
								<Tab label="Все уведомления" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
							</Tabs>

							<div role="tabpanel" hidden={profileState.tab !== 0} id="simple-tab-0">
								{renderNotifications(profileState.notifications.filter(n => !n.hasSeen))}
							</div>
							<div role="tabpanel" hidden={profileState.tab !== 1} id="simple-tab-1">
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
