import React from 'react'
import List from '@material-ui/core/List'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CoursesApi, CourseViewModel } from '../api/courses/api'
import { HomeworksApi, TasksApi, HomeworkViewModel } from '../api/homeworks/api'
import { Paper, createStyles, Theme, withStyles } from '@material-ui/core';
import TaskCell from './TaskCell'
import TaskStudentCell from './TaskStudentCell'

interface ICourseStudentsProps {
    course: CourseViewModel
}

interface ICourseStudentsState {
    isLoaded: boolean,
    homeworks: HomeworkViewModel[]
}

const styles = (theme : Theme) => createStyles({
    paper: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
        },
   });

class CourseStudents extends React.Component<ICourseStudentsProps, ICourseStudentsState> {
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
                    <Paper className="paper">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" padding="none" component="td"><b>Студент</b></TableCell>
                                    {this.state.homeworks.map((homework, index) => (
                                        <TableCell padding="none" component="td" align="center" colSpan={homework.tasks!.length}>{index + 1}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell component="td"></TableCell>
                                    {this.state.homeworks.map(homework =>
                                        homework.tasks!.map(taskId =>
                                            <TaskCell taskId={taskId} />))
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.course.courseMates!.map(cm => (
                                    <TableRow key={cm.studentId}>
                                        <TableCell align="center" padding="none" component="td" scope="row">
                                            {cm.studentId}
                                        </TableCell>
                                        {this.state.homeworks.map(homework =>
                                            homework.tasks!.map(task => (
                                                <TaskStudentCell studentId={cm.studentId!} taskId={task} />
                                            )))}
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

export default withStyles(styles)(CourseStudents);