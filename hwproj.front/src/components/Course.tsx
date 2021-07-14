import * as React from "react";
import { CourseViewModel } from "../api/courses";
import { HomeworkViewModel } from "../api/homeworks";
import CourseHomework from "./CourseHomework";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import EditIcon from "@material-ui/icons/Edit";
import AddHomework from "./AddHomework";
import CourseStudents from "./CourseStudents";
import ApiSingleton from "../api/ApiSingleton";
import { Link as RouterLink } from "react-router-dom";
import {RouteComponentProps} from 'react-router';
import NewCourseStudents from "./NewCourseStudents";
import { AccountDataDTO } from "../api/auth";
import { withRouter } from 'react-router-dom';

interface User extends AccountDataDTO {
  name?: string;
  surname?: string;
  middleName?: string;
  email?: string;
  role?: string;
}

interface ICourseMate {
  name: string;
  surname: string;
  middleName: string;
  email: string;
  id: string;
}

interface ICourseState {
  isLoaded: boolean;
  isFound: boolean;
  course: CourseViewModel;
  courseHomework: HomeworkViewModel[];
  createHomework: boolean;
  mentor: User;
  acceptedStudents: ICourseMate[];
  newStudents: ICourseMate[];
}

interface ICourseProps {
  id: string;
}

class Course extends React.Component<
  RouteComponentProps<ICourseProps>,
  ICourseState
