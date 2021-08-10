import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import { Typography } from "@material-ui/core";
import { HomeworkViewModel } from "../../api";
import Homework from "./Homework";

interface ICourseHomeworkProps {
  homework: HomeworkViewModel[];
  isMentor: boolean;
  isStudent: boolean;
  onDelete: () => void;
}

export default class CourseHomework extends React.Component<ICourseHomeworkProps, {}> {

  public render() {
    let homeworkList = this.props.homework
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
      <div>
        {homeworkList.length > 0 && (
          <Typography variant="h6">Домашки</Typography>
        )}
        <List>{homeworkList}</List>
      </div>
    );
  }
}
