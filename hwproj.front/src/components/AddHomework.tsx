import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../api/ApiSingleton";
import { CreateTaskViewModel } from "../api/homeworks";
import { Redirect } from "react-router-dom";
import { Description } from "@material-ui/icons";

interface IAddHomeworkProps {
  id: number;
  onSubmit: () => void;
  onCancel: () => void;
}

interface IAddHomeworkState {
  title: string;
  description: string;
  tasks: CreateTaskViewModel[];
  added: boolean;
}

export default class AddHomework extends React.Component<
  IAddHomeworkProps,
  IAddHomeworkState
> {
  constructor(props: IAddHomeworkProps) {
    super(props);
    this.state = {
      title: "",
      description: "",
      tasks: [{ title: "",
                description: "",
                maxRating: 10
              }],
      added: false,
    };
  }

  // public handleSubmit(e: any) {
  //   e.preventDefault();
  //   ApiSingleton.homeworksApi
  //     .apiHomeworksByCourseIdPost(this.props.id, {
  //       title: this.state.title,
  //       description: this.state.description,
  //     })
  //     .then((homeworkId) =>
  //       Promise.all(
  //         this.state.tasks.map((t) =>
  //           ApiSingleton.tasksApi.apiTasksByHomeworkIdPost(homeworkId, t)
  //         )
  //       )
  //     )
  //     .then((res) => this.props.onSubmit());
  // }

  public render() {
    if (this.state.added) {
      return <Redirect to={"/courses/" + this.props.id.toString} />;
    }
    return (
      <div>
        <Typography variant="subtitle1">Добавить домашку</Typography>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <TextField
            required
            label="Название домашки"
            variant="outlined"
            margin="normal"
            name={this.state.title}
            onChange={(e) => this.setState({ title: e.target.value })}
          />
          <TextField
            multiline
            fullWidth
            rows="4"
            rowsMax="15"
            label="Описание домашки"
            variant="outlined"
            margin="normal"
            name={this.state.description}
            onChange={(e) => this.setState({ description: e.target.value })}
          />
          <div className="container">
            <ol>
              {this.state.tasks.map((task, index) => (
                <li key={index}>
                  <Typography variant="subtitle2">Задача</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      this.setState({
                        tasks: this.state.tasks.slice(
                          0,
                          this.state.tasks.length - 1
                        ),
                      })
                    }
                  >
                    Убрать задачу
                  </Button>

                  <br />
                  <TextField
                    required
                    label="Название задачи"
                    variant="outlined"
                    margin="normal"
                    name={task.title}
                    onChange={(e) => (task.title = e.target.value)}
                  />
                  <TextField
                    required
                    label="Баллы"
                    variant="outlined"
                    type="number"
                    margin="normal"
                    onChange={(e) => (task.maxRating = +e.target.value)}
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
                    name={task.description}
                    onChange={(e) => (task.description = e.target.value)}
                  />
                </li>
              ))}
            </ol>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() =>
                this.setState({
                  tasks: [...this.state.tasks, { title: "", description: "" }],
                })
              }
            >
              Ещё задачу
            </Button>
          </div>
          <br />
          <Button
            size="small"
            variant="contained"
            color="primary"
            type="submit"
          >
            Добавить домашку
          </Button>
          &nbsp;
          <Button
            onClick={() => this.props.onCancel()}
            size="small"
            variant="contained"
            color="primary"
          >
            Отменить
          </Button>
        </form>
      </div>
    );
  }

  async handleSubmit(e: any) {
    e.preventDefault();

    const homework = {
      title: this.state.title,
      description: this.state.description,
      tasks: this.state.tasks,
      date: new Date()
    }
    ApiSingleton.courseService.addHomework(homework, this.props.id)
    this.setState({ added: true })
    this.props.onSubmit()
  }
}