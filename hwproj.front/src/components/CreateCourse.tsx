import * as React from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { Redirect } from "react-router-dom";

import ApiSingleton from "../api/ApiSingleton";
import './Styles/CreateCourse.css';

interface ICreateCourseState {
  name: string;
  groupName: string;
  isOpen: boolean;
  created: boolean;
  courseId: string;
}

// interface ICourseMate {
//   studentId: number,
//   isAccepted: boolean
// }

export default class CreateCourse extends React.Component<
  {},
  ICreateCourseState
> {
  state = {
    name: "",
    groupName: "",
    isOpen: false,
    created: false,
    courseId: "",
  };

  // public handleSubmit(e: any) {
  //   e.preventDefault();

  //   let courseViewModel = {
  //     name: this.state.name,
  //     groupName: this.state.groupName,
  //     isOpen: this.state.isOpen,
  //   };

  //   ApiSingleton.coursesApi
  //     .apiCoursesCreatePost(courseViewModel)
  //     .then((res) => res.json())
  //     .then((id) =>
  //       this.setState({
  //         created: true,
  //         courseId: id,
  //       })
  //     );
  // }

  async handleSubmit(e: any) {
    e.preventDefault();

    const userId = ApiSingleton.authService.getUserIdFake()
    const response = await fetch("http://localhost:3001/login")
    const data = await response.json()
    const user = data.filter((item: any) => item.id == userId).shift()

    let courseViewModel = {
      name: this.state.name,
      groupName: this.state.groupName,
      isOpen: this.state.isOpen,
      isCompleted: false,
      course: {
        mentorId: userId
      },
      mentor: {
        name: user.name,
        surname: user.surname,
        middleName: user.middleName,
        email: user.email,
      },
      homeworks: [],
      courseMates: [],
    };
    await fetch("http://localhost:3001/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(courseViewModel)
    })
  }

  public render() {
    if (!ApiSingleton.authService.getRoleFake()){
      <Typography component="h1" variant="h5">
          Страница не доступна
      </Typography>
    }
    if (this.state.created) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }
    return (
      <div className="page">
        <Typography component="h1" variant="h5">
          Создать курс
        </Typography>
        <form onSubmit={(e) => this.handleSubmit(e)} className="form">
          <TextField
            required
            label="Название курса"
            variant="outlined"
            margin="normal"
            name={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <TextField
            required
            label="Номер группы"
            variant="outlined"
            margin="normal"
            value={this.state.groupName}
            onChange={(e) => this.setState({ groupName: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                color="primary"
                checked={this.state.isOpen}
                onChange={(e) => this.setState({ isOpen: e.target.checked })}
              />
            }
            label="Открытый курс"
          />
          <Button
            size="large"
            variant="contained"
            color="primary"
            type="submit"
          >
            Создать курс
          </Button>
        </form>
      </div>
    );
  }
}