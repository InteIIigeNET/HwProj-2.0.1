import {TaskDeadlineView} from "../../api";
import * as React from "react";
import {NavLink, Link} from "react-router-dom";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";
import {Chip, LinearProgress} from "@mui/material";
import {colorBetween} from "../../services/JsUtils";
import Utils from "../../services/Utils";

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

    renderBadgeLabel = (text: string) =>
        <Typography style={{color: "white", fontSize: "small"}} variant={"subtitle2"}>{text}</Typography>

    renderBadge = (solutionState: TaskDeadlineView.SolutionStateEnum | null,
                   rating: number | null,
                   maxRating: number | null) => {
        if (solutionState === null)
            return <Chip color="error" size={"small"} style={{height: 20}}
                         label={this.renderBadgeLabel("Не решено")}/>

        if (solutionState === 0) //POSTED
            return <Chip color="info" size={"small"} style={{height: 20}}
                         label={this.renderBadgeLabel("Ожидает проверки")}/>

        const color = colorBetween(0xff0000, 0x2cba00, Math.min(rating!, maxRating!) / maxRating! * 100)
        return <Chip size={"small"} style={{height: 20, backgroundColor: color}}
                     label={this.renderBadgeLabel(`⭐ ${rating}/${maxRating}`)}/>
    }

    public render() {
        const {taskDeadlines} = this.props;

        return (
            <div className="container">
                {taskDeadlines.map(({deadline: deadline, rating, deadlinePast, solutionState}, i) => (
                    <Grid item>
                        <Link to={`/task/${deadline!.taskId}`}>
                            <ListItem
                                key={deadline!.taskId}
                                style={{padding: 0}}
                            >
                                <Grid container direction={"row"} spacing={1}
                                      style={{justifyContent: "space-between"}}>
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
                                    {!deadlinePast && <Grid item>
                                        {this.renderBadge(solutionState!, rating!, deadline!.maxRating!)}
                                    </Grid>}
                                </Grid>
                            </ListItem>
                        </Link>
                        <Typography style={{fontSize: "18px", color: "GrayText"}}>
                            {deadline!.courseTitle}
                        </Typography>
                        <LinearProgress variant="determinate"
                                        color={deadlinePast ? "error" : "primary"}
                                        style={{marginTop: 5}}
                                        value={deadlinePast ? 100 : this.getPercent(deadline!.publicationDate!, deadline!.deadlineDate!)}/>
                        {Utils.renderReadableDate(deadline!.deadlineDate!)}
                        {i < taskDeadlines.length - 1 ?
                            <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
                    </Grid>
                ))}
            </div>
        );
    }
}
