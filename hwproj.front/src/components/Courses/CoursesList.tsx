import * as React from "react";
import { CourseViewModel } from "../../api/courses";
import {
  Link as RouterLink,
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Course  from '../Course';

interface ICoursesProps {
  courses: CourseViewModel[];
}

export class CoursesList extends React.Component<ICoursesProps, {}> {
  public render() {
    const { courses } = this.props;

    return (
      <div className="container">
        <Router>
          {courses.map((course) => (
            <li key={course.id} onClick={() => window.location.assign("/courses/"  + course.id!.toString())}>
              <RouterLink to={"/courses/" + course.id!.toString()}>
                {course.name}
              </RouterLink>
              <br />
              {course.groupName}
            </li>
          ))}
          <Switch>
            {courses.map((course) => (
              <Route
                path={"/courses/:" + course.id}
                render={(props) => (<Course {...props} {...course.id!.toString()} />)}
              />
            ))}
          </Switch>
        </Router>
      </div>
    );
  }
}
