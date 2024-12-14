import React, {FC, useState} from 'react';
import {TaskDeadlineView} from "../../api";
import {Link, NavLink} from "react-router-dom";
import {Divider, Grid, ListItem, Typography, Link as LinkText} from "@material-ui/core";
import {Chip, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack} from "@mui/material";
import {colorBetween} from "../../services/JsUtils";
import Utils from "../../services/Utils";
import ApiSingleton from "../../api/ApiSingleton";
import Button from "@material-ui/core/Button";
import {getTip} from "../Common/HomeworkTags";

interface ITaskDeadlinesProps {
    taskDeadlines: TaskDeadlineView[]
    onGiveUpClick: () => void
}

const TaskDeadlines: FC<ITaskDeadlinesProps> = ({taskDeadlines, onGiveUpClick}) => {
    const [hoveredElement, setHoveredElement] = useState<number | undefined>(undefined);
    const [showGiveUpModalForTaskId, setShowGiveUpModalForTaskId] = useState<number | undefined>(undefined);

    const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
    const getPercent = (startDate: Date, endDate: Date) => {
        const startDateNumber = new Date(startDate).getTime();
        const endDateNumber = new Date(endDate).getTime();
        const currentDateNumber = new Date().getTime();
        return clamp((currentDateNumber - startDateNumber) * 100 / (endDateNumber - startDateNumber), 0, 100);
    };

    const renderBadgeLabel = (text: string) => (
        <Typography style={{color: "white", fontSize: "small"}} variant={"subtitle2"}>{text}</Typography>
    );

    const giveUp = async (taskId: number) => {
        await ApiSingleton.solutionsApi.apiSolutionsGiveUpByTaskIdPost(taskId);
        setShowGiveUpModalForTaskId(undefined);
        onGiveUpClick();
    };

    const renderBadge = (solutionState: TaskDeadlineView['solutionState'], rating: number, maxRating: number) => {
        if (solutionState === null)
            return <Chip color="error" size={"small"} style={{height: 20}} label={renderBadgeLabel("Не решено")}/>;

        if (solutionState === 0) //POSTED
            return <Chip color="info" size={"small"} style={{height: 20}}
                         label={renderBadgeLabel("Ожидает проверки")}/>;

        const color = colorBetween(0xff0000, 0x2cba00, Math.min(rating, maxRating) / maxRating * 100);
        return <Chip size={"small"} style={{height: 20, backgroundColor: color}}
                     label={renderBadgeLabel(`⭐ ${rating}/${maxRating}`)}/>;
    };

    return (
        <div>
            {taskDeadlines.map(({deadline, rating, maxRating, deadlinePast, solutionState}, i) => (
                <Grid onMouseEnter={() => setHoveredElement(i)}
                      onMouseLeave={() => setHoveredElement(undefined)}
                      key={deadline!.taskId}>
                    <Link to={`/task/${deadline!.taskId}`}>
                        <ListItem style={{padding: 0, color: "#212529"}}>
                            <Grid container direction={"row"} spacing={1} justifyContent={"flex-end"}>
                                <Grid item xs>
                                    <NavLink to={`/task/${deadline!.taskId}`} style={{color: "#212529"}}>
                                        <Typography style={{fontSize: "20px"}}>
                                            {deadline!.taskTitle}{getTip(deadline!)}
                                        </Typography>
                                    </NavLink>
                                </Grid>
                                {(solutionState == null) &&
                                    <Grid item>
                                        <Chip size={"small"} style={{height: 20}} color={'primary'}
                                              label={renderBadgeLabel(`⭐ ${maxRating}`)}/>
                                    </Grid>
                                }
                                {!deadlinePast && (
                                    <Grid item>
                                        {renderBadge(solutionState, rating!, deadline!.maxRating!)}
                                    </Grid>
                                )}
                            </Grid>
                        </ListItem>
                    </Link>
                    <Typography style={{fontSize: "18px", color: "GrayText"}}>
                        {deadline!.courseTitle}
                    </Typography>
                    <LinearProgress variant="determinate"
                                    color={deadlinePast ? "error" : "primary"}
                                    style={{marginTop: 5}}
                                    value={deadlinePast ? 100 : getPercent(deadline!.publicationDate!, deadline!.deadlineDate!)}/>
                    <Stack direction={"row"} spacing={10} alignItems={"baseline"} justifyContent={"space-between"}
                           style={{height: 27}}>
                        {Utils.renderReadableDate(deadline!.deadlineDate!)}
                        {hoveredElement === i && solutionState === undefined && (
                            <Typography variant={"caption"}>
                                <LinkText
                                    style={{textDecoration: "none", cursor: "pointer"}}
                                    onClick={() => setShowGiveUpModalForTaskId(deadline!.taskId!)}>
                                    Отказаться от решения задачи
                                </LinkText>
                            </Typography>
                        )}
                    </Stack>
                    {i < taskDeadlines.length - 1 && (
                        <Divider style={{marginTop: 10, marginBottom: 10}}/>
                    )}
                </Grid>
            ))}
            <Dialog open={showGiveUpModalForTaskId !== undefined}
                    onClose={() => setShowGiveUpModalForTaskId(undefined)}
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
                        onClick={() => showGiveUpModalForTaskId && giveUp(showGiveUpModalForTaskId)}>
                        Да
                    </Button>
                    <Button
                        size="small"
                        onClick={() => setShowGiveUpModalForTaskId(undefined)}
                        variant="contained"
                        color="primary">
                        Отменить
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TaskDeadlines;