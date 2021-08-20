import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect, Link } from "react-router-dom";
import { RouteComponentProps } from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import Checkbox from "@material-ui/core/Checkbox";

interface IEditTaskState {
  isLoaded: boolean;
  title: string;
  description: string;
  maxRating: number;
  courseId: number;
  courseMentorId: string;
  edited: boolean;
  hasDeadline: boolean;
  deadlineDate: Date | undefined;
  isDeadlineStrict: boolean;
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
      hasDeadline: false,
      deadlineDate: new Date(),
      isDeadlineStrict: false
    };
  }

  public async handleSubmit(e: any) {
    e.preventDefault();
    // ReDo
    if (this.state.hasDeadline) {
      this.setState({
        deadlineDate: new Date(this.state.deadlineDate!.setHours(this.state.deadlineDate!.getHours() + 3))
      })
    }
    const token = ApiSingleton.authService.getToken();
    ApiSingleton.tasksApi
      .apiTasksUpdateByTaskIdPut(+this.props.match.params.taskId, this.state, { headers: {"Authorization": `Bearer ${token}`} })
      .then((res) => {
        this.setState({ edited: true })
      });
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }

    if (this.state.isLoaded) {
      if (
        !ApiSingleton.authService.isLoggedIn() ||
        ApiSingleton.authService.getUserId() != this.state.courseMentorId
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
                //rowsMax="15"
                label="Условие задачи"
                variant="outlined"
                margin="normal"
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <br />
              <label>
                <Checkbox
                    color="primary"
                    checked={this.state.hasDeadline}
                    onChange={(e) =>
                    {
                      this.setState({
                        hasDeadline: e.target.checked,
                        deadlineDate: undefined,
                      })
                    }}
                />
                Добавить дедлайн
              </label>
              {this.state.hasDeadline &&
              <div>
                <TextField
                    id="datetime-local"
                    label="Дедлайн задачи"
                    type="datetime-local"
                    defaultValue={this.state.deadlineDate}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    onChange={(e) => this.setState({deadlineDate: new Date(e.target.value)})}
                />
                <label>
                  <Checkbox
                      color="primary"
                      onChange={(e) => this.setState({isDeadlineStrict: e.target.checked})}
                  />
                  Запретить отправку заданий после дедлайна
                </label>
              </div>
              }
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
    const token = ApiSingleton.authService.getToken();
    await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+this.props.match.params.taskId)
      .then(async (task) =>
        await ApiSingleton.homeworksApi
        .apiHomeworksGetByHomeworkIdGet(task.homeworkId!, { headers: {"Authorization": `Bearer ${token}`} })
        .then(async (homework) =>
          await ApiSingleton.coursesApi
          .apiCoursesByCourseIdGet(homework.courseId!)
          .then((course) =>
            this.setState({
              isLoaded: true,
              title: task.title!,
              description: task.description!,
              maxRating: task.maxRating!,
              courseId: homework.courseId!,
              courseMentorId: course.mentorId!,
              hasDeadline: task.hasDeadline!,
              deadlineDate: task.deadlineDate!,
              isDeadlineStrict: task.isDeadlineStrict!
            })
          )
        )
    );  
  }
}
