import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import { Grid, Typography } from "@material-ui/core";
import { HomeworkViewModel } from "../../api";
import Homework from "./Homework";

interface ICourseHomeworkProps {
  homework: HomeworkViewModel[];
  isMentor: boolean;
  isStudent: boolean;
  onDelete: () => void;
}

export default class CourseHomework extends React.Component<ICourseHomeworkProps, {}> {

  render() {
    const homeworkList = this.props.homework
      .map((hw) => (
        <ListItem key={hw.id}>
          <Homework
            homework={hw}
            forStudent={this.props.isStudent}
            forMentor={this.props.isMentor}
            onDeleteClick={() => this.props.onDelete()}
          />
        </ListItem>
      ))
      .reverse();

    return (
      homeworkList.length > 0 && (
      <Grid container direction="column">
          <Grid item>
            <Typography variant="h6">
              Домашки
            </Typography>
          </Grid>
          <Grid item>
            <List>
              {homeworkList}
            </List>
          </Grid>
      </Grid>
      )
    );
  }
}
