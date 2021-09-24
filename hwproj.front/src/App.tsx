import React, { Component } from "react";
import {
  Route,
  Switch,
  withRouter,
  RouteComponentProps,
} from "react-router-dom";
import "./App.css";
import "./components/Courses/Course";
import Course from "./components/Courses/Course";
import Courses from "./components/Courses/Courses";
import CreateCourse from "./components/Courses/CreateCourse";
import Profile from "./components/Profile";
import TaskSolutionsPage from "./components/Solutions/TaskSolutionsPage";
import { Header } from "./components/AppBar";
import Login from "./components/Auth/Login";
import EditCourse from "./components/Courses/EditCourse";
import EditTask from "./components/Tasks/EditTask";
import EditHomework from "./components/Homeworks/EditHomework";
import Register from "./components/Auth/Register";
import StudentSolutionsPage from "./components/Solutions/StudentSolutionsPage";
import EditProfile from "./components/EditProfile";
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
      loggedIn: ApiSingleton.authService.isLoggedIn(),
      isLecturer: ApiSingleton.authService.isLecturer()
    };
  }

  login = () => {
    this.setState({
      loggedIn: true,
      isLecturer: ApiSingleton.authService.isLecturer()
    })
    this.props.history.push("/");
  }

  logout = () => {
    ApiSingleton.authService.logout();
    this.setState({loggedIn: false});
    this.setState({isLecturer: false});
    this.props.history.push("/login");
  }

    render() {
        return (
            <>
                <Header loggedIn={this.state.loggedIn} isLecturer={this.state.isLecturer} onLogout={this.logout}/>
                <Route exact path="/user/edit" component={EditProfile}/>
                <Route exact path="/" component={Courses}/>
                <Route exact path="/profile" component={Profile}/>
                <Route exact path="/profile/:id" component={Profile}/>
                <Route exact path="/create_course" component={CreateCourse}/>
                <Route exact path="/courses/:id" component={Course}/>
                <Route exact path="/courses/:courseId/edit" component={EditCourse}/>
                <Route
                    exact
                    path="/homework/:homeworkId/edit"
                    component={EditHomework}
                />
                <Switch>
                    <Route exact path="/task/:taskId/edit" component={EditTask}/>
                    <Route
                        exact
                        path="/task/:taskId/:studentId"
                        component={StudentSolutionsPage}
                    />
                    <Route exact path="/task/:taskId/" component={TaskSolutionsPage}/>
                </Switch>
                <Route
                    exact
                    path="/login"
                    render={(props) => <Login {...props} onLogin={this.login}/>}
                />
                <Route
                    exact
                    path="/register"
                    render={(props) => <Register {...props} onLogin={this.login}/>}
                />
            </>
        );
    }
}

export default withRouter(App);
