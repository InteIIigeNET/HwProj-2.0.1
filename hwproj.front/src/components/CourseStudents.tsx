import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { CourseViewModel } from "../api/courses";
import { HomeworkViewModel } from "../api/homeworks";
import { Paper, createStyles, Theme, withStyles } from "@material-ui/core";
import TaskStudentCell from "./TaskStudentCell";
import ApiSingleton from "../api/ApiSingleton";

interface ICourseMate {
  name: string;
  surname: string;
  middleName: string;
  email: string;
  id: string;
}

interface ICourseStudentsProps {
  course: CourseViewModel;
  homeworks: HomeworkViewModel[];
  forMentor: boolean;
  userId: string;
  courseMates: ICourseMate[];
}

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      width: "100%",
      // marginTop: theme.spacing.unit * 3,
      overflowX: "auto",
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
                <TableCell align="center" padding="none" component="td">
                  <b>Студент</b>
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
              {this.props.courseMates
                .map((cm: any, index) => (
                  <TableRow key={index}>
                    <TableCell
                      align="center"
                      padding="none"
                      component="td"
                      scope="row"
                    >
                      {cm.name}
                    </TableCell>
                    {this.props.homeworks.map((homework) =>
                      homework.tasks!.map((task) => (
                        <TaskStudentCell
                          userId={this.props.userId}
                          forMentor={this.props.forMentor}
                          studentId={String(cm.id)}
                          taskId={task.id!}
                        />
                      ))
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(CourseStudents);
