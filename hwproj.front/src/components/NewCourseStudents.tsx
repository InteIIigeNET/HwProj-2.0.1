import * as React from 'react';
import { CourseViewModel } from '../api/courses/api';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../api/ApiSingleton";

interface INewCourseStudentsProps {
    course: CourseViewModel,
    studentNames: string[],
    onUpdate: () => void
}

export default class NewCourseStudents extends React.Component<INewCourseStudentsProps, {}> {
    constructor(props: INewCourseStudentsProps) {
        super(props);
    }

    public render() {
        if (this.props.studentNames.length === 0) {
            return "Нет новых заявок в курс."
        }

        return (
            <div>
                Новые заявки на вступление в курс:
                <br />
                <ol>
                    {this.props.course.courseMates!.filter(cm => !cm.isAccepted).map((cm, index) => (
                        <li>
                            <div>
                                {this.props.studentNames[index]}
                                <br />
                                <Button onClick={() => this.acceptStudent(cm.studentId!)} color="primary" variant="contained" size="small">
                                    Принять
                                </Button>
                                &nbsp;
                                <Button onClick={() => this.rejectStudent(cm.studentId!)} color="primary" variant="contained" size="small">
                                    Отклонить
                                </Button>
                            </div>
                        </li>
                        ))
                    }
                </ol>
            </div>
        )
    }

    acceptStudent(studentId: string) {
        ApiSingleton.coursesApi.acceptStudent(this.props.course.id!, studentId)
            .then(res => this.props.onUpdate());
    }

    rejectStudent(studentId: string) {
        ApiSingleton.coursesApi.rejectStudent(this.props.course.id!, studentId)
            .then(res => this.props.onUpdate());
    }
}