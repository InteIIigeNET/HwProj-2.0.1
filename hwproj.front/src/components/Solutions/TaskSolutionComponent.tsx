import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {AccountDataDto, GetSolutionModel, HomeworkTaskViewModel, Solution, SolutionActualityDto} from '../../api'
import ApiSingleton from "../../api/ApiSingleton";
import {Alert, Avatar, Rating, Stack, Tooltip} from "@mui/material";
import AvatarUtils from "../Utils/AvatarUtils";
import GitHubIcon from '@mui/icons-material/GitHub';
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import {Assignment, Edit, GradingTwoTone} from "@mui/icons-material";
import {ReactMarkdownWithCodeHighlighting, TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import {LoadingButton} from "@mui/lab";
import {TestTag} from "../Common/HomeworkTags";

interface ISolutionProps {
    solution: GetSolutionModel | undefined,
    student: AccountDataDto,
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    lastRating?: number,
    onRateSolutionClick?: () => void,
    isLastSolution: boolean,
}

interface ISolutionState {
    points: number,
    lecturerComment: string,
    clickedForRate: boolean,
    addBonusPoints: boolean
}

const TaskSolutionComponent: FC<ISolutionProps> = (props) => {
    const storageKey = {taskId: props.task.id!, studentId: props.student.userId!, solutionId: props.solution?.id}

    const getDefaultState = (): ISolutionState => {
        const storageValue = RatingStorage.tryGet(storageKey)
        return ({
            points: storageValue?.points || props.solution?.rating || 0,
            lecturerComment: storageValue?.comment || props.solution?.lecturerComment || "",
            clickedForRate: storageValue !== null,
            addBonusPoints: false
        });
    }

    const [state, setState] = useState<ISolutionState>(getDefaultState)
    const [achievement, setAchievementState] = useState<number | undefined>(undefined)
    const [rateInProgress, setRateInProgressState] = useState<boolean | undefined>(false)
    const [solutionActuality, setSolutionActuality] = useState<SolutionActualityDto | undefined>(undefined)

    useEffect(() => {
        setState(getDefaultState())
        getAchievementState()
        setRateInProgressState(false)
        getActuality()
    }, [props.student.userId, props.task.id, props.solution?.id, props.solution?.rating])

    useEffect(() => {
        if (!state.clickedForRate) return
        RatingStorage.set(storageKey, {points: state.points, comment: state.lecturerComment})
    }, [state.points, state.lecturerComment])

    useEffect(() => {
        if (state.clickedForRate) return
        RatingStorage.clean(storageKey)
    }, [state.clickedForRate]);

    const getAchievementState = async () => {
        if (props.solution && props.isLastSolution && props.solution.rating) {
            const achievement = await ApiSingleton.solutionsApi.apiSolutionsSolutionAchievementGet(task.id, props.solution.id)
            setAchievementState(achievement)
        } else setAchievementState(undefined)
    }

    const clearUrl = (url: string) => {
        const regex = /(https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+)\/.*/;
        const match = url.match(regex);

        return match ? match[1] : url;
    }

    const getActuality = async () => {
        if (props.solution &&
            props.isLastSolution &&
            props.forMentor &&
            props.task.tags!.includes(TestTag) &&
            props.solution.githubUrl) {
            const actualityDto = await ApiSingleton.solutionsApi.apiSolutionsActualityBySolutionIdGet(props.solution.id!)
            setSolutionActuality(actualityDto)
        } else setSolutionActuality(undefined)
    }

    const rateSolution = async () => {
        setRateInProgressState(true)
        if (props.solution) {
            await ApiSingleton.solutionsApi
                .apiSolutionsRateSolutionBySolutionIdPost(
                    props.solution.id!,
                    {
                        rating: points,
                        lecturerComment: lecturerComment
                    }
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
    const {points, lecturerComment, addBonusPoints} = state
    const postedSolutionTime = solution && Utils.renderReadableDate(solution.publicationDate!)
    const ratingTime = solution && solution.ratingDate && Utils.renderReadableDate(solution.ratingDate!)
    const students = (solution?.groupMates?.length || 0) > 0 ? solution!.groupMates! : [student]
    const lecturerName = solution?.lecturer && (solution.lecturer.surname + " " + solution.lecturer.name)

    const getDatesDiff = (_date1: Date, _date2: Date) => {
        const date1 = new Date(_date1).getTime()
        const date2 = new Date(_date2).getTime()
        const diffTime = date1 - date2
        if (diffTime <= 0) return ""
        return Utils.pluralizeDateTime(diffTime);
    }

    const renderRateInput = () => {
        if (maxRating <= 10 && points <= maxRating && !addBonusPoints)
            return (<Grid container item direction={"row"} spacing={1} alignItems={"center"} style={{marginTop: 5}}>
                <Grid item>
                    <Rating
                        name="customized"
                        size="large"
                        defaultValue={2}
                        max={maxRating}
                        value={points}
                        disabled={!props.forMentor}
                        onChange={(_, newValue) => {
                            setState((prevState) => ({
                                ...prevState,
                                points: newValue || 0,
                                addBonusPoints: points > maxRating,
                                clickedForRate: true
                            }))
                        }}
                    />
                </Grid>
                <Grid item>
                    {points + " / " + maxRating}
                </Grid>
                {!addBonusPoints && props.forMentor && <Grid item>
                    <Tooltip arrow title={"Позволяет поставить оценку выше максимальной"}>
                        <Typography variant={"caption"}>
                            <Link onClick={() => setState(prevState => ({...prevState, addBonusPoints: true}))}>
                                Нужна особая оценка?
                            </Link>
                        </Typography>
                    </Tooltip>
                </Grid>}
            </Grid>)
        return (<Grid container item direction={"row"} spacing={1} alignItems={"center"} style={{marginTop: 5}}>
            <Grid item>
                <TextField
                    style={{width: 100}}
                    required
                    label="Баллы"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    fullWidth
                    disabled={!props.forMentor}
                    InputProps={{
                        readOnly: !props.forMentor,
                        inputProps: {min: 0, value: points},
                    }}
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

    return <Grid container direction="column" spacing={2} style={{marginTop: -16}}>
        {solution &&
            <Grid item container direction={"column"} spacing={1}>
                {solutionActuality && !solutionActuality.isActual &&
                    <Grid item>
                        <Alert severity="error">
                            {`${solutionActuality.comment ?? ""}. `}
                            {solutionActuality.additionalData &&
                                <a href={clearUrl(props.solution!.githubUrl!) + `/commits/${solutionActuality.additionalData}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                >
                                    Последний коммит решения
                                </a>}
                        </Alert>
                    </Grid>
                }
                <Grid item>
                    <Stack direction={students.length > 1 ? "column" : "row"}
                           alignItems={students.length === 1 ? "center" : "normal"} spacing={1}>
                        <Stack direction={"row"} spacing={1}>
                            {students && students.map(t => <Tooltip title={t.surname + " " + t.name}>
                                <Avatar {...AvatarUtils.stringAvatar(t.name!, t.surname!)} />
                            </Tooltip>)}
                        </Stack>
                        <Grid item spacing={1} container direction="column">
                            {solution.githubUrl && <Link
                                href={solution.githubUrl}
                                target="_blank"
                                style={{color: 'darkblue'}}
                            >
                                {solution.githubUrl?.startsWith("https://github.com/") &&
                                    <GitHubIcon/>} Ссылка на решение
                            </Link>}
                            <Typography style={{color: "GrayText"}}>
                                {postedSolutionTime}
                            </Typography>
                        </Grid>
                    </Stack>
                </Grid>
                {solution.comment &&
                    <Grid item style={{marginBottom: -16}}>
                        <ReactMarkdownWithCodeHighlighting value={solution.comment as string}/>
                    </Grid>
                }
            </Grid>
        }
        {sentAfterDeadline && <Grid item>
            <Alert variant="standard" severity="warning">
                Решение сдано на {sentAfterDeadline} позже дедлайна.
            </Alert>
        </Grid>}
        {points > maxRating && <Grid item>
            <Alert variant="standard" severity="info">
                Решение оценено выше максимального балла.
            </Alert>
        </Grid>}
        {achievement !== undefined && <Grid item>
            <Alert variant="outlined" severity={achievement >= 80 ? "success" : "info"}>
                Лучше {achievement}% других решений по задаче.
            </Alert>
        </Grid>}
        {(props.forMentor || isRated) &&
            <Grid item container direction={"column"}>
                {lecturerName && isRated &&
                    <Stack direction={"row"} alignItems={"center"} spacing={1} style={{marginTop: 5}}>
                        <Avatar>
                            {state.clickedForRate ? <Edit/> : <Assignment/>}
                        </Avatar>
                        <Stack direction={"column"}>
                            <Typography variant={"body1"}>
                                {state.clickedForRate ? "..." : lecturerName}
                            </Typography>
                            {ratingTime && <Typography style={{color: "GrayText"}}>
                                {ratingTime}
                            </Typography>}
                        </Stack>
                    </Stack>}
                {renderRateInput()}
                {lastRating !== undefined &&
                    <Typography style={{color: "GrayText", fontSize: "medium", marginBottom: 5}}>
                        Оценка за предыдущее решение: {lastRating} ⭐
                    </Typography>}
            </Grid>}
        {((isRated && lecturerComment) || state.clickedForRate) &&
            <Grid item style={{marginTop: -15, marginBottom: -15}}>
                <TextFieldWithPreview
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
                    isEditable={props.forMentor}
                    value={state.lecturerComment}
                    previewStyle={{borderColor: "GrayText"}}
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
                {props.forMentor && state.clickedForRate && <Typography variant={"caption"}>
                    Промежуточное оценивание будет сохранено локально
                </Typography>}
            </Grid>
        }
        {props.forMentor && state.clickedForRate &&
            <Grid container item spacing={1} style={{marginTop: '10px'}}>
                <Grid item>
                    <LoadingButton
                        loading={rateInProgress}
                        endIcon={<GradingTwoTone/>}
                        loadingPosition="end"
                        size="small"
                        variant="contained"
                        style={rateInProgress ? undefined : {backgroundColor: "#3f51b5"}}
                        onClick={rateSolution}
                    >
                        {isRated ? "Изменить оценку" : "Оценить решение"}
                    </LoadingButton>
                </Grid>
                <Grid item>
                    {!rateInProgress &&
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setState(prevState => ({
                                    ...prevState,
                                    points: props.solution?.rating || 0,
                                    lecturerComment: props.solution?.lecturerComment || "",
                                    clickedForRate: false
                                }))
                            }}
                        >
                            Отмена
                        </Button>}
                </Grid>
            </Grid>
        }
    </Grid>
}

export default TaskSolutionComponent
