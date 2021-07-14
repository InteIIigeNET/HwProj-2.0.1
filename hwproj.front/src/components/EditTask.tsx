import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect, Link } from "react-router-dom";
import { RouteComponentProps } from "react-router-dom";
import ApiSingleton from "../api/ApiSingleton";

interface IEditTaskState {
  isLoaded: boolean;
  title: string;
  description: string;
  maxRating: number;
  courseId: number;
  courseMentorId: string;
  edited: boolean;
}

interface IEditTaskProps {
  taskId: string;
}

export default class EditTask extends React.Component<
  RouteComponentProps<IEditTaskProps>,
  IEditTaskState
> {
  constructor(props: RouteComponentProps<IEditTaskProps>) {
    super(props);
    this.state = {
      isLoaded: false,
      title: "",
      description: "",
      maxRating: 0,
      courseId: 0,
      courseMentorId: "",
      edited: false,
    };
  }

  public async handleSubmit(e: any) {
    e.preventDefault();

    let taskViewModel = {
      title: this.state.title,
      description: this.state.description,
      maxRating: this.state.maxRating
    };

    await ApiSingleton.taskService.updateTaskByTaskId(
      +this.props.match.params.taskId,
      taskViewModel 
    )
    
    this.setState({ edited: true })
    // ApiSingleton.tasksApi
    //   .apiTasksUpdateByTaskIdPost(+this.props.match.params.taskId, taskViewModel)
    //   .then((res) => this.setState({ edited: true }));
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }

    if (this.state.isLoaded) {
      if (
        !ApiSingleton.authService.getLogginStateFake() ||
        ApiSingleton.authService.getUserIdFake() != +this.state.courseMentorId
      ) {
        return (
          <Typography variant="h6" gutterBottom>
            Только преподаваталь может редактировать задачу
          </Typography>
        );
      }
      return (
        <div>
          &nbsp;{" "}
          <Link to={"/courses/" + this.state.courseId.toString()}>
            Назад к курсу
          </Link>
          <br />
          <br />
          <div className="container">
            <Typography variant="h6" gutterBottom>
              Редактировать задачу
            </Typography>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <TextField
                required
                label="Название задачи"
                variant="outlined"
                margin="normal"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
              <br />
              <TextField
                required
                label="Баллы"
                variant="outlined"
                margin="normal"
                type="number"
                value={this.state.maxRating}
                onChange={(e) => this.setState({ maxRating: +e.target.value })}
              />
              <br />
              <TextField
                multiline
                fullWidth
                rows="4"
                rowsMax="15"
                label="Условие задачи"
                variant="outlined"
                margin="normal"
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <br />
              <Button
                size="small"
                variant="contained"
                color="primary"
                type="submit"
              >
                Редактировать задачу
              </Button>
            </form>
          </div>
        </div>
      );
    }

    return "";
  }

  async componentDidMount() {
    const task = await ApiSingleton.taskService.getTaskByTaskId(+this.props.match.params.taskId)
    const homework = await ApiSingleton.taskService.getHomeworkByTaskId(+this.props.match.params.taskId)
    const course = await ApiSingleton.courseService.getCourseByHomeworkId(homework.id)
    this.setState({
      isLoaded: true,
      title: task.title,
      description: task.description,
      maxRating: task.maxRating,
      courseId: homework.courseId,
      courseMentorId: course.course.mentorId,
    })
  }

  // componentDidMount() {
  //   ApiSingleton.tasksApi
  //     .apiTasksGetByTaskIdGet(+this.props.match.params.taskId)
  //     .then((res) => res.json())
  //     .then((task) =>
  //       ApiSingleton.homeworksApi
  //         .apiHomeworksGetByHomeworkIdGet(task.homeworkId)
  //         .then((res) => res.json())
  //         .then((homework) =>
  //           ApiSingleton.coursesApi
  //             .apiCoursesByCourseIdGet(homework.courseId)
  //             .then((res) => res.json())
  //             .then((course) =>
  //               this.setState({
  //                 isLoaded: true,
  //                 title: task.title,
  //                 description: task.description,
  //                 courseId: homework.courseId,
  //                 courseMentorId: course.mentorId,
  //               })
  //             )
  //         )
  //     );
  // }
}
