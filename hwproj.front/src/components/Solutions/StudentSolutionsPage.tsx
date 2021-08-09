import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import { CourseViewModel, HomeworkTaskViewModel } from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";

interface IStudentSolutionsPageProps {
  taskId: string;
  studentId: string;
}

interface IStudentSolutionsPageState {
  task: HomeworkTaskViewModel;
  isLoaded: boolean;
  course: CourseViewModel;
}

export default class StudentSolutionsPage extends React.Component<
  RouteComponentProps<IStudentSolutionsPageProps>,
  IStudentSolutionsPageState
> {
  constructor(props: RouteComponentProps<IStudentSolutionsPageProps>) {
    super(props);
    this.state = {
      task: {},
      isLoaded: false,
      course: {},
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
        userId != this.state.course.mentorId!
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
              forStudent={false}
              forMentor={true}
              onDeleteClick={() => 0}
            />
            <TaskSolutions
              forMentor={true}
              taskId={+this.props.match.params.taskId}
              studentId={this.props.match.params.studentId}
            />
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
                  task: task,
                  isLoaded: true,
                  course: course,
                })
              )
          )
      );
  }
}
