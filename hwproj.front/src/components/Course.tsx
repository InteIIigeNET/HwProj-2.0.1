import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom'
import CoursesApi from '../api/CoursesApi'
import ICourse from '../models/Course'

interface IRouteInfo {
    id: string
}

interface IState {
    isValidId: boolean;
    isLoaded: boolean;
    course?: ICourse;
}

export default class Courses extends React.Component<RouteComponentProps<IRouteInfo>, IState> {
    constructor(props: RouteComponentProps<IRouteInfo>) {
        super(props);
        this.state = { isLoaded: false, isValidId: !isNaN(Number(this.props.match.params.id)) };
    }

    public render() {
        if (!this.state.isValidId || this.state.course == null)
        {
            return('error');
        }

        if (this.state.isLoaded) {
            const course = this.state.course!;
            const students = course.students
                .filter(student => student.IsAccepted)
                .map(student => (<li>{student.Id}</li>));

            return (
                <div>
                    <div>
                        {course.name}
                    </div>
                    <div>
                        {course.groupName}
                    </div>
                    <div>
                        {course.mentorId}
                    </div>
                    <ul>
                        {students}
                    </ul>
                </div>
            );
        }
        
        return (<div />)
    }

    public componentDidMount() {
        if (this.state.isValidId) {
            CoursesApi.getCourse(+this.props.match.params.id).then(data => {
                this.setState({ isLoaded: true, course: data })
            });
          }
      }
}