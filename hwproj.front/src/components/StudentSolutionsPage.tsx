import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import { CourseViewModel } from "../api/courses";
import { HomeworkTaskViewModel } from "../api/homeworks";
import Typography from "@material-ui/core/Typography";
import Task from "./Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../api/ApiSingleton";

interface IStudentSolutionsPageProps {
  taskId: string;
  studentId: string;
}

interface IStudentSolutionsPageState {
  task: HomeworkTaskViewModel;
  isLoaded: boolean;
  course: CourseViewModel;
  courseId: number
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
      courseId: 0
    };
  }

  public render() {
    const { isLoaded } = this.state;
    let userId = ApiSingleton.authService.getLogginStateFake()
      ? ApiSingleton.authService.getUserIdFake()
      : undefined;

    if (isLoaded) {
      if (
        !ApiSingleton.authService.getLogginStateFake() ||
        userId != +this.state.course.mentorId!
      ) {
        return <Typography variant="h6">Страница не найдена</Typography>;
      }

      return (
        <div>
          &nbsp;{" "}
          <Link to={"/courses/" + this.state.courseId!.toString()}>
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

  async componentDidMount() {
    const task = await ApiSingleton.taskService.getTaskByTaskId(+this.props.match.params.taskId)
    const homework = await ApiSingleton.taskService.getHomeworkByTaskId(+this.props.match.params.taskId)
    const course = await ApiSingleton.courseService.getCourseByHomeworkId(homework.id)
    this.setState({
      task: task,
      isLoaded: true,
      course: {
        mentorId: course.course.mentorId
      },
      courseId: course.id
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
  //             .apiCoursesUserCoursesByUserIdGet(homework.courseId)
  //             .then((res) => res.json())
  //             .then((course) =>
  //               this.setState({
  //                 task: task,
  //                 isLoaded: true,
  //                 course: course,
  //               })
  //             )
  //         )
  //     );
  // }
}
