import * as React from 'react';
import CoursesApi from '../api/CoursesApi'
import ICourse from '../models/Course'

interface IState {
    isLoaded: boolean;
    course?: ICourse;
}

export default class Courses extends React.Component<{ id: number }, IState> {
    constructor(props: { id: number}) {
        super(props);
        this.state = { isLoaded: false };
    }

    public render() {
        if (this.state.isLoaded) {
            const course = this.state.course!;
            const students = course.students
                .filter(student => student.IsAccepted)
                .map(student => (<li>{student.Id}</li>));

            return (
                <div>
                    {course.name}
                    {course.groupName}
                    {course.mentorId}
                    <ul>
                        {students}
                    </ul>
                </div>
            );
        }
        else {
            return (<div/>);
        }
    }

    public componentDidMount() {
        CoursesApi.getCourse(this.props.id).then(data => {
            this.setState({ isLoaded: true, course: data })
        });
      }
}