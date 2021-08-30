import * as React from 'react';
import { CourseViewModel } from '../../api/';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import { runInThisContext } from 'vm';

interface ICourseMate {
    name: string;
    surname: string;
    middleName: string;
    email: string;
    id: string;
  }

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: ICourseMate[],
    onUpdate: () => void,
    courseId: string,
}

export default class NewCourseStudents extends React.Component<INewCourseStudentsProps, {}> {
    constructor(props: INewCourseStudentsProps) {
        super(props);
    }

    public render() {
        if (this.props.students.length === 0) {
            return "Нет новых заявок в курс."
        }

        return (
            <div>
                Новые заявки на вступление в курс:
                <br />
                <ol>
                    {this.props.students.map((cm, index) => (
                        <li>
                            <div>
                                {cm.surname} {cm.name}
                                <br />
                                <Button onClick={() => this.acceptStudent(cm.id)} color="primary" variant="contained" size="small">
                                    Принять
                                </Button>
                                &nbsp;
                                <Button onClick={() => this.rejectStudent(cm.id!)} color="primary" variant="contained" size="small">
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
        ApiSingleton.coursesApi.apiCoursesAcceptStudentByCourseIdByStudentIdPost(this.props.course.id!, studentId)
            .then(res => this.props.onUpdate());
    }

    rejectStudent(studentId: string) {
        ApiSingleton.coursesApi.apiCoursesRejectStudentByCourseIdByStudentIdPost(this.props.course.id!, studentId)
            .then(res => this.props.onUpdate());
    }
}