> {
  constructor(props: RouteComponentProps<ICourseProps>) {
    super(props);
    this.state = {
      isLoaded: false,
      isFound: false,
      course: {
        mentorId: "",
      },
      courseHomework: [],
      createHomework: false,
      mentor: {
        name: "",
        surname: "",
        middleName: "",
        email: "",
      },
      acceptedStudents: [],
      newStudents: [],
    };
  }

  public render() {
    const { isLoaded, isFound, course, createHomework, mentor } = this.state;
    if (isLoaded) {
      if (isFound) {
        let isLogged = ApiSingleton.authService.getLogginStateFake();
        let userId = isLogged
          ? String(ApiSingleton.authService.getUserIdFake())
          : undefined;
        let isMentor = isLogged && userId === String(course.mentorId);
        let isSignedInCourse =
          isLogged && this.state.newStudents!.some((cm: any) => cm.id === userId);
        let isAcceptedStudent =
          isLogged && this.state.acceptedStudents!.some(
            (cm: any) => cm.id === userId
          );
        return (
          <div className="container">
            <div className="d-flex justify-content-between">
              <div>
                <Typography variant="h5">
                  {course.name} &nbsp;
                  {isMentor && (
                    <RouterLink to={"./" + this.props.match.params.id + "/edit"}>
                      <EditIcon fontSize="small"/>
                    </RouterLink>
                  )}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {course.groupName}
                </Typography>
              </div>
              <div>
                <Typography variant="h5">
                  {mentor.name}&nbsp;{mentor.surname}
                </Typography>
                {(isMentor || isAcceptedStudent) && (
                  <Typography variant="subtitle1">{mentor.email}</Typography>
                )}
                {isLogged && !isSignedInCourse && !isMentor && !isAcceptedStudent &&(
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => this.joinCourse()}
                  >
                    Записаться
                  </Button>
                )}
                {isLogged &&
                  isSignedInCourse &&
                  !isAcceptedStudent &&
                  "Ваша заявка рассматривается."}
              </div>
            </div>
            {createHomework && (
              <div>
                <CourseStudents
                  courseMates={this.state.acceptedStudents}
                  homeworks={this.state.courseHomework}
                  userId={userId as string}
                  forMentor={isMentor}
                  course={this.state.course}
                />
                <br />
                <NewCourseStudents
                  onUpdate={() => this.componentDidMount()}
                  course={this.state.course}
                  students={this.state.newStudents}
                  courseId={this.props.match.params.id}
                />
                <br />
                <AddHomework
                  id={+this.props.match.params.id}
                  onCancel={() => this.componentDidMount()}
                  onSubmit={() => this.componentDidMount()}
                />
                <CourseHomework
                  onDelete={() => this.componentDidMount()}
                  forStudent={isAcceptedStudent}
                  forMentor={isMentor}
                  homework={this.state.courseHomework}
                />
              </div>
            )}
            {isMentor && !createHomework && (
              <div>
                <CourseStudents
                  courseMates={this.state.acceptedStudents}
                  homeworks={this.state.courseHomework}
                  userId={userId as string}
                  forMentor={isMentor}
                  course={this.state.course}
                />
                <br />
                <NewCourseStudents
                  onUpdate={() => this.componentDidMount()}
                  course={this.state.course}
                  students={this.state.newStudents}
                  courseId={this.props.match.params.id}
                />
                <br />
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    this.setState({ createHomework: true });
                  }}
                >
                  Добавить домашку
                </Button>
                <CourseHomework
                  onDelete={() => this.componentDidMount()}
                  forStudent={isAcceptedStudent}
                  forMentor={isMentor}
                  homework={this.state.courseHomework}
                />
              </div>
            )}
            {isAcceptedStudent && (
              <CourseStudents
                courseMates={this.state.acceptedStudents}
                homeworks={this.state.courseHomework}
                userId={userId as string}
                forMentor={isMentor}
                course={this.state.course}
              />
            )}
            {!isMentor && (
              <div>
                <CourseHomework
                  onDelete={() => this.componentDidMount()}
                  homework={this.state.courseHomework}
                  forStudent={isAcceptedStudent}
                  forMentor={isMentor}
                />
              </div>
            )}
          </div>
        );
      }
      return <Typography variant="h3">Не удалось найти курс.</Typography>;
    }

    return <h1></h1>;
  }

  // joinCourse() {
  //   ApiSingleton.coursesApi
  //     .apiCoursesSignInCourseByCourseIdPost(+this.props.match.params.id, 55)
  //     .then((res) => this.componentDidMount());
  // }

  async joinCourse() {
    const userId = ApiSingleton.authService.getUserIdFake()

    const responseCourses = await fetch("http://localhost:3001/courses")
    const courses = await responseCourses.json()
    debugger
    const course = courses.filter((item: any) => item.id == this.props.match.params.id).shift()

    course.courseMates
      .push({
        isAccepted: false,
        studentId: userId
      })

    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: course.isOpen,
      isCompleted: course.isCompleted,
      course: course.course,
      mentor: course.mentor,
      homeworks: course.homeworks,
      courseMates: course.courseMates,
    }

    await fetch("http://localhost:3001/courses/" + this.props.match.params.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(courseViewModel)
    })
    this.componentDidMount();
  }

  async componentDidMount() {
    const responseCourses = await fetch("http://localhost:3001/courses")
    const courses = await responseCourses.json()
    const course = courses.filter((item: any) => item.id == this.props.match.params.id).shift()
    const responseUsers = await fetch("http://localhost:3001/login")
    const users = await responseUsers.json()
    this.setState({
      isLoaded: true,
      isFound: true,
      course: course.course,
      courseHomework: await ApiSingleton.courseService.getHomeworksByCourseId(+this.props.match.params.id),
      createHomework: false,
      mentor: course.mentor,
      acceptedStudents: course.courseMates
      .filter((cm: any) => cm.isAccepted)
      .map((cm: any) => {
        let user;
        users.forEach((element: any) => {
          if (element.id == cm.studentId) {
            user = {
              name: element.name,
              surname: element.surname,
              middleName: element.middleName,
              email: element.email,
              id: String(element.id)
            }
          }
        });
        return user; 
      }),
      newStudents: course.courseMates
        .filter((cm: any) => !cm.isAccepted)
        .map((cm: any) => {
          let user;
          users.forEach((element: any) => {
            if (element.id == cm.studentId) {
              user = {
                name: element.name,
                surname: element.surname,
                middleName: element.middleName,
                email: element.email,
                id: String(element.id)
              }
            }
          });
          return user; 
        }),
    })
    console.log(this.state.newStudents)
  }

  // async componentDidMount() {
  //   await ApiSingleton.coursesApi
  //     .apiCoursesByCourseIdGet(+this.props.match.params.id)
  //     .then((res) => res.json())
  //     .then((course: CourseViewModel) =>
  //       ApiSingleton.homeworksApi
  //         .apiHomeworksCourseHomeworksByCourseIdGet(course.id!)
  //         .then((homework) =>
  //           ApiSingleton.accountApi
  //             .apiAccountGetUserDataByUserIdGet(course.mentorId!)
  //             .then(
  //               async (mentor) =>
  //                 await Promise.all(
  //                   course.courseMates!.map(async (cm) => {
  //                     let res = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(
  //                       cm.studentId!
  //                     );
  //                     let user = await JSON.stringify(res);
  //                     return { user: user, isAccepted: cm.isAccepted };
  //                   })
  //                 ).then((courseMates) =>
  //                   this.setState({
  //                     isLoaded: true,
  //                     isFound: true,
  //                     course: course,
  //                     courseHomework: homework,
  //                     createHomework: false,
  //                     mentor: mentor,
  //                     acceptedStudents: courseMates
  //                       .filter((cm) => cm.isAccepted)
  //                       .map((cm) => cm.user),
  //                     newStudents: courseMates
  //                       .filter((cm) => !cm.isAccepted)
  //                       .map((cm) => cm.user),
  //                   })
  //                 )
  //             )
  //         )
  //     )
  //     .catch((err) => this.setState({ isLoaded: true, isFound: false }));
  // }
}

export default withRouter(Course);