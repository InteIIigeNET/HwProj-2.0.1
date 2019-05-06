import React from 'react'
import List from '@material-ui/core/List'
import { CoursesApi, CourseMateViewModel } from '../api/courses/api'

interface ICourseStudentsProps {
    courseId: number
}

interface ICourseStudentsState {
    isLoaded: boolean,
    courseMates: CourseMateViewModel[]
}

export default class CourseStudents extends React.Component<ICourseStudentsProps, ICourseStudentsState> {
    constructor(props: ICourseStudentsProps) {
        super(props);
        this.state = {
            isLoaded: false,
            courseMates: []
        }
    }

    public render() {
        const { isLoaded, courseMates } = this.state;

        if (isLoaded) {
            let courseMateList = courseMates.map(cm => <li>
                {cm.studentId}
                &nbsp;
                {cm.isAccepted ? "Accepted" : "Waiting"}
            </li>)

            return (
                <div>
                    {courseMateList.length > 0 ? "Студенты:" : ""}
                    <div className="container">
                        <List>{courseMateList}</List>
                    </div>
                </div>
            )
        }

        return "";
    }

    componentDidMount() {
        let api = new CoursesApi();
        api.get(this.props.courseId)
            .then(res => res.json())
            .then(course => this.setState({
                isLoaded: true,
                courseMates: course.courseMates
            }))
    }
}