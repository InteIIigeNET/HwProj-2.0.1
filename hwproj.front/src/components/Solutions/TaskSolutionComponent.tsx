import * as React from 'react';
import {FC, useState} from 'react';
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {HomeworkTaskViewModel, Solution} from '../../api'
import ApiSingleton from "../../api/ApiSingleton";
import {Rating} from "@mui/material";
import Utils from "../../services/Utils";

interface ISolutionProps {
    solution: Solution,
    forMentor: boolean,
    isExpanded: boolean,
    maxRating: number,
}

interface ISolutionState {
    points: number,
    task: HomeworkTaskViewModel,
    lecturerComment: string,
    clickedForRate: boolean,
}

const TaskSolutionComponent: FC<ISolutionProps> = (props) => {

    const [state, setState] = useState<ISolutionState>({
        points: props.solution.rating || 0,
        task: {},
        lecturerComment: props.solution.lecturerComment || "",
        clickedForRate: false,
    })

    const assignSolution = async () => {
        await ApiSingleton.solutionsApi
            .apiSolutionsRateSolutionBySolutionIdByNewRatingPost(
                props.solution.id!,
                state.points,
                state.lecturerComment
            )
        window.location.reload()
    }

    const {solution, maxRating} = props
    //TODO: enum instead of string
    const isRated = solution.state! !== 0 //Posted
    const {points, lecturerComment} = state
    const postedSolutionTime = Utils.convertUTCDateToLocalDate(new Date(solution.publicationDate!)).toLocaleString("ru-RU")

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
                    error={state.clickedForRate && points > props.maxRating}
                    label="Баллы за решение"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    fullWidth
                    disabled={!props.forMentor}
                    InputProps={{
                        readOnly: !props.forMentor,
                        inputProps: {max: props.maxRating, min: 0},
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

    return (<div>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Link
                        href={solution.githubUrl}
                        target="_blank"
                        style={{color: 'darkblue'}}
                    >
                        Ссылка на решение
                    </Link>
                    <Typography style={{color: "GrayText"}}>
                        {postedSolutionTime}
                    </Typography>
                </Grid>
                {solution.comment &&
                    <Grid item>
                        <Typography className="antiLongWords">
                            Комментарий студента: {solution.comment}
                        </Typography>
                    </Grid>
                }
                {(props.forMentor || isRated) && renderRateInput()}
                {((isRated && lecturerComment) || state.clickedForRate) &&
                    <Grid item style={{marginTop: -15, marginBottom: -15}}>
                        <TextField
                            multiline
                            fullWidth
                            InputProps={{
                                readOnly: !props.forMentor,
                            }}
                            rows="4"
                            rowsMax="15"
                            disabled={!props.forMentor || !state.clickedForRate}
                            label="Комментарий преподавателя"
                            variant="outlined"
                            margin="normal"
                            value={state.lecturerComment}
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
                                onClick={assignSolution}
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
