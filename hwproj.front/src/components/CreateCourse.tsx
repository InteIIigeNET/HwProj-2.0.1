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

interface ICreateCourseState {
  name: string;
  groupName: string;
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

  public handleSubmit(e: any) {
    e.preventDefault();

    let courseViewModel = {
      name: this.state.name,
      groupName: this.state.groupName,
      isOpen: this.state.isOpen,
    };

    ApiSingleton.coursesApi
      .apiCoursesCreatePost(courseViewModel)
      .then((res) => res.json())
      .then((id) =>
        this.setState({
          created: true,
          courseId: id,
        })
      );
  }

  public render() {
    if (this.state.created) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }
    return (
      <div className="container vertical-center-form">
        <Typography variant="h6" gutterBottom>
          Создать курс
        </Typography>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <TextField
            required
            label="Название курса"
            variant="outlined"
            margin="normal"
            name={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <br />
          <TextField
            required
            label="Номер группы"
            variant="outlined"
            margin="normal"
            value={this.state.groupName}
            onChange={(e) => this.setState({ groupName: e.target.value })}
          />
          <br />
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
          <br />
          <Button
            size="small"
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
