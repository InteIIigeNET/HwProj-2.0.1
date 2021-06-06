import * as React from 'react';
import { CourseViewModel } from '../api/courses/api';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../api/ApiSingleton";
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
                                {cm.name}
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

    // acceptStudent(studentId: string) {
    //     ApiSingleton.coursesApi.apiCoursesAcceptStudentByCourseIdPost(this.props.course.id!, studentId)
    //         .then(res => this.props.onUpdate());
    // }

    // rejectStudent(studentId: string) {
    //     ApiSingleton.coursesApi.apiCoursesRejectStudentByCourseIdPost(this.props.course.id!, studentId)
    //         .then(res => this.props.onUpdate());
    // }

    async acceptStudent(studentId: string) {

        const course = await ApiSingleton.courseService.getCourseById(+this.props.courseId)
        const courseMates = course.courseMates.map((cm: any) => {
            if (String(cm.studentId) === studentId) {
                cm.isAccepted = true
            }
            return cm
        })
        
        const courseModel = {
            name: course.name,
            groupName: course.groupName,
            isOpen: course.isOpen,
            isCompleted: course.isCompleted,
            course: course.course,
            mentor: course.mentor,
            homeworks: course.homeworks,
            courseMates: courseMates,
        }

        await ApiSingleton.courseService.updateStudent(+this.props.courseId, courseModel)
        this.props.onUpdate()
    }   

    async rejectStudent(studentId: string) {
        const course = await ApiSingleton.courseService.getCourseById(+this.props.courseId)
        const courseMates = course.courseMates.filter((cm: any) => String(cm.studentId) != studentId)
        
        const courseModel = {
            name: course.name,
            groupName: course.groupName,
            isOpen: course.isOpen,
            isCompleted: course.isCompleted,
            course: course.course,
            mentor: course.mentor,
            homeworks: course.homeworks,
            courseMates: courseMates,
        }
        await ApiSingleton.courseService.updateStudent(+this.props.courseId, courseModel)
        this.props.onUpdate()
    }
}