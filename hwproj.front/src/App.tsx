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
import TaskSolutions from './components/TaskSolutions'
import AppBar from "./components/AppBar"

class App extends Component {
  render() {
    return (
        <div>
          <AppBar />
          <Router>
              <Route exact path='/' component={Courses} />
              <Route exact path='/create_course' component={CreateCourse} />
              <Route exact path='/courses/:id' component={Course} />
              <Route exact path='/task/:taskId/:studentId' component={TaskSolutions} />
          </Router>
        </div>
    );
  }
}

export default App;
