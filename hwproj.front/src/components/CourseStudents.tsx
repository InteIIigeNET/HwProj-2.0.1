import React from 'react'
import List from '@material-ui/core/List'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CourseViewModel } from '../api/courses/api'
import { HomeworkViewModel } from '../api/homeworks/api'
import { Paper, createStyles, Theme, withStyles } from '@material-ui/core';
import TaskStudentCell from './TaskStudentCell'

interface ICourseStudentsProps {
    course: CourseViewModel,
    homeworks: HomeworkViewModel[],
    forMentor: boolean,
    userId: string,
    courseMates: string[]
}

const styles = (theme : Theme) => createStyles({
    paper: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
        },
   });

class CourseStudents extends React.Component<ICourseStudentsProps, {}> {
    constructor(props: ICourseStudentsProps) {
        super(props);
    }

    public render() {
            return (
                <div>
                    <Paper className="paper">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" padding="none" component="td"><b>Студент</b></TableCell>
                                    {this.props.homeworks.map((homework, index) => (
                                        <TableCell padding="none" component="td" align="center" colSpan={homework.tasks!.length}>{index + 1}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell component="td"></TableCell>
                                    {this.props.homeworks.map(homework =>
                                        homework.tasks!.map(task =>
                                            <TableCell padding="none" component="td" align="center">{task.title}</TableCell>)
                                            )
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.course.courseMates!.filter(cm => cm.isAccepted).map((cm, index) => (
                                    <TableRow key={cm.studentId}>
                                        <TableCell align="center" padding="none" component="td" scope="row">
                                            {this.props.courseMates[index]}
                                        </TableCell>
                                        {this.props.homeworks.map(homework =>
                                            homework.tasks!.map(task => (
                                                <TaskStudentCell userId={this.props.userId} forMentor={this.props.forMentor} studentId={cm.studentId!} taskId={task.id!} />
                                            )))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </div>
            )
    }
}

export default withStyles(styles)(CourseStudents);