import React from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Paper, createStyles, Theme} from "@material-ui/core";
import TaskStudentCell from "../Tasks/TaskStudentCell";
import ApiSingleton from "../../api/ApiSingleton";
import {withStyles} from '@material-ui/styles';


interface ICourseStudentsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
}

interface ICourseStudentsState {
    stat: StatisticsCourseMatesModel[];
    isLoaded: boolean;
}

class CourseStudents extends React.Component<ICourseStudentsProps, ICourseStudentsState> {
    constructor(props: ICourseStudentsProps) {
        super(props);
        this.state = {
            stat: [],
            isLoaded: false,
        };
    }

    public render() {
        return (
            <div>
                {this.state.isLoaded &&
                    <TableContainer>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" padding="none" component="td">
                                    </TableCell>
                                    {this.props.homeworks.map((homework, index) => (
                                        <TableCell
                                            padding="none"
                                            component="td"
                                            align="center"
                                            colSpan={homework.tasks!.length}
                                        >
                                            {homework.title}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell component="td"></TableCell>
                                    {this.props.homeworks.map((homework) =>
                                        homework.tasks!.map((task) => (
                                            <TableCell padding="none" component="td" align="center">
                                                {task.title}
                                            </TableCell>
                                        ))
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.stat.map((cm, index) => (
                                    <TableRow key={index} hover style={{height: 35}}>
                                        <TableCell
                                            align="center"
                                            padding="none"
                                            component="td"
                                            scope="row"
                                        >
                                            {cm.surname} {cm.name}
                                        </TableCell>
                                        {cm.homeworks!.map((homework) =>
                                            homework.tasks!.map((task) => (
                                                <TaskStudentCell
                                                    solutions={this.state.stat
                                                        .find(s => s.id == cm.id)!.homeworks!
                                                        .find(h => h.id == homework.id)!.tasks!
                                                        .find(t => t.id == task.id)!.solution!.slice(-1)[0]}
                                                    userId={this.props.userId}
                                                    forMentor={this.props.isMentor}
                                                    studentId={String(cm.id)}
                                                    taskId={task.id!}
                                                />
                                            ))
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
            </div>
        );
    }

    async componentDidMount() {
        const stat = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdGet(this.props.course.id!)
        this.setState({stat: stat, isLoaded: true})
    }
}

export default CourseStudents;
