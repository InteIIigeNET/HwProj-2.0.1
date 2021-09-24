import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
      <Grid container direction="column" alignItems="center" justify="center">
          <Grid item>
            <Typography variant="h6">
                Домашние задания
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <List>
              {homeworkList}
            </List>
          </Grid>
      </Grid>
      )
    );
  }
}
