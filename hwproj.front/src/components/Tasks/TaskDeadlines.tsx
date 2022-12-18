import {TaskDeadlineView} from "../../api";
import * as React from "react";
import {NavLink} from "react-router-dom";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";
import {Badge, LinearProgress} from "@mui/material";

interface ITaskDeadlinesProps {
    taskDeadlines: TaskDeadlineView[]
}

export class TaskDeadlines extends React.Component<ITaskDeadlinesProps, {}> {
    clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)
    getPercent = (startDate: Date, endDate: Date) => {
        const startDateNumber = new Date(startDate).getTime()
        const endDateNumber = new Date(endDate).getTime()
        const currentDateNumber = new Date(Date.now()).getTime()
        return this.clamp((currentDateNumber - startDateNumber) * 100 / (endDateNumber - startDateNumber), 0, 100)
    }

    renderBadge = (solutionState: TaskDeadlineView.SolutionStateEnum | null,
                   rating: number | null,
                   maxRating: number | null) => {
        if (solutionState === null)
            return <Badge color="error" badgeContent="Не решено" variant="standard" style={{width: 80}}/>

        if (solutionState === 0) //POSTED
            return <Badge color="info" badgeContent="Ожидает проверки" variant="standard" style={{width: 140}}/>

        return <Badge color="success" badgeContent={`⭐ ${rating}/${maxRating}`} variant="standard" style={{width: 70}}/>
    }

    public render() {
        const {taskDeadlines} = this.props;

        return (
            <div className="container">
                {taskDeadlines.map(({deadline: deadline, rating, maxRating, solutionState}, i) => (
                    <Grid item>
                        <ListItem
                            key={deadline!.taskId}
                            onClick={() => window.location.assign(`/task/${deadline!.taskId}`)}
                            style={{padding: 0}}
                        >
                            <Grid container>
                                <Grid item>
                                    <NavLink
                                        to={`/task/${deadline!.taskId}`}
                                        style={{color: "#212529"}}
                                    >
                                        <Typography style={{fontSize: "20px"}}>
                                            {deadline!.taskTitle}
                                        </Typography>
                                    </NavLink>
                                </Grid>
                                <Grid item>
                                    {this.renderBadge(solutionState!, rating!, maxRating!)}
                                </Grid>
                            </Grid>
                        </ListItem>
                        <Typography style={{fontSize: "18px", color: "GrayText"}}>
                            {deadline!.courseTitle}
                        </Typography>
                        <LinearProgress variant="determinate"
                                        style={{marginTop: 5}}
                                        value={this.getPercent(deadline!.publicationDate!, deadline!.deadlineDate!)}/>
                        {new Date(deadline!.deadlineDate!).toLocaleString("ru-RU")}
                        {i < taskDeadlines.length - 1 ?
                            <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
                    </Grid>
                ))}
            </div>
        );
    }
}
