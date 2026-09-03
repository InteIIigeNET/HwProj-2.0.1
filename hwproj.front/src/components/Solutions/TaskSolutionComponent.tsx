import * as React from 'react';
import {FC, useEffect, useState} from 'react';
import {Button, CircularProgress, Typography} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Link from '@mui/material/Link'
// Глобальный класс .antiLongWords используется и другими страницами, поэтому стиль подключаем здесь
import './style.css'
import {
    GetSolutionModel,
    HomeworkTaskViewModel,
    SolutionState,
    SolutionActualityDto,
    SolutionActualityPart, StudentDataDto, FileInfoDTO, CriterionViewModel
} from '@/api'
import ApiSingleton from "../../api/ApiSingleton";
import {
    Alert,
    Avatar,
    Divider,
    LinearProgress,
    Paper,
    Rating,
    Stack,
    Tooltip,
    IconButton,
    Chip,
    Box, TextField
} from "@mui/material";
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AvatarUtils from "../Utils/AvatarUtils";
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import {ThumbDown, ThumbUp} from "@mui/icons-material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
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
import {UserAvatar} from "@/components/Common/UserAvatar";

type TaskWithCriteria = HomeworkTaskViewModel & {};

const CriterionTypeDeadline = 1;

type CriterionRating = {
    criterionId: number;
    name: string;
    maxPoints: number;
    value: number;
    comment: string;
};

// Оформление согласовано с редизайном страницы решений студента: та же рамка, радиусы и мягкие шапки
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const panelHeaderSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const sectionSx = {
    px: {xs: 1.5, sm: 2},
    py: 1.75,
}

const actionsBarSx = {
    px: {xs: 1.5, sm: 2},
    py: 1.25,
    backgroundColor: "#fafbfe",
}

const alertSx = {borderRadius: "12px"}

const actionButtonSx = {
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 500,
    px: 2,
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const linkChipSx = {
    height: 24,
    border: "1px solid #d5d9e6",
    backgroundColor: "#f6f7fb",
    color: "#24292f",
    fontWeight: 500,
    transition: "background-color .15s, border-color .15s",
    "& .MuiChip-icon": {fontSize: 14, ml: 0.75, mr: -0.25, color: "inherit"},
    "& .MuiChip-label": {px: 0.75, fontSize: "0.8125rem"},
    "&:hover, &:focus": {backgroundColor: "#eef0f8", borderColor: "#a8b0d8", textDecoration: "none"},
}

const pendingChipSx = {
    height: 22,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.75rem", fontWeight: 500},
}

// Цвет оценки берём из ведомости, поэтому чипу задаём только форму и ровные цифры
const scoreChipSx = (color: string) => ({
    height: 24,
    flexShrink: 0,
    backgroundColor: color,
    color: "#fff",
    fontVariantNumeric: "tabular-nums",
    "& .MuiChip-label": {px: 1, fontSize: "0.8125rem", fontWeight: 600},
})

// Оценку показываем в спокойной подложке, чтобы звёзды и «палец вниз» читались как один контрол
const ratingBoxSx = {
    px: 1,
    py: 0.5,
    borderRadius: "12px",
    border: "1px solid #e0e3e7",
    backgroundColor: "#fff",
}

const scoreTextSx = {
    ml: 0.5,
    fontSize: "0.9375rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    color: "text.secondary",
    whiteSpace: "nowrap" as const,
}

const criteriaBoxSx = {
    borderRadius: "12px",
    border: "1px solid #e0e3e7",
    backgroundColor: "#fff",
    overflow: "hidden",
}

const criteriaRowSx = {
    px: 1.5,
    py: 0.875,
    minHeight: 44,
}

const criteriaFooterSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#fafbfe",
}

const hintSx = {
    color: "text.secondary",
    fontSize: "0.75rem",
}

// Полоса врезок под решением: дедлайн и место среди решений стоят рядом, как две ячейки статистики
const insightPanelSx = {
    ...panelSx,
    borderColor: "#dfe3f2",
    backgroundColor: "#fff",
}

const insightCellSx = {
    flex: 1,
    minWidth: 0,
    px: 1.75,
    py: 1.25,
}

const insightBadgeSx = (bg: string, fg: string) => ({
    width: 34,
    height: 34,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: bg,
    color: fg,
})

const criterionValueSx = {
    minWidth: 42,
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    color: "text.secondary",
    whiteSpace: "nowrap" as const,
}

