import * as React from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { Redirect } from "react-router-dom";

import ApiSingleton from "../../api/ApiSingleton";
import './Styles/CreateCourse.css';

interface ICreateCourseState {
  name: string;
  groupName?: string;
  isOpen: boolean;
  created: boolean;
  courseId: string;
}

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

  async handleSubmit(e: any) {
    e.preventDefault();

    let courseViewModel = {
      name: this.state.name,
      groupName: this.state.groupName,
      isOpen: this.state.isOpen,
    };
    const token = ApiSingleton.authService.getToken();
    const id = await ApiSingleton.coursesApi.apiCoursesCreatePost(courseViewModel, { headers: {"Authorization": `Bearer ${token}`} })
    if (id) {
      window.location.assign("/")
    }
    else {
      console.log("Something wrong!")
    }
  }

  public render() {
    if (!ApiSingleton.authService.isLecturer){
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