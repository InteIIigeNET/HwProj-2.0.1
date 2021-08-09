import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import Task from "../Tasks/Task";
import Typography from "@material-ui/core/Typography";
import AddSolution from "./AddSolution";
import Button from "@material-ui/core/Button";
import TaskSolutions from "./TaskSolutions";
import { CourseViewModel, HomeworkTaskViewModel } from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";

interface ITaskSolutionsProps {
  taskId: string;
}

interface ITaskSolutionsState {
  isLoaded: boolean;
  task: HomeworkTaskViewModel;
  addSolution: boolean;
  course: CourseViewModel;
}

export default class TaskSolutionsPage extends React.Component<
  RouteComponentProps<ITaskSolutionsProps>,
  ITaskSolutionsState
> {
  constructor(props: RouteComponentProps<ITaskSolutionsProps>) {
    super(props);
    this.state = {
      isLoaded: false,
      task: {},
      addSolution: false,
      course: {
        mentorId: "",
      },
    };
  }

  public render() {
    const { isLoaded } = this.state;
    let userId = ApiSingleton.authService.isLoggedIn()
      ? ApiSingleton.authService.getUserId()
      : undefined;

    if (isLoaded) {
      if (
        !ApiSingleton.authService.isLoggedIn() ||
        userId == this.state.course.mentorId ||
        !this.state.course.courseMates!.some(
          (cm) => cm.isAccepted! && cm.studentId == userId
        )
      ) {
        return <Typography variant="h6">Страница не найдена</Typography>;
      }

      return (
        <div>
          &nbsp;{" "}
          <Link to={"/courses/" + this.state.course.id!.toString()}>
            Назад к курсу
          </Link>
          <br />
          <br />
          <div className="container">
            <Task
              task={this.state.task}
              forStudent={true}
              forMentor={false}
              onDeleteClick={() => 3}
            />
            {!this.state.addSolution && (
              <div>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    this.setState({ addSolution: true });
                  }}
                >
                  Добавить решение
                </Button>
                <br />
                <TaskSolutions
                  forMentor={false}
                  taskId={+this.props.match.params.taskId}
                  studentId={userId as string}
                />
              </div>
            )}
            {this.state.addSolution && (
              <div>
                <AddSolution
                  studentId={userId as string}
                  taskId={+this.props.match.params.taskId}
                  onAdding={() => this.componentDidMount()}
                  onCancel={() => this.componentDidMount()}
                />
                <br />
                <TaskSolutions
                  forMentor={false}
                  taskId={+this.props.match.params.taskId}
                  studentId={userId as string}
                />
              </div>
            )}
            <br />
          </div>
        </div>
      );
    }

    return "";
  }

  componentDidMount() {
    const token = ApiSingleton.authService.getToken();
    ApiSingleton.tasksApi
      .apiTasksGetByTaskIdGet(+this.props.match.params.taskId)
      .then((task) =>
        ApiSingleton.homeworksApi
          .apiHomeworksGetByHomeworkIdGet(task.homeworkId!, { headers: {"Authorization": `Bearer ${token}`} })
          .then((homework) =>
            ApiSingleton.coursesApi
              .apiCoursesByCourseIdGet(homework.courseId!)
              .then((course) =>
                this.setState({
                  isLoaded: true,
                  addSolution: false,
                  task: task,
                  course: course,
                })
              )
          )
      );
  }
}
