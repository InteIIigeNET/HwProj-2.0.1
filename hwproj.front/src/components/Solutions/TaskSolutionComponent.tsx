import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import {Button, CircularProgress, Grid, TextField, Typography} from "@material-ui/core";
import Link from '@material-ui/core/Link'
import './style.css'
import {
    GetSolutionModel,
    HomeworkTaskViewModel,
    SolutionState,
    SolutionActualityDto,
    SolutionActualityPart, StudentDataDto, FileInfoDTO
} from '@/api'
import ApiSingleton from "../../api/ApiSingleton";
import {Alert, Avatar, Rating, Stack, Tooltip, Card, CardContent, CardActions, IconButton, Chip} from "@mui/material";
import AvatarUtils from "../Utils/AvatarUtils";
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import {Edit, ThumbDown, ThumbDownOutlined, ThumbUp} from "@mui/icons-material";
import {MarkdownEditor, MarkdownPreview} from "../Common/MarkdownEditor";
import {LoadingButton} from "@mui/lab";
import CheckIcon from '@mui/icons-material/Done';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import {useSnackbar} from 'notistack';
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {StudentCharacteristics} from "@/components/Students/StudentCharacteristics";
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import BlurOffIcon from '@mui/icons-material/BlurOff';
import FileInfoConverter from "@/components/Utils/FileInfoConverter";
import {IFileInfo} from "@/components/Files/IFileInfo";
import FilesPreviewList from "@/components/Files/FilesPreviewList";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

