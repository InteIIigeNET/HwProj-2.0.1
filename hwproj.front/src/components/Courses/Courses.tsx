import * as React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import { CoursesList } from "./CoursesList";
import { CourseViewModel } from "../../api/courses";
import ApiSingleton from "../../api/ApiSingleton";
import CircularProgress from "@material-ui/core/CircularProgress";

interface ICoursesState {
  isLoaded: boolean;
  courses: CourseViewModel[];
  tabValue: number;
}

export default class Courses extends React.Component<{}, ICoursesState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isLoaded: false,
      courses: [],
      tabValue: 0,
    };
  }

  public render() {
    const { isLoaded, courses, tabValue } = this.state;

    if (!isLoaded) {
      return (
        <div className="container">
          <p>Loading courses...</p>
          <CircularProgress />
        </div>
      );
    }

    let activeCourses = courses.filter((course) => !course.isCompleted);
    let completedCourses = courses.filter((course) => course.isCompleted);



    return (
      <div className="container">
        <Tabs
          value={tabValue} 
          onChange={(event, value) => {
            this.setState({ tabValue: value });
          }}
        >
          <Tab label="Текущие курсы" />
          <Tab label="Завершенные курсы" />
        </Tabs>
        <br />
        {tabValue === 0 && <CoursesList courses={activeCourses} />}
        {tabValue === 1 && <CoursesList courses={completedCourses} />}
      </div>
    );
  }

  // componentDidMount(): void {
  //   ApiSingleton.coursesApi
  //     .apiCoursesGet()
  //     .then((courses) =>
  //       this.setState({
  //         isLoaded: true,
  //         courses: courses,
  //       })
  //     )
  //     .catch((err) => {
  //       this.setState({ isLoaded: true });
  //     });
  // }

  async componentDidMount() {
    const response = await fetch("http://localhost:3001/courses")
    const data = await response.json()
    this.setState({
      courses: data,
      isLoaded: true
    })
  }
}
