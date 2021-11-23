import React from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Paper, createStyles, Theme} from "@material-ui/core";
import TaskStudentCell from "../Tasks/TaskStudentCell";
import ApiSingleton from "../../api/ApiSingleton";
import {withStyles} from '@material-ui/styles';
import {RouteComponentProps} from "react-router-dom";
import Typography from "@material-ui/core/Typography";


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

const styles = (theme: Theme) =>
    createStyles({
        paper: {
            //width: "100%",
            // marginTop: theme.spacing.unit * 3,
            overflowX: "auto",
        },
    });

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
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" padding="none" component="td">
                                    <Typography>
                                      Студент
                                    </Typography>
                                </TableCell>
                                {this.props.homeworks.map((homework, index) => (
                                    <TableCell
                                        padding="none"
                                        component="td"
                                        align="center"
                                        colSpan={homework.tasks!.length}
                                    >
                                        {index + 1}
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
                            {this.props.isMentor && this.state.stat
                                .map((cm, index) => (
                                    <TableRow key={index}>
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
                            {!this.props.isMentor &&
                                <TableRow key={1}>
                                    <TableCell
                                        align="center"
                                        padding="none"
                                        component="td"
                                        scope="row"
                                    >
                                        {this.state.stat.find(cm => cm.id == this.props.userId)!.surname}
                                        {this.state.stat.find(cm => cm.id == this.props.userId)!.name}
                                    </TableCell>
                                    {this.state.stat.find(cm => cm.id == this.props.userId)!.homeworks!.map((homework) =>
                                        homework.tasks!.map((task) => (
                                            <TaskStudentCell
                                                solutions={this.state.stat
                                                    .find(s => s.id == this.props.userId)!.homeworks!
                                                    .find(h => h.id == homework.id)!.tasks!
                                                    .find(t => t.id == task.id)!.solution!.slice(-1)[0]}
                                                userId={this.props.userId}
                                                forMentor={this.props.isMentor}
                                                studentId={this.props.userId}
                                                taskId={task.id!}
                                            />
                                        ))
                                    )}
                                </TableRow>
                            }
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

export default withStyles(styles)(CourseStudents);