interface ISolutionProps {
    courseId: number,
    solution: GetSolutionModel | undefined,
    student: StudentDataDto,
    task: HomeworkTaskViewModel,
    forMentor: boolean,
    lastRating?: number,
    onRateSolutionClick?: () => void,
    isLastSolution: boolean,
    courseFilesInfo: FileInfoDTO[],
    isProcessing: boolean,
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
    const [showOriginalCommentText, setShowOriginalCommentText] = useState<boolean>(false)
    const [achievement, setAchievementState] = useState<number | undefined>(undefined)
    const [rateInProgress, setRateInProgressState] = useState<boolean | undefined>(false)
    const [solutionActuality, setSolutionActuality] = useState<SolutionActualityDto | undefined>(undefined)

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        setState(getDefaultState())
        getAchievementState()
        setRateInProgressState(false)
        getActuality()
        setShowOriginalCommentText(false)
    }, [props.student.userId, props.task.id, props.solution?.id, props.solution?.rating])

    const [isCtrlPressed, setIsCtrlPressed] = useState(false)

    useEffect(() => {
        if (!props.forMentor) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Control") {
                setIsCtrlPressed(true);
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Control") {
                setIsCtrlPressed(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            if (!props.forMentor) return
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }
    }, [])


    useEffect(() => {
        if (!state.clickedForRate) return
        RatingStorage.set(storageKey, {points: state.points, comment: state.lecturerComment})
    }, [state.points, state.lecturerComment])

    useEffect(() => {
        if (state.clickedForRate) return
        RatingStorage.clean(storageKey)
    }, [state.clickedForRate]);

    const checkTestsActuality = props.solution &&
        props.isLastSolution &&
        props.solution.githubUrl &&
        props.solution.githubUrl.startsWith("https://github.com/")

    const checkAchievement = props.solution && props.isLastSolution && props.solution.state !== SolutionState.NUMBER_0

    const getAchievementState = async () => {
        setAchievementState(undefined)
        if (checkAchievement) {
            const achievement =
                await ApiSingleton.solutionsApi.solutionsGetSolutionAchievement(task.id, props.solution!.id)
            setAchievementState(achievement)
        }
    }

    const clearUrl = (url: string) => {
        const regex = /(https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+)\/.*/;
        const match = url.match(regex);

        return match ? match[1] : url;
    }

    const getActuality = async () => {
        setSolutionActuality(undefined)
        if (checkTestsActuality) {
            const actualityDto = await ApiSingleton.solutionsApi.solutionsGetSolutionActuality(props.solution!.id!)
            setSolutionActuality(actualityDto)
        }
    }

    const rateSolution = async (points: number, lecturerComment: string) => {
        setRateInProgressState(true)
        if (props.solution) {
            await ApiSingleton.solutionsApi.solutionsRateSolution(
                props.solution.id!,
                {
                    rating: points,
                    lecturerComment: lecturerComment
                }
            )
        } else await ApiSingleton.solutionsApi.solutionsPostEmptySolutionWithRate(
            props.task.id!,
            {
                comment: "",
                githubUrl: "",
                lecturerComment: lecturerComment,
                publicationDate: undefined,
                rating: points,
                studentId: props.student.userId
            }
        )
        setState(prevState => ({...prevState, clickedForRate: false}))
        enqueueSnackbar('Решение успешно оценено', {variant: "success", autoHideDuration: 1700});
        props.onRateSolutionClick?.()
    }

    const {solution, lastRating, student, task} = props
    const maxRating = task.maxRating!
    //TODO: enum instead of string
    const isRated = solution && solution.state !== SolutionState.NUMBER_0 // != Posted
    const {points, lecturerComment, addBonusPoints} = state
    const postedSolutionTime = solution && Utils.renderReadableDate(solution.publicationDate!)
    const ratingTime = solution && solution.ratingDate && Utils.renderReadableDate(solution.ratingDate!)
    const students = (solution?.groupMates?.length || 0) > 0 ? solution!.groupMates! : [student]
    const lecturer = solution?.lecturer
    const lecturerName = lecturer && (lecturer.surname + " " + lecturer.name)
    const commitsActuality = solutionActuality?.commitsActuality
    const filesInfo = solution?.id ? FileInfoConverter.getCourseUnitFilesInfo(props.courseFilesInfo, CourseUnitType.Solution, solution.id) : []

    const getDatesDiff = (_date1: Date, _date2: Date) => {
        const truncateToMinutes = (date: Date) => {
            date.setSeconds(0, 0) // Убираем секунды и миллисекунды
            return date
        }

        const date1 = truncateToMinutes(new Date(_date1)).getTime()
        const date2 = truncateToMinutes(new Date(_date2)).getTime()
        const diffTime = date1 - date2
        if (diffTime <= 0) return ""
        return Utils.pluralizeDateTime(diffTime);
    }

    const renderTestsStatus = (status: SolutionActualityPart | undefined) => {
        if (!status) return null

        let icon
        if (status.isActual) icon = <CheckIcon fontSize={"small"} color={"success"}/>
        else if (status.additionalData !== "") icon = <WarningIcon fontSize={"small"} color={"warning"}/>
        else icon = <CloseIcon fontSize={"small"} color={"error"}/>
        return <Tooltip arrow placement={"right"}
                        title={<div>{status.comment}</div>}>{icon}</Tooltip>
    }

    const clickForRate = async (points: number, clickedForRate: boolean) => {
        setState((prevState) => ({
            ...prevState,
            points: points,
            clickedForRate: clickedForRate && !isCtrlPressed
        }))
        if (isCtrlPressed) await rateSolution(points, lecturerComment)
    }

    const renderRateInput = () => {
        const showThumbs = maxRating === 1
        const isEditable = props.forMentor && (!isRated || state.clickedForRate)
        const thumbsHandler = (rating: number) => {
            clickForRate(rating, isEditable)
        }
        if (maxRating <= 10 && points <= maxRating && !addBonusPoints)
            return (<Grid container item direction={"row"} spacing={1} alignItems={"center"}>
                {showThumbs && <Grid item><
                    Stack direction={"row"} alignItems={"center"}>
                    <IconButton disabled={!isEditable} onClick={() => thumbsHandler(1)}>
                        <ThumbUp color={points === 1 ? "success" : "disabled"}/>
                    </IconButton>
                    <IconButton disabled={!isEditable} onClick={() => thumbsHandler(0)}>
                        <ThumbDown color={(isRated || state.clickedForRate) && points === 0 ? "error" : "disabled"}/>
                    </IconButton>
                </Stack>
                </Grid>}
                {!showThumbs && <Grid item>
                    <Stack direction={"row"} alignItems={"center"}>
                        {(isEditable || !isRated) &&
                            <IconButton size="small" disabled={!isEditable} onClick={() => thumbsHandler(0)}>
                                <ThumbDownOutlined
                                    color={(isRated || state.clickedForRate) && points === 0 ? "error" : "disabled"}/>
                            </IconButton>}
                        <Rating
                            key={solution?.id}
                            name="customized"
                            size="large"
                            defaultValue={2}
                            max={maxRating}
                            value={points}
                            readOnly={!isEditable}
                            onMouseDown={event => {
                                const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
                                if (event.ctrlKey && isFirefox) {
                                    const ratingElement = event.currentTarget
                                    const {left, width} = ratingElement.getBoundingClientRect()
                                    const relativeX = (event.clientX - left) / width
                                    const star = Math.ceil(relativeX * maxRating) || 0
                                    const rating = star === points ? 0 : star

                                    clickForRate(rating || 0, true)
                                }
                            }}
                            onChange={(_, newValue) => {
                                clickForRate(newValue || 0, true)
                            }}
                        />
                    </Stack>
                </Grid>}
                {!addBonusPoints && props.forMentor && state.clickedForRate && <Grid item>
                    <Tooltip arrow title={"Позволяет поставить оценку выше максимальной"}>
                        <Typography variant={"caption"}>
                            <Link onClick={() => setState(prevState => ({...prevState, addBonusPoints: true}))}>
                                Нужна особая оценка?
                            </Link>
                        </Typography>
                    </Tooltip>
                </Grid>}
            </Grid>)
        return (<Grid container item direction={"row"} spacing={1} alignItems={"center"}>
            <Grid item>
                {isEditable
                    ? <TextField
                        style={{width: 100}}
                        required
                        label="Баллы"
                        variant="outlined"
                        margin="normal"
                        type="number"
                        fullWidth
                        InputProps={{
                            readOnly: !props.forMentor || !state.clickedForRate,
                            inputProps: {min: 0, value: points},
                        }}
                        size={"small"}
                        onChange={(e) => {
                            e.persist()
                            setState((prevState) => ({
                                ...prevState,
                                points: +e.target.value
                            }))
                        }}
                        onClick={() => {
                            if (isRated) return
                            setState((prevState) => ({
                                ...prevState,
                                clickedForRate: props.forMentor
                            }));
                        }}
                    />
                    : <Chip label={<Typography variant={"h6"}>{points}</Typography>} size={"medium"}/>}
            </Grid>
            <Grid item>
                {" / " + maxRating}
            </Grid>
        </Grid>)
    }

    const sentAfterDeadline = solution && task.hasDeadline && getDatesDiff(solution.publicationDate!, task.deadlineDate!)

    const renderRatingCard = () => {
        const rating = points * 100 / maxRating
        const {backgroundColor, color} =
            state.clickedForRate || !isRated ? {backgroundColor: undefined, color: undefined}
                : rating >= 70
                    ? {backgroundColor: "rgb(237,247,237)", color: "rgb(30,70,32)"}
                    : rating <= 34
                        ? {backgroundColor: "rgb(253,237,237)", color: "rgb(95,33,32)"}
                        : {backgroundColor: "rgb(255,244,229)", color: "rgb(102,60,0)"}
        return <Card variant={"outlined"}
                     sx={{
                         borderColor: state.clickedForRate || isRated ? StudentStatsUtils.getRatingColor(points, maxRating) : "",
                         width: "100%",
                         backgroundColor: backgroundColor,
                         color: color
                     }}>
            <CardContent style={{paddingBottom: 5, marginBottom: 0}}>
                <Grid container direction={"column"} spacing={1}>
                    <Grid item>
                        {renderRateInput()}
                    </Grid>
                    {!isRated && !state.clickedForRate && maxRating <= 10 && !addBonusPoints && <Grid item>
                        <Typography variant={"caption"} style={{color: "GrayText"}}>
                            Нажмите{" "}
                            <span style={{color: isCtrlPressed ? "blue" : "inherit"}}>
                                <KeyboardCommandKeyIcon style={{fontSize: 10, marginTop: -2}}/>
                                Ctrl
                            </span>{" "} + {" "}
                            <span>
                                ЛКМ
                                <MouseOutlinedIcon style={{fontSize: 10, marginTop: -2}}/>
                            </span>{" "}для быстрого оценивания
                        </Typography>
                    </Grid>}
                    {lastRating !== undefined && state.clickedForRate &&
                        <Grid item>
                            <Typography variant={"caption"} style={{color: "GrayText", marginTop: -10}}>
                                Оценка за предыдущее решение: {lastRating} ⭐
                            </Typography>
                        </Grid>}
                    {lecturerName && isRated &&
                        <Grid item>
                            <Stack direction={"row"} alignItems={"center"} spacing={1} style={{marginTop: 5}}>
                                {state.clickedForRate ? <Avatar><Edit/></Avatar> :
                                    <Avatar {...AvatarUtils.stringAvatar(lecturer!)}/>}
                                <Stack direction={"column"}>
                                    <Typography variant={"body1"}>
                                        {state.clickedForRate ? "..." :
                                            <div style={{color: "black"}}>{lecturerName}
                                                <sub style={{color: "#3f51b5"}}> {lecturer!.companyName}</sub>
                                            </div>}
                                    </Typography>
                                    {ratingTime && <Typography variant={"caption"} style={{color: "GrayText"}}>
                                        {ratingTime}
                                    </Typography>}
                                </Stack>
                            </Stack>
                        </Grid>}
                    {state.clickedForRate
                        ? <Grid item style={{marginBottom: -7, marginTop: -8}}>
                            <MarkdownEditor
                                label="Комментарий преподавателя"
                                value={state.lecturerComment}
                                onChange={(value) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        lecturerComment: value
                                    }))
                                }}
                            />
                        </Grid>
                        : isRated &&
                        <Grid item>
                            <MarkdownPreview
                                value={lecturerComment}
                                backgroundColor={backgroundColor}
                                textColor={color}
                            />
                        </Grid>
                    }
                </Grid>
            </CardContent>
            {props.forMentor && state.clickedForRate && <CardActions>
                <LoadingButton
                    endIcon={<span style={{width: rateInProgress ? 17 : 0}}/>}
                    style={{color: "#3f51b5"}}
                    loading={rateInProgress}
                    loadingPosition="end"
                    size="small"
                    onClick={() => rateSolution(points, lecturerComment)}
                >
                    {isRated ? "Изменить оценку" : "Оценить решение"}
                </LoadingButton>
                {!rateInProgress && <Button
                    size="small"
                    onClick={() => {
                        setState(prevState => ({
                            ...prevState,
                            points: props.solution?.rating || 0,
                            lecturerComment: props.solution?.lecturerComment || "",
                            addBonusPoints: false,
                            clickedForRate: false
                        }))
                    }}
                >Отмена</Button>
                }
            </CardActions>}
            {props.forMentor && isRated && !state.clickedForRate && <CardActions>
                <Button
                    color={"primary"}
                    size="small"
                    onClick={() => {
                        setState(prevState => ({
                            ...prevState,
                            clickedForRate: true
                        }))
                    }}>
                    Изменить оценку
                </Button>
            </CardActions>}
        </Card>
    }

    return <Grid container direction="column" spacing={2} style={{marginTop: -16}}>
        {solution &&
            <Grid item container direction={"column"} spacing={1}>
                {commitsActuality && !commitsActuality.isActual &&
                    <Grid item>
                        <Alert severity="error">
                            {`${commitsActuality.comment ?? ""}. `}
                            {commitsActuality.additionalData &&
                                <a href={clearUrl(props.solution!.githubUrl!) + `/commits/${commitsActuality.additionalData}`}
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
                                <Avatar {...AvatarUtils.stringAvatar(t)} />
                            </Tooltip>)}
                        </Stack>
                        <Grid item spacing={1} container direction="column">
                            <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                {solution.githubUrl && <Link
                                    href={(solution.githubUrl.startsWith("https://") ? "" : "https://") + solution.githubUrl}
                                    target="_blank"
                                    style={{color: 'darkblue'}}
                                >
                                    Ссылка на решение
                                </Link>}
                                {checkTestsActuality && (solutionActuality
                                    ? renderTestsStatus(solutionActuality.testsActuality)
                                    : <CircularProgress size={12}/>)}
                            </Stack>
                            <Stack direction={"row"} alignItems={"baseline"} spacing={1}>
                                <Typography variant={"caption"} style={{color: "GrayText"}}>
                                    {postedSolutionTime} {solution.isModified && "(отредактировано)"}
                                </Typography>
                                {solution?.comment &&
                                    <Tooltip arrow placement={"right"}
                                             title={<div>
                                                 {showOriginalCommentText ? "Показать отформатированный текст решения" : "Показать оригинальный текст решения"}
                                             </div>}>
                                        <div style={{cursor: "pointer", marginTop: -2}}
                                             onClick={() => setShowOriginalCommentText(!showOriginalCommentText)}>
                                            {showOriginalCommentText
                                                ? <BlurOffIcon style={{fontSize: 14}} color={"inherit"}/>
                                                : <BlurOnIcon style={{fontSize: 14}} color={"inherit"}/>}
                                        </div>
                                    </Tooltip>}
                            </Stack>
                        </Grid>
                    </Stack>
                </Grid>
            <Grid item spacing={8}>
                {solution.comment &&
                    <Grid item style={{marginBottom: -10}} spacing={4}>
                        {showOriginalCommentText
                            ? <Typography
                                style={{marginBottom: 15, whiteSpace: 'break-spaces'}}>{solution.comment}</Typography>
                            : <MarkdownPreview value={solution.comment}/>}
                    </Grid>
                }
                {props.isProcessing ? (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1976d2', fontWeight: '500' }}>
                        <CircularProgress size="20px" />
                        &nbsp;&nbsp;Обрабатываем файлы...
                    </div>
                ) : filesInfo.length > 0 && (
                    <div>
                        <FilesPreviewList
                            showOkStatus={ !props.forMentor }
                            filesInfo={filesInfo}
                            onClickFileInfo={async (fileInfo: IFileInfo) => {
                                const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.id!)
                                window.open(url, '_blank');
                            }}
                        />
                    </div>
                    )}
                </Grid>
            </Grid>
        }
        {props.forMentor && props.isLastSolution && student && <Grid item>
            <StudentCharacteristics
                characteristics={student.characteristics}
                onChange={x => props.onRateSolutionClick?.()} //TODO
                courseId={props.courseId}
                studentId={student.userId!}/>
        </Grid>}
        {
            sentAfterDeadline && <Grid item>
                <Alert variant="standard" severity="warning">
                    Решение сдано на {sentAfterDeadline} позже дедлайна.
                </Alert>
            </Grid>
        }
        {
            checkAchievement && <Grid item>
                <Alert variant="outlined"
                       icon={achievement !== undefined ? null : <CircularProgress size={20} color={"inherit"}/>}
                       severity={achievement !== undefined && achievement >= 80 ? "success" : "info"}>
                    {achievement !== undefined ? `Лучше ${achievement}% других решений по задаче.` : "Смотрим на решения..."}
                </Alert>
            </Grid>
        }
        {
            (props.forMentor || isRated) &&
            <Grid xs={12} container item style={{marginTop: '10px'}}>
                {renderRatingCard()}
            </Grid>
        }
    </Grid>
}

export default TaskSolutionComponent
