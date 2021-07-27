import { Card, Typography, Button, CardActions, CardContent } from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';

import * as React from "react";
import {RouteComponentProps} from 'react-router';
import { AccountDataDto } from "../api/auth";
import "./Styles/Profile.css";

interface Notification {
  sender: string,
  owner: string,
  category: string,
  body: string,
}

interface IProfileState {
  isLoaded: boolean;
  isFound: boolean;
  accountData: AccountDataDto;
  notifications: Notification[];
}

interface IProfileProps {
  id: string;
}

export default class Profile extends React.Component<
  RouteComponentProps<IProfileProps>,
  IProfileState
> {
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
          return (<div>{this.state.notifications.map(n => 
            <Card className="root" variant="outlined" color="">
              <CardContent>
                <Typography variant="body2" component="p">
                  {n.body}
                </Typography>
                <Checkbox color="primary"/>
              </CardContent>
            </Card>
            )}</div>);
      }
      return (<div>Not found</div>);
    }
    return <div>Loading...</div>;
  }

async componentDidMount() {
    const responseData = await fetch("http://localhost:5000/api/account/getUserData", {
      headers:{
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdXNlck5hbWUiOiJBZG1pbiIsIl9pZCI6ImFiOGE1Njg3LTgwYjYtNDE4Yi1hMTIwLWJiMDhhYWY5ZGE1NSIsIl9lbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsIl9yb2xlIjoiTGVjdHVyZXIiLCJuYmYiOjE2Mjc0MDczNDcsImV4cCI6MTYyNzQyNTM0NywiaXNzIjoiQXV0aFNlcnZpY2UifQ.PrdyC31dAzXAbg4Ss4xvESucjwupH-AbUD1YyHdp3CM"
      } 
    });
    const data = await responseData.json();
    this.setState({
      isLoaded: true,
      isFound: true,
      accountData: data.UserData,
      notifications: data.notifications
    });
  }
}



//export default withRouter(Course);