import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {AccountDataDto, GetSolutionModel, HomeworkTaskViewModel, Solution} from '../../api'
import ApiSingleton from "../../api/ApiSingleton";
import {Alert, Avatar, Rating, Stack, Tooltip} from "@mui/material";
import AvatarUtils from "../Utils/AvatarUtils";
import GitHubIcon from '@mui/icons-material/GitHub';

interface ISolutionProps {
    solution: GetSolutionModel | undefined,
    student: AccountDataDto,
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    isExpanded: boolean,
    lastRating?: number,
    onRateSolutionClick?: () => void
}

interface ISolutionState {
    points: number,
    lecturerComment: string,
    clickedForRate: boolean,
}

const TaskSolutionComponent: FC<ISolutionProps> = (props) => {

    const [state, setState] = useState<ISolutionState>({
        points: props.solution?.rating || 0,
        lecturerComment: props.solution?.lecturerComment || "",
        clickedForRate: false,
    })

    useEffect(() => {
        setState({
            points: props.solution?.rating || 0,
            lecturerComment: props.solution?.lecturerComment || "",
            clickedForRate: false,
        })
    }, [props.student.userId, props.solution?.id])

    const rateSolution = async () => {
        if (props.solution) {
            await ApiSingleton.solutionsApi
                .apiSolutionsRateSolutionBySolutionIdByNewRatingPost(
                    props.solution.id!,
                    state.points,
                    state.lecturerComment
                )
        } else await ApiSingleton.solutionsApi
            .apiSolutionsRateEmptySolutionByTaskIdPost(
                props.task.id!,
                {
                    comment: "",
                    githubUrl: "",
                    lecturerComment: state.lecturerComment,
                    publicationDate: undefined,
                    rating: state.points,
                    studentId: props.student.userId
                }
            )
        setState(prevState => ({...prevState, clickedForRate: false}))
        props.onRateSolutionClick?.()
    }

    const {solution, lastRating, student, task} = props
    const maxRating = task.maxRating!
    //TODO: enum instead of string
    const isRated = solution && solution.state !== Solution.StateEnum.NUMBER_0 // != Posted
    const {points, lecturerComment} = state
    const postedSolutionTime = solution && new Date(solution.publicationDate!).toLocaleString("ru-RU")
    const students = (solution?.groupMates?.length || 0) > 0 ? solution!.groupMates! : [student]

    const getDatesDiff = (_date1: Date, _date2: Date) => {
        const date1 = new Date(_date1).getTime()
        const date2 = new Date(_date2).getTime()
        const diffTime = date1 - date2
        if (diffTime <= 0) return ""
        const diffHours = diffTime / (1000 * 60 * 60)
        const diffDays = Math.trunc(diffHours / 24);
        return diffDays === 0 ? Math.trunc(diffHours) + " часов" : diffDays + " дней"
    }

    const renderRateInput = () => {
        if (maxRating <= 10)
            return (<Grid container item direction={"row"} spacing={1} alignItems={"center"} style={{marginTop: 5}}>
                <Grid item>
                    <Rating
                        name="customized"
                        size="large"
                        defaultValue={2}
                        max={maxRating}
                        value={points}
                        disabled={!props.forMentor}
                        onChange={(event, newValue) => {
                            setState((prevState) => ({
                                ...prevState,
                                points: newValue || 0,
                                clickedForRate: true
                            }))
                        }}
                    />
                </Grid>
                <Grid item>
                    {points + " / " + maxRating}
                </Grid>
            </Grid>)
        return (<Grid container item direction={"row"} spacing={1} alignItems={"center"} style={{marginTop: 5}}>
            <Grid item>
                <TextField
                    style={{width: 100}}
                    required
                    error={state.clickedForRate && points > maxRating}
                    label="Баллы за решение"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    fullWidth
                    disabled={!props.forMentor}
                    InputProps={{
                        readOnly: !props.forMentor,
                        inputProps: {max: maxRating, min: 0},
                    }}
                    defaultValue={points!}
                    maxRows={10}
                    onChange={(e) => {
                        e.persist()
                        setState((prevState) => ({
                            ...prevState,
                            points: +e.target.value
                        }))
                    }}
                    onClick={() => setState((prevState) => ({
                        ...prevState,
                        clickedForRate: props.forMentor && true
                    }))}
                />
            </Grid>
            <Grid item>
                {" / " + maxRating}
            </Grid>
        </Grid>)
    }

    const sentAfterDeadline = solution && task.hasDeadline && getDatesDiff(solution.publicationDate!, task.deadlineDate!)

    return (<div>
            <Grid container direction="column" spacing={2}>
                {solution && <Stack direction={students.length > 1 ? "column" : "row"} spacing={1} style={{marginLeft: 7}}>
                    <Stack direction={"row"} spacing={1}>
                        {students && students.map(t => <Tooltip title={t.surname + " " + t.name}>
                            <Avatar {...AvatarUtils.stringAvatar(t.name!, t.surname!)} />
                        </Tooltip>)}
                    </Stack>
                    <Grid item spacing={1} container direction="column">
                        {solution.comment &&
                            <Grid item>
                                <Typography className="antiLongWords">
                                    {solution.comment}
                                </Typography>
                            </Grid>
                        }
                        <Grid item>
                            <Stack>
                                {solution.githubUrl && <Link
                                    href={solution.githubUrl}
                                    target="_blank"
                                    style={{color: 'darkblue'}}
                                >
                                    {solution.githubUrl?.startsWith("https://github.com/") && <GitHubIcon/>} Ссылка на
                                    решение
                                </Link>}
                            </Stack>
                            <Typography style={{color: "GrayText"}}>
                                {postedSolutionTime}
                            </Typography>
                        </Grid>
                    </Grid>
                </Stack>}
                {sentAfterDeadline && <Grid item>
                    <Alert variant="standard" severity="warning">
                        Решение было сдано на {sentAfterDeadline} позже дедлайна.
                    </Alert>
                </Grid>}
                {(props.forMentor || isRated) &&
                    <Grid item container direction={"column"}>
                        {renderRateInput()}
                        {lastRating !== undefined &&
                            <Typography style={{color: "GrayText", fontSize: "medium", marginBottom: 5}}>
                                Оценка за предыдущее решение: {lastRating} ⭐
                            </Typography>}
                    </Grid>}
                {((isRated && lecturerComment) || state.clickedForRate) &&
                    <Grid item style={{marginTop: -15, marginBottom: -15}}>
                        <TextField
                            multiline
                            fullWidth
                            InputProps={{
                                readOnly: !props.forMentor || !state.clickedForRate
                            }}
                            rows="4"
                            rowsMax="15"
                            label="Комментарий преподавателя"
                            variant="outlined"
                            margin="normal"
                            value={state.lecturerComment}
                            onClick={() => {
                                if (!state.clickedForRate)
                                    setState((prevState) => ({
                                        ...prevState,
                                        clickedForRate: true
                                    }))
                            }}
                            onChange={(e) => {
                                e.persist()
                                setState((prevState) => ({
                                    ...prevState,
                                    lecturerComment: e.target.value
                                }))
                            }}
                        />
                    </Grid>
                }
                {props.forMentor && state.clickedForRate &&
                    <Grid container item spacing={1} style={{marginTop: '10px'}}>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={rateSolution}
                                disabled={points > maxRating}
                            >
                                {isRated ? "Изменить оценку" : "Оценить решение"}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={(e) => {
                                    e.persist()
                                    setState((prevState) => ({
                                        ...prevState,
                                        clickedForRate: false
                                    }))
                                }}
                            >
                                Отмена
                            </Button>
                        </Grid>
                    </Grid>
                }
            </Grid>
        </div>
    )
}

export default TaskSolutionComponent
