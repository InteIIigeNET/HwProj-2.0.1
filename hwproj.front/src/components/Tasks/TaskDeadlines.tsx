import {TaskDeadlineView} from "../../api";
import * as React from "react";
import {Link, NavLink} from "react-router-dom";
import {Divider, Grid, ListItem, Typography} from "@material-ui/core";
import {
    Alert,
    Autocomplete,
    Chip,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Tooltip
} from "@mui/material";
import {colorBetween} from "../../services/JsUtils";
import Utils from "../../services/Utils";
import DeleteIcon from "@material-ui/icons/Delete";
import ApiSingleton from "../../api/ApiSingleton";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

interface ITaskDeadlinesProps {
    taskDeadlines: TaskDeadlineView[]
    onGiveUpClick: () => void
}

export class TaskDeadlines extends React.Component<ITaskDeadlinesProps, {
    hoveredElement: number | undefined,
    showGiveUpModalForTaskId: number | undefined
}> {
    constructor(props: ITaskDeadlinesProps) {
        super(props);
        this.state = {
            hoveredElement: undefined,
            showGiveUpModalForTaskId: undefined
        };
    }

    clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)
    getPercent = (startDate: Date, endDate: Date) => {
        const startDateNumber = new Date(startDate).getTime()
        const endDateNumber = new Date(endDate).getTime()
        const currentDateNumber = new Date(Date.now()).getTime()
        return this.clamp((currentDateNumber - startDateNumber) * 100 / (endDateNumber - startDateNumber), 0, 100)
    }

    renderBadgeLabel = (text: string) =>
        <Typography style={{color: "white", fontSize: "small"}} variant={"subtitle2"}>{text}</Typography>

    giveUp = async (taskId: number) => {
        await ApiSingleton.solutionsApi.apiSolutionsGiveUpByTaskIdPost(taskId)
        this.props.onGiveUpClick()
    }

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
        const {taskDeadlines} = this.props
        const {hoveredElement, showGiveUpModalForTaskId} = this.state
        return (
            <Grid>
                {taskDeadlines.map(({deadline: deadline, rating, deadlinePast, solutionState}, i) => {
                    return (
                        <Grid container alignItems={"center"} spacing={2} direction={"row"}
                              onMouseEnter={() => this.setState({hoveredElement: i})}
                              onMouseLeave={() => this.setState({hoveredElement: undefined})}
                        >
                            <Grid xs={10} item>
                                <Link to={`/task/${deadline!.taskId}`}>
                                    <ListItem
                                        key={deadline!.taskId}
                                        style={{padding: 0, color: "#212529"}}
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
                            {hoveredElement === i && <Grid item xs={2}>
                                <Tooltip
                                    arrow
                                    title={<span style={{whiteSpace: 'pre-line'}}>
                                        {"Отказаться от решения задачи.\nЗадача автоматически оценивается в 0 баллов."}
                                </span>}>
                                    <IconButton aria-label="delete"
                                                onClick={() => this.setState({showGiveUpModalForTaskId: deadline!.taskId!})}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Grid>}
                        </Grid>
                    );
                })}
                <Dialog open={showGiveUpModalForTaskId !== undefined}
                        onClose={() => this.setState({showGiveUpModalForTaskId: undefined})}
                        aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">
                        Отказаться от решения задачи
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Вы уверены? Задача автоматически будет оценена в 0 баллов.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            type="submit"
                            onClick={e => showGiveUpModalForTaskId && this.giveUp(showGiveUpModalForTaskId)}
                        >
                            Да
                        </Button>
                        <Button
                            size="small"
                            onClick={() => this.setState({showGiveUpModalForTaskId: undefined})}
                            variant="contained"
                            color="primary"
                        >
                            Отменить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        );
    }
}