// Тон панели повторяет прежнюю логику подсветки оценки: зелёный / янтарный / красный.
// Шапка чуть глубже тела, чтобы разделитель читался на залитой панели
const gradeTone = (percent: number) =>
    percent >= 70
        ? {bg: "rgb(237,247,237)", headerBg: "rgb(226,243,226)", fg: "rgb(30,70,32)"}
        : percent <= 34
            ? {bg: "rgb(253,237,237)", headerBg: "rgb(251,227,227)", fg: "rgb(95,33,32)"}
            : {bg: "rgb(255,244,229)", headerBg: "rgb(254,237,212)", fg: "rgb(102,60,0)"}

interface ISolutionProps {
    courseId: number,
    solution: GetSolutionModel | undefined,
    student: StudentDataDto,
    task: TaskWithCriteria,
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

    const parseNumber = (value: string): number | undefined => {
        const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
        if (!match) return undefined;

        const parsed = Number(match[0]);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parseStoredCriteria = (comment?: string) => {
        const criteria = new Map<string, number>();
        let extraScore: number | undefined;
        if (!comment) return {criteria, extraScore, commentWithoutCriteria: ""};

        const lines = comment.split("\n");
        const tableStart = lines.findIndex(line =>
            line.trim() === "| Критерий оценивания | Баллы |"
        );
        if (tableStart === -1) {
            return {criteria, extraScore, commentWithoutCriteria: comment};
        }

        let tableEnd = tableStart + 1;
        for (; tableEnd < lines.length; tableEnd++) {
            const line = lines[tableEnd].trim();
            if (!line.startsWith("|") || !line.endsWith("|")) break;
        }

        lines.slice(tableStart + 2, tableEnd).forEach(line => {
            const cells = line
                .split("|")
                .slice(1, -1)
                .map(cell => cell.trim());
            if (cells.length < 2) return;

            const value = parseNumber(cells[1]);
            if (value === undefined) return;

            if (cells[0] === "Доп. оценка") {
                extraScore = value;
            } else {
                criteria.set(cells[0], value);
            }
        });

        const commentWithoutCriteria = [
            ...lines.slice(0, tableStart),
            ...lines.slice(tableEnd),
        ].join("\n").trim();

        return {criteria, extraScore, commentWithoutCriteria};
    };

    const getInitialCriterionValue = (
        criterionId: number,
        criterionName: string,
        draft: CriteriaDraft | null,
        storedCriteria: Map<string, number>
    ) => {
        const draftValue = draft?.criteria
            ?.find(x => x.criterionId === criterionId)?.value;
        if (typeof draftValue === "number") return draftValue;

        const storedValue = storedCriteria.get(criterionName);
        return storedValue ?? Number.NaN;
    };

    const getDefaultState = (): ISolutionState => {
        const storageValue = RatingStorage.tryGet(storageKey);
        const storedCriteria = parseStoredCriteria(props.solution?.lecturerComment);

        const clickedForRate = props.forMentor
            ? (storageValue != null)
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
    const initialStoredCriteria = parseStoredCriteria(props.solution?.lecturerComment);

    // Критерий по дедлайну считается автоматически. Если сравнивать нечего (решения нет либо у критерия
    // не задана дата), штрафа нет: блок и раньше показывал «Сдано вовремя», но значение оставалось NaN
    // и критерий считался незаполненным — оценку было не выставить
    const getDeadlineCriterionValue = (criterion: { arguments?: string; maxPoints?: number }) => {
        if (!props.solution?.publicationDate || !criterion.arguments) return 0;

        const solutionDate = new Date(props.solution.publicationDate).getTime();
        const deadlineDate = new Date(criterion.arguments).getTime();

        if (Number.isNaN(solutionDate) || Number.isNaN(deadlineDate)) return 0;

        return solutionDate <= deadlineDate ? 0 : -(criterion.maxPoints ?? 0);
    };

    const [criterionRatings, setCriterionRatings] = useState<CriterionRating[]>(() =>
        (taskWithCriteria.criteria ?? []).map(c => {
            const id = c.id!;
            const deadlineValue = c.type === CriterionTypeDeadline
                ? getDeadlineCriterionValue(c)
                : Number.NaN;

            return {
                criterionId: id,
                name: c.name ?? "",
                maxPoints: c.maxPoints ?? 0,
                value: Number.isFinite(deadlineValue)
                    ? deadlineValue
                    : getInitialCriterionValue(id, c.name ?? "", initialDraft, initialStoredCriteria.criteria),
                comment: "",
            };
        })
    );

    const [extraScore, setExtraScore] = useState<number>(
        initialDraft?.extraScore ?? initialStoredCriteria.extraScore ?? 0
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
        const storedCriteria = parseStoredCriteria(props.solution?.lecturerComment);

        setCriterionRatings(
            (taskWithCriteria.criteria ?? []).map(c => {
                const id = c.id ?? 0;
                const deadlineValue = c.type === CriterionTypeDeadline
                    ? getDeadlineCriterionValue(c)
                    : Number.NaN;

                return {
                    criterionId: id,
                    name: c.name ?? "",
                    maxPoints: c.maxPoints ?? 0,
                    value: Number.isFinite(deadlineValue)
                        ? deadlineValue
                        : getInitialCriterionValue(id, c.name ?? "", draft, storedCriteria.criteria),
                    comment: "",
                };
            })
        );

        setExtraScore(draft?.extraScore ?? storedCriteria.extraScore ?? 0);
        setCriteriaModified(false);
        getAchievementState();
        setRateInProgressState(false);
        getActuality();
        setShowOriginalCommentText(false);
    }, [props.student.userId, props.task.id, props.solution?.id, props.solution?.rating, props.solution?.lecturerComment]);

    useEffect(() => {
        if (!hasCriteria || !state.addBonusPoints || !state.clickedForRate || !criteriaModified) return;

        const criteriaTotalRaw = criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        );
        const criteriaTotal = Math.max(0, criteriaTotalRaw);
        const total = criteriaTotal + (Number.isFinite(extraScore) ? extraScore : 0);

        setState(prev => ({...prev, points: total}));
    }, [criterionRatings, extraScore, hasCriteria, state.addBonusPoints, state.clickedForRate, criteriaModified]);

