import React from 'react'
import List from '@material-ui/core/List'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CoursesApi, CourseViewModel } from '../api/courses/api'
import { HomeworksApi, TasksApi, HomeworkViewModel } from '../api/homeworks/api'
import { Paper } from '@material-ui/core';

interface ICourseStudentsProps {
    course: CourseViewModel
}

interface ICourseStudentsState {
    isLoaded: boolean,
    homeworks: HomeworkViewModel[]
}

export default class CourseStudents extends React.Component<ICourseStudentsProps, ICourseStudentsState> {
    homeworksApi = new HomeworksApi();
    tasksApi = new TasksApi();
    constructor(props: ICourseStudentsProps) {
        super(props);
        this.state = {
            isLoaded: false,
            homeworks: []
        }
    }

    public render() {
        const { isLoaded } = this.state;

        if (isLoaded) {
            return (
                <div>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Студент</TableCell>
                                    {this.state.homeworks.map(hw => (
                                        <TableCell>{hw.title}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key="1">
                                    <TableCell component="th" scope="row"> </TableCell>
                                    {this.state.homeworks.map(hw => (
                                        <TableCell>
                                            <TableRow>
                                                {hw.tasks!.map((task, index) => (
                                                    <TableCell component="th" scope="row">{index + 1}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {this.props.course.courseMates!.map(cm => (
                                    <TableRow key={cm.studentId}>
                                        <TableCell component="th" scope="row">
                                            {cm.studentId}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </div>
            )
        }

        return "";
    }

    componentDidMount() {
        this.homeworksApi.getCourseHomeworks(this.props.course.id!)
            .then(homeworks => this.setState({isLoaded: true, homeworks: homeworks}));
    }
}