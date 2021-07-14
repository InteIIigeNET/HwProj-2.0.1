import React, { Component } from "react";
import {
  Route,
  Switch,
  withRouter,
  RouteComponentProps,
} from "react-router-dom";

import "./App.css";
import "./components/Course";
import Course from "./components/Course";
import Courses from "./components/Courses/Courses";
import CreateCourse from "./components/CreateCourse";
import TaskSolutionsPage from "./components/TaskSolutionsPage";
import AppBar from "./components/AppBar";
import Login from "./components/Auth/Login";
import EditCourse from "./components/EditCourse";
import EditTask from "./components/EditTask";
import EditHomework from "./components/EditHomework";
import { Register } from "./components/Auth/Register";
import StudentSolutionsPage from "./components/StudentSolutionsPage";
import EditProfile from "./components/EditProfile";
import InviteNewLecturer from "./components/InviteNewLecturer";
import ApiSingleton from "./api/ApiSingleton";

type AppProps = RouteComponentProps;

interface AppState {
  loggedIn: boolean;
  isLecturer: boolean;
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      loggedIn: ApiSingleton.authService.getLogginStateFake(),
      isLecturer: ApiSingleton.authService.getRoleFake()
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login() {
    ApiSingleton.authService.loginFake();
    this.setState({loggedIn: true})
    if (ApiSingleton.authService.getRoleFake()){
      this.setState({isLecturer: true})
    }
    this.props.history.push("/");
  }

  logout() {
    ApiSingleton.authService.logoutFake();
    ApiSingleton.authService.setRoleFake("");
    ApiSingleton.authService.setUserIdFake(-1);
    this.setState({loggedIn: false});
    this.setState({isLecturer: false});
    this.props.history.push("/");
  }

  render() {
    return (
      <>
        <AppBar loggedIn={this.state.loggedIn} isLecturer={this.state.isLecturer} onLogout={this.logout} />
        <Route exact path="/invite_lecturer" component={InviteNewLecturer} />
        <Route exact path="/user/edit" component={EditProfile} />
        <Route exact path="/" component={Courses} />
        <Route exact path="/create_course" component={CreateCourse} />
        <Route exact path="/courses/:id" component={Course} />
        <Route exact path="/courses/:courseId/edit" component={EditCourse} />
        <Route
          exact
          path="/homework/:homeworkId/edit"
          component={EditHomework}
        />
        <Switch>
          <Route exact path="/task/:taskId/edit" component={EditTask} />
          <Route
            exact
            path="/task/:taskId/:studentId"
            component={StudentSolutionsPage}
          />
          <Route exact path="/task/:taskId/" component={TaskSolutionsPage} />
        </Switch>
        <Route
          exact
          path="/login"
          render={(props) => <Login {...props} onLogin={this.login} />}
        />
        <Route exact path="/register" component={Register} />
      </>
    );
  }
}

export default withRouter(App);
