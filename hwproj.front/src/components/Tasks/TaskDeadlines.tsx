import {TaskDeadlineDto} from "../../api";
import * as React from "react";
import {BrowserRouter as Router, Link as RouterLink} from "react-router-dom";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";
import {LinearProgress} from "@mui/material";
import Utils from "../../services/Utils";

interface ITaskDeadlinesProps {
    taskDeadlines: TaskDeadlineDto[];
}

export class TaskDeadlines extends React.Component<ITaskDeadlinesProps, {}> {
    clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)
    getPercent = (startDate: Date, endDate: Date) => {
        const startDateNumber = Utils.convertUTCDateToLocalDate(new Date(startDate)).getTime()
        const endDateNumber = Utils.convertUTCDateToLocalDate(new Date(endDate)).getTime()
        const currentDateNumber = Utils.convertUTCDateToLocalDate(new Date(Date.now())).getTime()
        return this.clamp((currentDateNumber - startDateNumber) * 100 / (endDateNumber - startDateNumber), 0, 100)
    }

    public render() {
        const {taskDeadlines} = this.props;

        return (
            <div className="container">
                <Router>
                    {taskDeadlines.map((taskDeadline, i) => (
                        <Grid item>
                            <ListItem
                                key={taskDeadline.taskId}
                                onClick={() => window.location.assign(`/task/${taskDeadline.taskId}`)}
                                style={{padding: 0}}
                            >
                                <RouterLink
                                    to={`/task/${taskDeadline.taskId}`}
                                    style={{color: "#212529"}}
                                >
                                    <Typography style={{fontSize: "20px"}}>
                                        {taskDeadline.taskTitle}
                                    </Typography>
                                </RouterLink>
                            </ListItem>
                            <Typography style={{fontSize: "18px", color: "GrayText"}}>
                                {taskDeadline.courseTitle}
                            </Typography>
                            <LinearProgress variant="determinate"
                                            style={{marginTop: 5}}
                                            value={this.getPercent(taskDeadline.publicationDate!, taskDeadline.deadlineDate!)}/>
                            {new Date(taskDeadline.deadlineDate!).toLocaleDateString("ru-RU")}
                            {i < taskDeadlines.length - 1 ?
                                <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
                        </Grid>
                    ))}
                </Router>
            </div>
        );
    }
}
