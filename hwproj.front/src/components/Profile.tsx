import * as React from "react";
import {RouteComponentProps} from 'react-router';
import { Card, Typography, CardContent, Checkbox, CircularProgress, TextField, Box, Tabs, Tab } from "@material-ui/core";
import ApiSingleton from "api/ApiSingleton";
import { AccountDataDto, NotificationViewModel } from "../api/";
import "./Styles/Profile.css";
import parse from 'html-react-parser';

interface IProfileState {
  isLoaded: boolean;
  accountData: AccountDataDto;
  notifications: NotificationViewModel[];
  tab: number;
}

interface IProfileProps {
  id: string;
}

export default class Profile extends React.Component<RouteComponentProps<IProfileProps>, IProfileState> {
	constructor(props: RouteComponentProps<IProfileProps>) {
		super(props);
		this.state = {
			isLoaded: false,
			accountData: {
				name: "",
				surname: "",
				middleName: "",
				email: "",
				role: ""
			},
			notifications: [],
			tab: 0,
		}
	}
  
	public render() {
		const { isLoaded, accountData, notifications } = this.state;
		if (isLoaded) {
			return (
			<div>
				<Box m={2}>
					<TextField id="name" variant="filled" label="Имя" disabled defaultValue={accountData.name} />
					<TextField id="middleName" variant="filled" label="Отчество" disabled defaultValue={accountData.middleName} />
					<TextField id="surname" variant="filled" label="Фамилия" disabled defaultValue={accountData.surname} />
					<TextField id="email" variant="filled" label="Email" disabled defaultValue={accountData.email} />
					<TextField className="role" id="role" variant="outlined" label="Роль" disabled defaultValue={accountData.role} />
				</Box>
				<hr /><br />

				{ !this.props.match.params.id &&

				<div>
					<Tabs 
						onChange={(event: React.ChangeEvent<{}>, newValue: number) => this.setState({tab: newValue}) } 
						indicatorColor="primary"
						value={this.state.tab}
						variant="fullWidth"
					>
						<Tab label="Новые уведомления" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
						<Tab label="Все уведомления" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
					</Tabs>

					<div role="tabpanel" hidden={this.state.tab !== 0} id="simple-tab-0">
						{this.renderNotifications(notifications.filter( n => !n.hasSeen ))}
					</div>
					<div role="tabpanel" hidden={this.state.tab !== 1} id="simple-tab-1">
						{this.renderNotifications(notifications)}
					</div>
				</div>
				}
			</div>);
		}
		return <Box m={2}>
				<p>Loading...</p>
				<CircularProgress />
			</Box>;
	}

	async componentDidMount() {
		if (!ApiSingleton.authService.isLoggedIn()) {
			window.location.assign("/login");
		}

		if (this.props.match.params.id) {
			const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(this.props.match.params.id);
			this.setState({
				isLoaded: true,
				accountData: data!,
			});
		}
		else {
			const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet();
			this.setState({
				isLoaded: true,
				accountData: data.userData!,
				notifications: data.notifications!,
			});
		}
	}

	public renderNotifications(notifications: NotificationViewModel[]) {  
		return (<div>
			{notifications.map(n => 
			<Box m={2}>
				<Card style={{backgroundColor: "AliceBlue"}}>
					<CardContent >
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
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								const id = parseInt(event.target.id);
								ApiSingleton.notificationsApi.apiNotificationsMarkAsSeenPut([ id ]);
								
								const notifications = this.state.notifications;
								notifications.find(not => not.id === id)!.hasSeen = true;
								this.setState({ notifications: notifications, });
							}}
						/>
					</Box>
				</Card>
			</Box>)}
		</div>);
	  }
}
