import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import './components/Course'
import Course from "./components/Course";
import Courses from "./components/Courses"
import CreateCourse from "./components/CreateCourse"
import Homework from "./components/Homework"
import Task from "./components/Task"
import AddHomework from "./components/AddHomework"
import TaskSolutionsPage from './components/TaskSolutionsPage'
import AppBar from "./components/AppBar"
import Login from "./components/Login"
import EditCourse from './components/EditCourse'
import EditTask from './components/EditTask'

class App extends Component {
  render() {
    return (
        <div>
          
          <Router>
              <AppBar />
              <Route exact path='/' component={Courses} />
              <Route exact path='/create_course' component={CreateCourse} />
              <Route exact path='/courses/:id' component={Course} />
              <Route exact path='/courses/:courseId/edit' component={EditCourse} />
              <Route exact path='/task/:taskId/:studentId' component={TaskSolutionsPage} />
              <Route exact path='/task/:taskId/edit' component={EditTask} />
              <Route exact path='/login' component={Login} />
          </Router>
        </div>
    );
  }
}

export default App;
