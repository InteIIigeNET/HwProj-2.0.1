import * as React from "react";
import {RouteComponentProps} from 'react-router';

import { Card, Typography, CardContent, Checkbox, CircularProgress, TextField, Box } from "@material-ui/core";

import ApiSingleton from "api/ApiSingleton";
import { AccountDataDto, NotificationViewModel } from "../api/auth";

import "./Styles/Profile.css";

interface IProfileState {
  isLoaded: boolean;
  isFound: boolean;
  accountData: AccountDataDto;
  notifications: NotificationViewModel[];
}

interface IProfileProps {
  id: string;
}

export default class Profile extends React.Component<RouteComponentProps<IProfileProps>, IProfileState> {
	constructor(props: RouteComponentProps<IProfileProps>) {
		super(props);
		this.state = {
			isLoaded: false,
			isFound: false,
			accountData: {
				name: "",
				surname: "",
				middleName: "",
				email: "",
				role: ""
			},
			notifications: []
		}
	}
  
	public render() {
		const { isLoaded, isFound, accountData, notifications } = this.state;
		if (isLoaded) {
			if (isFound) {
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

					{notifications.map(n => 
					<Box m={2} bgcolor="AliceBlue" clone>
						<Card>
							<CardContent >
								<Typography variant="body1" component="p">
									{n.body}
								</Typography>
							</CardContent>
							<Box display="flex" flexDirection="row-reverse"><Checkbox color="primary"/></Box>
						</Card>
					</Box>)}
				</div>);
			}
			return (<div>Not found</div>);
		}
		return <div>
				<p>Loading...</p>
				<CircularProgress />
			</div>;
	}

	async componentDidMount() {
		if (this.props.match.params.id) {
			const data = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(this.props.match.params.id);
			this.setState({
				isLoaded: true,
				isFound: true,
				accountData: data!,
			});
		}
		else {
			const token = ApiSingleton.authService.getToken();
			const data = await ApiSingleton.accountApi.apiAccountGetUserDataGet({ headers: {"Authorization": `Bearer ${token}`} });
			this.setState({
				isLoaded: true,
				isFound: true,
				accountData: data.userData!,
				notifications: data.notifications!,
			});
		}
	}
}



//export default withRouter(Course);