import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

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
import Register from "./components/Auth/Register";
import StudentSolutionsPage from "./components/StudentSolutionsPage";
import EditProfile from "./components/EditProfile";
import InviteNewLecturer from "./components/InviteNewLecturer";

class App extends Component {
  render() {
    return (
        <div>
          <Router>
                <AppBar />
                <Route exact path="/invite_lecturer" component={InviteNewLecturer} />
                <Route exact path="/user/edit" component={EditProfile} />
                <Route exact path="/" component={Courses} />
                <Route exact path="/create_course" component={CreateCourse} />
                <Route exact path="/courses/:id" component={Course} />
                <Route exact path="/courses/:courseId/edit" component={EditCourse} />
                <Route exact path="/homework/:homeworkId/edit" component={EditHomework} />
                <Switch>
                  <Route exact path="/task/:taskId/edit" component={EditTask} />
                  <Route exact path="/task/:taskId/:studentId"component={StudentSolutionsPage} />
                  <Route exact path="/task/:taskId/" component={TaskSolutionsPage} />
                </Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
          </Router>
        </div>
    );
  }
}

export default App;