    const criteriaTotalRaw =
        criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        );
    const criteriaSum = Math.max(0, criteriaTotalRaw) + (Number.isFinite(extraScore) ? extraScore : 0);

    // Автоматические критерии (дедлайн) преподаватель не заполняет, поэтому они не могут блокировать оценку
    const isAutoCriterion = (criterionId: number) =>
        taskWithCriteria.criteria?.find(c => c.id === criterionId)?.type === CriterionTypeDeadline;

    const hasUnfilledCriteria =
        hasCriteria && criterionRatings.some(c =>
            !isAutoCriterion(c.criterionId) && !Number.isFinite(c.value));
    const isRateButtonDisabled = hasUnfilledCriteria;

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
            const criterion = taskWithCriteria.criteria?.find(c => c.id === cr.criterionId);
            const safeValue = Number.isFinite(cr.value) ? cr.value : 0;

            if (criterion?.type === CriterionTypeDeadline) {
                const deadlineDelay = criterion.arguments && solution?.publicationDate
                    ? getDatesDiff(solution.publicationDate!, new Date(criterion.arguments))
                    : "";
                const statusText = safeValue === 0
                    ? "Сдано вовремя"
                    : `Сдано позже${deadlineDelay ? ` на ${deadlineDelay}` : ""}`;
                const valueText = safeValue === 0 ? "✅" : `${safeValue}`;

                return `| ${cr.name} (${statusText.toLowerCase()}) | ${valueText} |`;
            }

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
    const filesInfo = solution?.id ? FileInfoConverter.getCourseUnitFilesInfo(props.courseFilesInfo, CourseUnitType.Solution, solution.id) : []
    const githubUrl = solution?.githubUrl?.trim()

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

    const scoreColor = points < 0
        ? "#d32f2f"
        : StudentStatsUtils.getRatingColor(points, maxRating)

    const renderRateInput = () => {
        const showThumbs = maxRating === 1;
        const isEditable = props.forMentor && (!isRated || state.clickedForRate);

        if (hasCriteria && props.forMentor) {
            if (!isRated) {
                return (
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            startIcon={<StarBorderRoundedIcon/>}
                            sx={actionButtonSx}
                            onClick={() => {
                                setCriteriaModified(true);
                                setState(prev => ({...prev, points: criteriaSum, clickedForRate: true}));
                            }}
                        >
                            Оценить решение
                        </Button>
                    </Box>
                );
            }
        }

        const thumbsHandler = (rating: number) => {
            clickForRate(rating, isEditable);
        };

        if (maxRating <= 10 && points <= maxRating && !addBonusPoints)
            return (
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{rowGap: 1}}>
                    {showThumbs && (
                        <Stack direction="row" alignItems="center" sx={ratingBoxSx}>
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
                    )}

                    {!showThumbs && (
                        <Stack direction="row" alignItems="center" sx={ratingBoxSx}>
                            {(isEditable || !isRated) && (
                                <IconButton
                                    size="small"
                                    disabled={!isEditable}
                                    onClick={() => thumbsHandler(0)}
                                >
                                    <ThumbDown
                                        color={state.clickedForRate && points === 0 ? "error" : "disabled"}
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
                            {/* Цифрой дублируем звёзды: так оценку видно, не пересчитывая их глазами */}
                            <Typography sx={scoreTextSx}>{`${points} / ${maxRating}`}</Typography>
                        </Stack>
                    )}

                    {!addBonusPoints && props.forMentor && state.clickedForRate && (
                        <Tooltip arrow title={"Позволяет поставить оценку выше максимальной"}>
                            <Link
                                component="button"
                                type="button"
                                underline={"hover"}
                                sx={{fontSize: "0.8125rem"}}
                                onClick={() =>
                                    setState(prev => ({...prev, addBonusPoints: true}))
                                }
                            >
                                Нужна особая оценка?
                            </Link>
                        </Tooltip>
                    )}
                </Stack>
            );

        return (
            <Stack direction="row" spacing={1} alignItems={"center"}>
                {isEditable ? (
                    <TextField
                        required
                        label="Баллы"
                        variant="outlined"
                        size="small"
                        type="number"
                        sx={{...inputSx, width: 110}}
                        InputProps={{
                            readOnly: hasCriteria || !props.forMentor || !state.clickedForRate,
                            inputProps: {min: 0, value: points},
                        }}
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
                    <Chip label={points} size="medium" sx={scoreChipSx(scoreColor)}/>
                )}
                <Typography sx={{color: "text.secondary", fontVariantNumeric: "tabular-nums"}}>
                    {` / ${maxRating}`}
                </Typography>
            </Stack>
        );
    };


    const renderCriteriaBlock = () => {
        if (!hasCriteria) return null;

        const criteriaTotalRaw = criterionRatings.reduce(
            (sum, c) => sum + (Number.isFinite(c.value) ? Number(c.value) : 0),
            0
        );
        const criteriaTotal = Math.max(0, criteriaTotalRaw);
        const totalWithExtra = criteriaTotal + (Number.isFinite(extraScore) ? extraScore : 0);
        const deadlineCriteria = taskWithCriteria.criteria!.filter(c => c.type === CriterionTypeDeadline);
        const regularCriteria = taskWithCriteria.criteria!.filter(c => c.type !== CriterionTypeDeadline);

        const renderDeadlineCriterion = (c: CriterionViewModel) => {
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
            const deadlineDate = c.arguments ? new Date(c.arguments) : undefined;
            const isSubmittedOnTime = numericValue === 0;
            const deadlineDelay = deadlineDate && solution?.publicationDate
                ? getDatesDiff(solution.publicationDate!, deadlineDate)
                : "";

            return (
                <Alert
                    key={c.id}
                    severity={isSubmittedOnTime ? "success" : "error"}
                    icon={isSubmittedOnTime
                        ? <CheckIcon fontSize="small" color="success"/>
                        : <CloseIcon fontSize="small" color="error"/>}
                    sx={{
                        borderRadius: "10px",
                        alignItems: "center",
                        py: 0.5,
                        "& .MuiAlert-message": {width: "100%", py: 0.5},
                        "& .MuiAlert-icon": {alignItems: "center", py: 0.5},
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{width: "100%"}}
                    >
                        <Box sx={{minWidth: 0}}>
                            <Typography variant="body2" sx={{fontWeight: 500}}>{c.name}</Typography>
                            <Typography variant="caption" sx={{color: "text.secondary"}}>
                                {isSubmittedOnTime
                                    ? "Сдано вовремя"
                                    : `Сдано позже${deadlineDelay ? ` на ${deadlineDelay}` : ""}`}
                            </Typography>
                        </Box>
                        {!isSubmittedOnTime && (
                            <Chip
                                size="small"
                                color="error"
                                label={numericValue}
                                sx={{flexShrink: 0, fontVariantNumeric: "tabular-nums"}}
                            />
                        )}
                    </Stack>
                </Alert>
            );
        };

        const renderRegularCriterion = (c: CriterionViewModel) => {
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
                <Stack
                    key={c.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={criteriaRowSx}
                >
                    <CheckCircleOutlineIcon
                        sx={{
                            fontSize: 18,
                            flexShrink: 0,
                            color: isFilled ? "#3f51b5" : "#c6cad6",
                        }}
                    />
                    <Typography variant="body2" sx={{flexGrow: 1, minWidth: 0}}>
                        {c.name}
                    </Typography>

                    <Box sx={{flexShrink: 0}}>
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
                            <Stack direction="row" alignItems="center" spacing={0.75}>
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
                                <Typography variant="caption" sx={criterionValueSx}>
                                    {`${hasExplicitValue ? numericValue : "—"} / ${c.maxPoints}`}
                                </Typography>
                            </Stack>
                        ) : (
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                <TextField
                                    type="number"
                                    size="small"
                                    sx={{...inputSx, width: 76}}
                                    value={numericValue}
                                    variant="outlined"
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
                                <Typography variant="caption" sx={criterionValueSx}>
                                    {`/ ${c.maxPoints}`}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>
            );
        };

        return (
            <Stack spacing={1.5}>
                {deadlineCriteria.length > 0 &&
                    <Stack spacing={1}>
                        {deadlineCriteria.map(renderDeadlineCriterion)}
                    </Stack>}
                <Box sx={criteriaBoxSx}>
                    <Stack divider={<Divider/>}>
                        {regularCriteria.map(renderRegularCriterion)}
                        <Stack direction="row" alignItems="center" spacing={1.25} sx={criteriaRowSx}>
                            <CheckCircleOutlineIcon
                                sx={{
                                    fontSize: 18,
                                    flexShrink: 0,
                                    color: extraScore !== 0 ? "#3f51b5" : "#c6cad6",
                                }}
                            />
                            <Box sx={{flexGrow: 1, minWidth: 0}}>
                                <Typography variant="body2">Доп. оценка</Typography>
                                <Typography variant="caption" sx={{color: "text.secondary"}}>
                                    Необязательно, добавляется к сумме
                                </Typography>
                            </Box>
                            <TextField
                                type="number"
                                size="small"
                                sx={{...inputSx, width: 76, flexShrink: 0}}
                                value={extraScore}
                                variant="outlined"
                                placeholder="0"
                                inputProps={{min: 0}}
                                onChange={e => {
                                    let val = Number(e.target.value || 0);
                                    if (Number.isNaN(val)) val = 0;
                                    val = Math.max(0, val);

                                    setCriteriaModified(true);
                                    setExtraScore(val);
                                }}
                            />
                        </Stack>
                    </Stack>
                    <Divider/>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                        sx={criteriaFooterSx}
                    >
                        <Typography variant="body2" sx={{fontWeight: 500}}>
                            Сумма по критериям
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {hasUnfilledCriteria &&
                                <Typography variant="caption" sx={{color: "warning.dark"}}>
                                    заполнены не все критерии
                                </Typography>}
                            <Chip
                                size="small"
                                label={`${totalWithExtra} из ${maxRating}`}
                                sx={{
                                    flexShrink: 0,
                                    fontVariantNumeric: "tabular-nums",
                                    fontWeight: 600,
                                    ...(totalWithExtra === 0
                                        ? {backgroundColor: "#fdeded", color: "#5f2120"}
                                        : {backgroundColor: "#e4e7f6", color: "#3f51b5"}),
                                }}
                            />
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        );
    };


    const sentAfterDeadline = solution && task.hasDeadline && getDatesDiff(solution.publicationDate!, task.deadlineDate!)

    const renderRatingPanel = () => {
        const percent = maxRating > 0 ? points * 100 / maxRating : 0
        const isEditing = props.forMentor && state.clickedForRate
        // Тон и цвет рамки берём и во время оценивания — оценка сразу видна по цвету панели
        const isScored = isRated || state.clickedForRate
        const tone = isScored ? gradeTone(percent) : undefined

        return (
            <Paper
                variant={"outlined"}
                sx={{
                    ...panelSx,
                    borderWidth: 2,
                    borderColor: isScored ? scoreColor : "#c4cad2",
                }}
            >
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    spacing={1}
                    sx={{...panelHeaderSx, ...(tone && {backgroundColor: tone.bg, color: tone.fg})}}
                >
                    <StarBorderRoundedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>
                        {isEditing
                            ? (isRated ? "Изменение оценки" : "Оценивание решения")
                            : "Оценка"}
                    </Typography>
                    <Box sx={{flexGrow: 1}}/>
                    {isScored
                        ? <Chip
                            size={"small"}
                            label={`${points} / ${maxRating}`}
                            sx={scoreChipSx(scoreColor)}
                        />
                        : <Chip size={"small"} label={"Ожидает проверки"} sx={pendingChipSx}/>}
                </Stack>
                <Divider/>
                <Box sx={sectionSx}>
                    <Stack spacing={1.75}>
                        {(!hasCriteria || !state.clickedForRate) && renderRateInput()}
                        {props.forMentor && hasCriteria && state.addBonusPoints && state.clickedForRate &&
                            renderCriteriaBlock()}

                        {!isRated && !state.clickedForRate && maxRating <= 10 && !addBonusPoints &&
                            <Typography sx={hintSx}>
                                Нажмите{" "}
                                <Box component={"span"} sx={{color: isCtrlPressed ? "#3f51b5" : "inherit"}}>
                                    <KeyboardCommandKeyIcon sx={{fontSize: 10, mt: "-2px"}}/>
                                    Ctrl
                                </Box>{" "} + {" "}
                                <Box component={"span"}>
                                    ЛКМ
                                    <MouseOutlinedIcon sx={{fontSize: 10, mt: "-2px"}}/>
                                </Box>{" "}для быстрого оценивания
                            </Typography>}

                        {lastRating !== undefined && state.clickedForRate &&
                            <Typography sx={hintSx}>
                                {`Оценка за предыдущее решение: ${lastRating} ⭐`}
                            </Typography>}

                        {lecturerName && isRated && (
                            <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
                                {props.forMentor && state.clickedForRate ? (
                                    <>
                                        <Avatar sx={{width: 36, height: 36, backgroundColor: "#e8ebfa", color: "#3f51b5"}}>
                                            <EditOutlinedIcon fontSize={"small"}/>
                                        </Avatar>
                                        <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                                            Оценка будет перевыставлена
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Avatar
                                            {...AvatarUtils.stringAvatar(lecturer!)}
                                            sx={{width: 36, height: 36, fontSize: "0.8125rem"}}
                                        />
                                        <Box sx={{minWidth: 0}}>
                                            <Typography variant={"body2"} sx={{fontWeight: 500}}>
                                                {lecturerName}
                                                {lecturer!.companyName &&
                                                    <Box component={"span"} sx={{color: "#3f51b5", fontWeight: 400}}>
                                                        {` · ${lecturer!.companyName}`}
                                                    </Box>}
                                            </Typography>
                                            {ratingTime &&
                                                <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                                    {ratingTime}
                                                </Typography>}
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        )}

                        {state.clickedForRate && props.forMentor
                            ? (
                                <Box sx={{"& > div[data-color-mode]": {mt: "0 !important", mb: "0 !important"}}}>
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
                                </Box>
                            )
                            : isRated && lecturerComment && (
                            // Комментарий преподавателя — часть панели оценки, поэтому без своей подложки
                            <MarkdownPreview value={lecturerComment}/>
                        )
                        }
                    </Stack>
                </Box>
                {props.forMentor && state.clickedForRate &&
                    <>
                        <Divider/>
                        <Stack
                            direction={"row"}
                            alignItems={"center"}
                            spacing={1}
                            flexWrap={"wrap"}
                            sx={{...actionsBarSx, rowGap: 1}}
                        >
                            <LoadingButton
                                variant="contained"
                                color="primary"
                                disableElevation
                                endIcon={<span style={{width: rateInProgress ? 17 : 0}}/>}
                                loading={rateInProgress}
                                loadingPosition="end"
                                disabled={isRateButtonDisabled || rateInProgress}
                                sx={actionButtonSx}
                                onClick={() => {
                                    rateSolution(points, lecturerComment);
                                }}
                            >
                                {isRated ? "Изменить оценку" : "Оценить решение"}
                            </LoadingButton>

                            {!rateInProgress && (
                                <Button
                                    variant="text"
                                    sx={actionButtonSx}
                                    onClick={() => {
                                        const storedCriteria = parseStoredCriteria(props.solution?.lecturerComment);
                                        setState(prevState => ({
                                            ...prevState,
                                            points: props.solution?.rating || 0,
                                            lecturerComment: storedCriteria.commentWithoutCriteria,
                                            addBonusPoints: hasCriteria,
                                            clickedForRate: false,
                                        }));
                                    }}
                                >
                                    Отмена
                                </Button>
                            )}

                            {isRateButtonDisabled &&
                                <Typography variant={"caption"} sx={{color: "warning.dark"}}>
                                    Заполните все критерии, чтобы выставить оценку
                                </Typography>}
                        </Stack>
                    </>
                }
                {props.forMentor && isRated && !state.clickedForRate &&
                    <>
                        <Divider/>
                        <Box sx={actionsBarSx}>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<EditOutlinedIcon/>}
                                sx={actionButtonSx}
                                onClick={() => setState(prev => ({...prev, clickedForRate: true}))}
                            >
                                Изменить оценку
                            </Button>
                        </Box>
                    </>}
            </Paper>
        )
    }

    return <Stack direction={"column"} spacing={2}>
        {solution && commitsActuality && !commitsActuality.isActual &&
            <Alert severity="error" sx={alertSx}>
                {`${commitsActuality.comment ?? ""}. `}
                {commitsActuality.additionalData &&
                    <a href={clearUrl(props.solution!.githubUrl!) + `/commits/${commitsActuality.additionalData}`}
                       target="_blank"
                       rel="noopener noreferrer"
                    >
                        Последний коммит решения
                    </a>}
            </Alert>}

        {solution &&
            <Paper variant={"outlined"} sx={panelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                    <AssignmentTurnedInOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Решение</Typography>
                    <Box sx={{flexGrow: 1}}/>
                    <Typography variant={"caption"} sx={{flexShrink: 0}}>
                        {postedSolutionTime}{solution.isModified ? " · отредактировано" : ""}
                    </Typography>
                </Stack>
                <Divider/>
                <Box sx={sectionSx}>
                    <Stack spacing={1.5}>
                        <Stack direction={"row"} alignItems={"flex-start"} spacing={1.5}>
                            <Stack direction={"row"} spacing={0.5} sx={{flexShrink: 0}}>
                                {students && students.map(t =>
                                    <Tooltip key={t.userId} title={t.surname + " " + t.name}>
                                        <span><UserAvatar user={t}/></span>
                                    </Tooltip>)}
                            </Stack>
                            {/* Имена — первой строкой, ссылка на решение и статус тестов — под ними */}
                            <Box sx={{flexGrow: 1, minWidth: 0}}>
                                <Typography variant={"body2"} sx={{fontWeight: 500}}>
                                    {students.map(t => `${t.surname} ${t.name}`).join(", ")}
                                </Typography>
                                {(githubUrl || checkTestsActuality) &&
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                        spacing={1}
                                        flexWrap={"wrap"}
                                        sx={{mt: 0.5, rowGap: 0.5}}
                                    >
                                        {githubUrl &&
                                            <Chip
                                                component={"a"}
                                                href={(githubUrl.startsWith("https://") ? "" : "https://") + githubUrl}
                                                target={"_blank"}
                                                rel={"noopener noreferrer"}
                                                clickable
                                                size={"small"}
                                                icon={<GitHubIcon/>}
                                                label={"Ссылка на решение"}
                                                sx={linkChipSx}
                                            />}
                                        {checkTestsActuality && (solutionActuality
                                            ? renderTestsStatus(solutionActuality.testsActuality)
                                            : <CircularProgress size={12}/>)}
                                    </Stack>}
                            </Box>
                            {/* Правый угол карточки: характеристика студента и переключатель текста решения —
                                подальше от ссылки на решение, чтобы не нажать по ошибке */}
                            <Stack
                                direction={"row"}
                                alignItems={"flex-start"}
                                spacing={0.5}
                                sx={{flexShrink: 0, maxWidth: {xs: 180, sm: 320, md: 440}}}
                            >
                                {props.forMentor && props.isLastSolution && student &&
                                    <StudentCharacteristics
                                        characteristics={student.characteristics}
                                        onChange={x => props.onRateSolutionClick?.()} //TODO
                                        courseId={props.courseId}
                                        studentId={student.userId!}/>}
                                {solution.comment &&
                                    <Tooltip
                                        arrow
                                        title={showOriginalCommentText
                                            ? "Показать отформатированный текст решения"
                                            : "Показать оригинальный текст решения"}
                                    >
                                        <IconButton
                                            size={"small"}
                                            sx={{flexShrink: 0, color: "text.secondary"}}
                                            onClick={() => setShowOriginalCommentText(!showOriginalCommentText)}
                                        >
                                            {showOriginalCommentText
                                                ? <BlurOffIcon sx={{fontSize: 16}}/>
                                                : <BlurOnIcon sx={{fontSize: 16}}/>}
                                        </IconButton>
                                    </Tooltip>}
                            </Stack>
                        </Stack>

                        {/* Комментарий — часть панели решения, поэтому без своей подложки */}
                        {solution.comment && (showOriginalCommentText
                            ? <Typography variant={"body2"} sx={{whiteSpace: "break-spaces"}}>
                                {solution.comment}
                            </Typography>
                            : <MarkdownPreview value={solution.comment}/>)}

                        {filesInfo.length > 0 &&
                            <Box>
                                {props.isProcessing &&
                                    <Stack direction={"row"} alignItems={"center"} spacing={0.75}
                                           sx={{color: "#3f51b5"}}>
                                        <CircularProgress size={"14px"} color={"inherit"}/>
                                        <Typography variant={"caption"} sx={{fontWeight: 500}}>
                                            Обрабатываем файлы...
                                        </Typography>
                                    </Stack>}
                                <FilesPreviewList
                                    showOkStatus={!props.forMentor}
                                    filesInfo={filesInfo}
                                    onClickFileInfo={async (fileInfo: IFileInfo) => {
                                        const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.id!)
                                        window.open(url, '_blank');
                                    }}
                                />
                            </Box>}
                    </Stack>
                </Box>
            </Paper>}

        {/* Дедлайн и место среди решений — две «врезки» одной полосы: два отдельных алерта
            занимали много места и спорили за внимание с оценкой */}
        {(sentAfterDeadline || checkAchievement) &&
            <Paper variant={"outlined"} sx={insightPanelSx}>
                <Stack direction={{xs: "column", sm: "row"}} alignItems={"stretch"}>
                    {sentAfterDeadline &&
                        <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={insightCellSx}>
                            <Box sx={insightBadgeSx("#fff4e5", "#a35b00")}>
                                <AccessTimeRoundedIcon sx={{fontSize: 19}}/>
                            </Box>
                            <Box sx={{minWidth: 0}}>
                                <Typography variant={"body2"} sx={{fontWeight: 500}}>
                                    Сдано позже дедлайна
                                </Typography>
                                <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                    {`на ${sentAfterDeadline}`}
                                </Typography>
                            </Box>
                        </Stack>}
                    {checkAchievement &&
                        <Stack
                            direction={"row"}
                            alignItems={"center"}
                            spacing={1.5}
                            sx={{
                                ...insightCellSx,
                                ...(sentAfterDeadline && {
                                    borderTop: {xs: "1px solid #e3e6ee", sm: "none"},
                                    borderLeft: {xs: "none", sm: "1px solid #e3e6ee"},
                                }),
                            }}
                        >
                            <Box
                                sx={insightBadgeSx(
                                    achievement !== undefined && achievement >= 80 ? "#e8f3ea" : "#e8ebfa",
                                    achievement !== undefined && achievement >= 80 ? "#2e7d32" : "#3f51b5",
                                )}
                            >
                                {achievement !== undefined
                                    ? <EmojiEventsOutlinedIcon sx={{fontSize: 19}}/>
                                    : <CircularProgress size={16} color={"inherit"}/>}
                            </Box>
                            <Box sx={{flexGrow: 1, minWidth: 0}}>
                                {achievement !== undefined
                                    ? <>
                                        <Stack
                                            direction={"row"}
                                            alignItems={"baseline"}
                                            justifyContent={"space-between"}
                                            spacing={1}
                                        >
                                            <Typography variant={"body2"} sx={{fontWeight: 500}}>
                                                Лучше других решений
                                            </Typography>
                                            <Typography
                                                variant={"body2"}
                                                sx={{
                                                    flexShrink: 0,
                                                    fontWeight: 600,
                                                    fontVariantNumeric: "tabular-nums",
                                                    color: achievement >= 80 ? "#2e7d32" : "#3f51b5",
                                                }}
                                            >
                                                {`${achievement}%`}
                                            </Typography>
                                        </Stack>
                                        {/* Полоса показывает место решения среди остальных по этой задаче */}
                                        <LinearProgress
                                            variant={"determinate"}
                                            value={Math.min(100, Math.max(0, achievement))}
                                            sx={{
                                                mt: 0.75,
                                                height: 6,
                                                borderRadius: "3px",
                                                backgroundColor: "#eceff3",
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: "3px",
                                                    backgroundColor: achievement >= 80 ? "#2e9e5b" : "#3f51b5",
                                                },
                                            }}
                                        />
                                    </>
                                    : <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                                        Смотрим на решения...
                                    </Typography>}
                            </Box>
                        </Stack>}
                </Stack>
            </Paper>}

        {/* Решения нет, но характеристику студенту преподаватель поставить всё равно может */}
        {!solution && props.forMentor && props.isLastSolution && student &&
            <StudentCharacteristics
                characteristics={student.characteristics}
                onChange={x => props.onRateSolutionClick?.()} //TODO
                courseId={props.courseId}
                studentId={student.userId!}/>}

        {(props.forMentor || isRated) && renderRatingPanel()}
    </Stack>
}

export default TaskSolutionComponent
