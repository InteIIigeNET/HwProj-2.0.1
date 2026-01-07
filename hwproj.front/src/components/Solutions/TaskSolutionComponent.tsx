import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import {Button, CircularProgress, Grid, TextField, Typography} from "@material-ui/core";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import Link from '@material-ui/core/Link'
import './style.css'
import {
    GetSolutionModel,
    HomeworkTaskViewModel,
    SolutionState,
    SolutionActualityDto,
    SolutionActualityPart, StudentDataDto
} from '@/api'
import ApiSingleton from "../../api/ApiSingleton";
import {
    Alert,
    Avatar,
    Rating,
    Stack,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Chip,
    Box
} from "@mui/material";
import AvatarUtils from "../Utils/AvatarUtils";
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import {Edit, ThumbDown, ThumbUp} from "@mui/icons-material";
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

type TaskWithCriteria = HomeworkTaskViewModel & {};

type CriterionRating = {
    criterionId: number;
    name: string;
    maxPoints: number;
    value: number;
    comment: string;
};


interface ISolutionProps {
    courseId: number,
    solution: GetSolutionModel | undefined,
    student: StudentDataDto,
    task: TaskWithCriteria,
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
    const criteriaDraftKey =
        `criteria-draft:${props.task.id}:${props.student.userId}:${props.solution?.id ?? "new"}`;

    type CriteriaDraft = {
        criteria: { criterionId: number; value: number | null }[];
        extraScore: number;
    };

    const loadCriteriaDraft = (): CriteriaDraft | null => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem(criteriaDraftKey);
            if (!raw) return null;
            return JSON.parse(raw) as CriteriaDraft;
        } catch {
            return null;
        }
    };

    const saveCriteriaDraft = (draft: CriteriaDraft) => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(criteriaDraftKey, JSON.stringify(draft));
        } catch { /* empty */
        }
    };

    const clearCriteriaDraft = () => {
        if (typeof window === "undefined") return;
        try {
            localStorage.removeItem(criteriaDraftKey);
        } catch {
        }
    };

    const getDefaultState = (): ISolutionState => {
        const storageValue = RatingStorage.tryGet(storageKey);

        const clickedForRate = props.forMentor
            ? (storageValue !== null)
            : false;

        return {
            points: storageValue?.points || props.solution?.rating || 0,
            lecturerComment: storageValue?.comment || props.solution?.lecturerComment || "",
            clickedForRate,
            addBonusPoints: hasCriteria,
        };
    };


    const taskWithCriteria = props.task as TaskWithCriteria;
    const hasCriteria = !!(taskWithCriteria.criteria && taskWithCriteria.criteria.length);
    const [state, setState] = useState<ISolutionState>(getDefaultState);

    const initialDraft = loadCriteriaDraft();

    const [criterionRatings, setCriterionRatings] = useState<CriterionRating[]>(() =>
        (taskWithCriteria.criteria ?? []).map(c => {
            const id = c.id!;
            const draftValue = initialDraft?.criteria
                ?.find(x => x.criterionId === id)?.value;

            return {
                criterionId: id,
                name: c.name ?? "",
                maxPoints: c.maxPoints ?? 0,
                value: draftValue || NaN,
                comment: "",
            };
        })
    );

    const [extraScore, setExtraScore] = useState<number>(
        initialDraft?.extraScore ?? 0
    );
    const [criteriaModified, setCriteriaModified] = useState(false);
    const [showOriginalCommentText, setShowOriginalCommentText] = useState<boolean>(false)
    const [achievement, setAchievementState] = useState<number | undefined>(undefined)
    const [rateInProgress, setRateInProgressState] = useState<boolean | undefined>(false)
    const [solutionActuality, setSolutionActuality] = useState<SolutionActualityDto | undefined>(undefined)

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        setState(getDefaultState());

        const draft = loadCriteriaDraft();

        setCriterionRatings(
            (taskWithCriteria.criteria ?? []).map(c => {
                const id = c.id ?? 0;
                const draftValue = draft?.criteria
                    ?.find(x => x.criterionId === id)?.value;

                return {
                    criterionId: id,
                    name: c.name ?? "",
                    maxPoints: c.maxPoints ?? 0,
                    value: draftValue || NaN,
                    comment: "",
                };
            })
        );

        setExtraScore(draft?.extraScore ?? 0);
        setCriteriaModified(false);
        getAchievementState();
        setRateInProgressState(false);
        getActuality();
        setShowOriginalCommentText(false);
    }, [props.student.userId, props.task.id, props.solution?.id, props.solution?.rating]);

    useEffect(() => {
        if (!hasCriteria || !state.addBonusPoints || !state.clickedForRate || !criteriaModified) return;

        const criteriaTotal = criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        );
        const total = criteriaTotal + (Number.isFinite(extraScore) ? extraScore : 0);

        setState(prev => ({...prev, points: total}));
    }, [criterionRatings, extraScore, hasCriteria, state.addBonusPoints, state.clickedForRate, criteriaModified]);

    const criteriaSum =
        criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        ) + (Number.isFinite(extraScore) ? extraScore : 0);

    const isRateButtonDisabled = hasCriteria && criteriaSum < 0;

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
        if (!state.clickedForRate) return;

        RatingStorage.set(storageKey, {
            points: state.points,
            comment: state.lecturerComment
        });

        const draft: CriteriaDraft = {
            criteria: criterionRatings.map(cr => ({
                criterionId: cr.criterionId,
                value: Number.isFinite(cr.value) ? cr.value : null,
            })),
            extraScore: Number.isFinite(extraScore) ? extraScore : 0,
        };

        saveCriteriaDraft(draft);
    }, [
        state.points,
        state.lecturerComment,
        criterionRatings,
        extraScore,
        state.clickedForRate,
    ]);


    useEffect(() => {
        if (state.clickedForRate) return;

        RatingStorage.clean(storageKey);
        clearCriteriaDraft();
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

    const buildCommentWithCriteria = (baseComment: string): string => {
        if (!hasCriteria || criterionRatings.length === 0) return baseComment;

        const rows: string[] = criterionRatings.map(cr => {
            const safeValue = Number.isFinite(cr.value) ? cr.value : 0;
            return `| ${cr.name} | ${safeValue} / ${cr.maxPoints} |`;
        });

        if ((extraScore ?? 0) !== 0) {
            rows.push(`| Доп. оценка | ${extraScore} |`);
        }

        const table = [
            "| Критерий оценивания | Баллы |",
            "| --- | --- |",
            ...rows,
        ].join("\n");

        const trimmed = (baseComment ?? "").trim();
        const prefix = trimmed ? trimmed + "\n\n" : "";

        return `${prefix}${table}`;
    };

    const rateSolution = async (points: number, lecturerComment: string) => {
        setRateInProgressState(true);

        try {
            const finalComment = buildCommentWithCriteria(lecturerComment);

            if (props.solution) {
                await ApiSingleton.solutionsApi.solutionsRateSolution(
                    props.solution.id!,
                    {
                        rating: points,
                        lecturerComment: finalComment,
                    }
                );
            } else {
                await ApiSingleton.solutionsApi.solutionsPostEmptySolutionWithRate(
                    props.task.id!,
                    {
                        comment: "",
                        githubUrl: "",
                        lecturerComment: finalComment,
                        publicationDate: undefined,
                        rating: points,
                        studentId: props.student.userId,
                    }
                );
            }

            setState(prevState => ({...prevState, clickedForRate: false}));
            enqueueSnackbar("Решение успешно оценено", {
                variant: "success",
                autoHideDuration: 1700,
            });
            props.onRateSolutionClick?.();
        } finally {
            setRateInProgressState(false);
        }
    };

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
        const showThumbs = maxRating === 1;
        const isEditable = props.forMentor && (!isRated || state.clickedForRate);

        if (hasCriteria && props.forMentor) {
            if (!isRated) {
                return (
                    <Button
                        size="small"
                        onClick={() =>
                            setState(prev => ({...prev, clickedForRate: true}))
                        }
                        style={{
                            color: "#3f51b5",
                            paddingLeft: 0,
                            paddingRight: 0,
                            textTransform: "uppercase",
                            fontWeight: 500,
                            marginBottom: 8,
                            fontSize: "0.95rem",
                        }}
                    >
                        Оценить решение
                    </Button>
                );
            }
        }

        const thumbsHandler = (rating: number) => {
            clickForRate(rating, isEditable);
        };

        if (maxRating <= 10 && points <= maxRating && !addBonusPoints)
            return (
                <Grid container item direction="row" spacing={1} alignItems="center">
                    {showThumbs && (
                        <Grid item>
                            <Stack direction="row" alignItems="center">
                                <IconButton disabled={!isEditable} onClick={() => thumbsHandler(1)}>
                                    <ThumbUp color={points === 1 ? "success" : "disabled"}/>
                                </IconButton>
                                <IconButton disabled={!isEditable} onClick={() => thumbsHandler(0)}>
                                    <ThumbDown
                                        color={
                                            (isRated || state.clickedForRate) && points === 0
                                                ? "error"
                                                : "disabled"
                                        }
                                    />
                                </IconButton>
                            </Stack>
                        </Grid>
                    )}

                    {!showThumbs && (
                        <Grid item>
                            <Stack direction="row" alignItems="center">
                                {(isEditable || !isRated) && (
                                    <IconButton
                                        size="small"
                                        disabled={!isEditable}
                                        onClick={() => thumbsHandler(0)}
                                    >
                                        <ThumbDown
                                            color={isRated && points === 0 ? "error" : "disabled"}
                                        />
                                    </IconButton>
                                )}
                                <Rating
                                    key={solution?.id}
                                    name="customized"
                                    size="large"
                                    max={maxRating}
                                    value={points}
                                    readOnly={!isEditable}
                                    onMouseDown={event => {
                                        const isFirefox = navigator.userAgent
                                            .toLowerCase()
                                            .includes("firefox");
                                        if (event.ctrlKey && isFirefox) {
                                            const ratingElement = event.currentTarget;
                                            const {left, width} = ratingElement.getBoundingClientRect();
                                            const relativeX = (event.clientX - left) / width;
                                            const star = Math.ceil(relativeX * maxRating) || 0;
                                            const rating = star === points ? 0 : star;

                                            clickForRate(rating || 0, true);
                                        }
                                    }}
                                    onChange={(_, newValue) => {
                                        clickForRate(newValue || 0, true);
                                    }}
                                />
                            </Stack>
                        </Grid>
                    )}

                    {!addBonusPoints && props.forMentor && state.clickedForRate && (
                        <Grid item>
                            <Tooltip arrow title={"Позволяет поставить оценку выше максимальной"}>
                                <Typography variant="caption">
                                    <Link
                                        onClick={() =>
                                            setState(prev => ({...prev, addBonusPoints: true}))
                                        }
                                    >
                                        Нужна особая оценка?
                                    </Link>
                                </Typography>
                            </Tooltip>
                        </Grid>
                    )}
                </Grid>
            );

        return (
            <Grid container item direction="row" spacing={1} alignItems="center">
                <Grid item>
                    {isEditable ? (
                        <TextField
                            style={{width: 100}}
                            required
                            label="Баллы"
                            variant="outlined"
                            margin="normal"
                            type="number"
                            fullWidth
                            InputProps={{
                                readOnly: hasCriteria || !props.forMentor || !state.clickedForRate,
                                inputProps: {min: 0, value: points},
                            }}
                            size="small"
                            onChange={(e) => {
                                if (hasCriteria) return;

                                e.persist();
                                setState(prevState => ({
                                    ...prevState,
                                    points: +e.target.value,
                                }));
                            }}
                            onClick={() => {
                                if (isRated) return;
                                setState(prevState => ({
                                    ...prevState,
                                    clickedForRate: props.forMentor,
                                }));
                            }}
                        />
                    ) : (
                        <Chip
                            label={<Typography variant="h6">{points}</Typography>}
                            size="medium"
                        />
                    )}
                </Grid>
                <Grid item>{` / ${maxRating}`}</Grid>
            </Grid>
        );
    };


    const renderCriteriaBlock = () => {
        if (!hasCriteria) return null;

        const criteriaTotal = criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        );
        const totalWithExtra = criteriaTotal + (Number.isFinite(extraScore) ? extraScore : 0);
        const isCriteriaSumNegative = totalWithExtra < 0;

        return (
            <Grid container item direction="column" spacing={1} style={{marginTop: 0}}>
                <Grid item>
                    <Box
                        display="grid"
                        gridTemplateColumns="auto auto"
                        columnGap={16}
                        rowGap={0}
                    >
                        {taskWithCriteria.criteria!.map((c, index) => {
                            const existingRating = criterionRatings.find(r => r.criterionId === c.id);

                            const current =
                                existingRating || {
                                    criterionId: c.id,
                                    name: c.name,
                                    maxPoints: c.maxPoints,
                                    value: Number.NaN,
                                    comment: "",
                                };

                            const numericValue = Number.isFinite(current.value) ? current.value : 0;

                            const hasExplicitValue = Number.isFinite(current.value);

                            const isThumbCriterion = c.maxPoints === 1;
                            const hasStars =
                                typeof c.maxPoints === "number" && c.maxPoints <= 10 && !isThumbCriterion;

                            const isFilled = hasExplicitValue && (isThumbCriterion || numericValue !== 0);

                            return (
                                <React.Fragment key={c.id}>
                                    <Box display="flex" alignItems="center">
                                        <Box
                                            width={24}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            mr={1}
                                        >
                                            <CheckCircleOutlineIcon
                                                style={{
                                                    fontSize: 18,
                                                    color: isFilled ? "#3f51b5" : "#c0c0c0",
                                                    opacity: isFilled ? 1 : 0.4,
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="body1">
                                            {c.name}
                                        </Typography>

                                    </Box>

                                    <Box>
                                        {isThumbCriterion ? (
                                            <Stack direction="row" alignItems="center">
                                                <IconButton
                                                    size="small"
                                                    disabled={!props.forMentor || !state.clickedForRate}
                                                    onClick={() => {
                                                        setCriteriaModified(true);
                                                        setCriterionRatings(prev =>
                                                            prev.map(r =>
                                                                r.criterionId === c.id
                                                                    ? {...r, value: 1}
                                                                    : r
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <ThumbUp
                                                        color={hasExplicitValue && numericValue === 1 ? "success" : "disabled"}
                                                        fontSize="small"
                                                    />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    disabled={!props.forMentor || !state.clickedForRate}
                                                    onClick={() => {
                                                        setCriteriaModified(true);
                                                        setCriterionRatings(prev =>
                                                            prev.map(r =>
                                                                r.criterionId === c.id
                                                                    ? {...r, value: 0}
                                                                    : r
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <ThumbDown
                                                        color={hasExplicitValue && numericValue === 0 ? "error" : "disabled"}
                                                        fontSize="small"
                                                    />
                                                </IconButton>

                                            </Stack>
                                        ) : hasStars ? (
                                            <Rating
                                                max={c.maxPoints}
                                                size="medium"
                                                value={Math.max(
                                                    0,
                                                    Math.min(numericValue, c.maxPoints ?? Number.POSITIVE_INFINITY)
                                                )}
                                                onChange={(_, newValue) => {
                                                    let val = Number(newValue || 0);
                                                    if (Number.isNaN(val)) val = 0;
                                                    if (c.maxPoints && val > c.maxPoints) {
                                                        val = c.maxPoints;
                                                    }

                                                    setCriteriaModified(true);
                                                    setCriterionRatings(prev =>
                                                        prev.map(r =>
                                                            r.criterionId === c.id
                                                                ? {...r, value: val}
                                                                : r
                                                        )
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <Box display="flex" alignItems="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    style={{width: 50}}
                                                    value={numericValue}
                                                    variant="standard"
                                                    margin="dense"
                                                    inputProps={{max: c.maxPoints}}
                                                    onChange={e => {
                                                        let val = Number(e.target.value);
                                                        if (Number.isNaN(val)) val = 0;

                                                        setCriteriaModified(true);
                                                        setCriterionRatings(prev =>
                                                            prev.map(r =>
                                                                r.criterionId === c.id
                                                                    ? {...r, value: val}
                                                                    : r
                                                            )
                                                        );
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                    style={{marginLeft: 4}}
                                                >
                                                    / {c.maxPoints}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </React.Fragment>
                            );
                        })}
                        <Box display="flex" alignItems="center">
                            <Box
                                width={24}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mr={1}
                            >
                                <CheckCircleOutlineIcon
                                    style={{
                                        fontSize: 18,
                                        color: extraScore !== 0 ? "#3f51b5" : "#c0c0c0",
                                        opacity: extraScore !== 0 ? 1 : 0.4,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="body1"
                                style={{
                                    color: '#555',
                                    marginTop: 0,
                                    marginBottom: 0,
                                    lineHeight: 1.2,
                                    letterSpacing: '0.2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Доп. оценка (опционально)
                            </Typography>
                        </Box>
                        <TextField
                            type="number"
                            size="small"
                            style={{width: 50}}
                            value={extraScore}
                            variant="standard"
                            margin="dense"
                            placeholder="0"
                            onChange={e => {
                                let val = Number(e.target.value || 0);
                                if (Number.isNaN(val)) val = 0;

                                setCriteriaModified(true);
                                setExtraScore(val);
                            }}
                        />
                    </Box>
                </Grid>

                <Grid item>
                    <Typography
                        variant="body1"
                        style={{
                            marginTop: 0,
                            marginBottom: 8,
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            color: isCriteriaSumNegative ? "#d32f2f" : undefined,
                        }}
                    >
                        {`Сумма по критериям: ${totalWithExtra} из ${maxRating}`}
                    </Typography>
                </Grid>

            </Grid>
        );
    };


    const sentAfterDeadline = solution && task.hasDeadline && getDatesDiff(solution.publicationDate!, task.deadlineDate!)

    const renderRatingCard = () => {
        const rating = points * 100 / maxRating
        const {backgroundColor, color} =
            state.clickedForRate || !isRated
                ? {backgroundColor: undefined, color: undefined}
                : rating >= 70
                    ? {backgroundColor: "rgb(237,247,237)", color: "rgb(30,70,32)"}
                    : rating <= 34
                        ? {backgroundColor: "rgb(253,237,237)", color: "rgb(95,33,32)"}
                        : {backgroundColor: "rgb(255,244,229)", color: "rgb(102,60,0)"}

        const isNegative = points < 0
        return <Card
            variant="outlined"
            sx={{
                borderColor:
                    (state.clickedForRate || isRated)
                        ? (isNegative
                            ? "rgb(211,47,47)"
                            : StudentStatsUtils.getRatingColor(points, maxRating))
                        : "",
                width: "100%",
                backgroundColor,
                color,
            }}
        >
            <CardContent style={{paddingBottom: 5, marginBottom: 0}}>
                <Grid container direction={"column"} spacing={1}>
                    {(!hasCriteria || !state.clickedForRate) && <Grid item>
                        {renderRateInput()}
                    </Grid>}
                    {props.forMentor && hasCriteria && state.addBonusPoints && state.clickedForRate && (
                        <Grid item>
                            {renderCriteriaBlock()}
                        </Grid>
                    )}

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
                    {lecturerName && isRated && (
                        <Grid item>
                            <Stack direction={"row"} alignItems={"center"} spacing={1} style={{marginTop: 5}}>
                                {props.forMentor && state.clickedForRate ? (
                                    <Avatar>
                                        <Edit/>
                                    </Avatar>
                                ) : (
                                    <Avatar {...AvatarUtils.stringAvatar(lecturer!)} />
                                )}

                                <Stack direction={"column"}>
                                    <Typography variant={"body1"}>
                                        {props.forMentor && state.clickedForRate ? (
                                            "..."
                                        ) : (
                                            <div style={{color: "black"}}>
                                                {lecturerName}
                                                <sub style={{color: "#3f51b5"}}> {lecturer!.companyName}</sub>
                                            </div>
                                        )}
                                    </Typography>
                                    {ratingTime && (
                                        <Typography variant={"caption"} style={{color: "GrayText"}}>
                                            {ratingTime}
                                        </Typography>
                                    )}
                                </Stack>
                            </Stack>
                        </Grid>
                    )}
                    {state.clickedForRate && props.forMentor
                        ? (
                            <Grid item style={{marginBottom: -7, marginTop: -8}}>
                                <MarkdownEditor
                                    label="Комментарий преподавателя"
                                    value={state.lecturerComment}
                                    onChange={(value) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            lecturerComment: value,
                                        }));
                                    }}
                                />
                            </Grid>
                        )
                        : isRated && (
                        <Grid item>
                            <MarkdownPreview
                                value={lecturerComment}
                                backgroundColor={backgroundColor}
                                textColor={color}
                            />
                        </Grid>
                    )
                    }
                </Grid>
            </CardContent>
            {props.forMentor && state.clickedForRate && (
                <>
                    <CardActions>
                        <LoadingButton
                            endIcon={<span style={{width: rateInProgress ? 17 : 0}}/>}
                            style={isRateButtonDisabled ? {} : {color: "#3f51b5"}}
                            loading={rateInProgress}
                            loadingPosition="end"
                            size="small"
                            disabled={isRateButtonDisabled || rateInProgress}
                            onClick={() => {
                                rateSolution(points, lecturerComment);
                            }}
                        >
                            {isRated ? "Изменить оценку" : "Оценить решение"}
                        </LoadingButton>

                        {!rateInProgress && (
                            <Button
                                size="small"
                                onClick={() => {
                                    setState(prevState => ({
                                        ...prevState,
                                        points: props.solution?.rating || 0,
                                        lecturerComment: props.solution?.lecturerComment || "",
                                        addBonusPoints: hasCriteria,
                                        clickedForRate: false,
                                    }));
                                }}
                            >
                                Отмена
                            </Button>
                        )}
                    </CardActions>
                </>
            )}
            {props.forMentor && isRated && !state.clickedForRate && <CardActions>
                <Button
                    color="primary"
                    size="small"
                    onClick={() => {
                        if (hasCriteria) {
                            setCriterionRatings(prev =>
                                prev.map(cr => ({
                                    ...cr,
                                    value: 0,
                                }))
                            );
                            setExtraScore(0);
                            setCriteriaModified(true);

                            setState(prev => ({
                                ...prev,
                                points: 0,
                                clickedForRate: true,
                            }));
                        } else {
                            setState(prev => ({
                                ...prev,
                                clickedForRate: true,
                            }));
                        }
                    }}
                >
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
                {solution.comment &&
                    <Grid item style={{marginBottom: -16}}>
                        {showOriginalCommentText
                            ? <Typography
                                style={{marginBottom: 15, whiteSpace: 'break-spaces'}}>{solution.comment}</Typography>
                            : <MarkdownPreview value={solution.comment}/>}
                    </Grid>
                }
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
                {
                    renderRatingCard()
                }
            </Grid>

        }
    </Grid>
}

export default TaskSolutionComponent
