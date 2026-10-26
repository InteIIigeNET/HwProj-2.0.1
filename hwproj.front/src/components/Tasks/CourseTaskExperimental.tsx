import {
    Alert,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    Button,
    Box,
    Checkbox,
    FormControlLabel,
    Menu,
    MenuItem,
    Tooltip
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useCallback, useState} from "react"
import {ActionOptions, CriterionType, CriterionViewModel, HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {LoadingButton} from "@mui/lab";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import DeletionConfirmation from "../DeletionConfirmation";
import ActionOptionsUI from "../Common/ActionOptions";
import {Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AlarmRoundedIcon from "@mui/icons-material/AlarmRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import AllInclusiveRoundedIcon from "@mui/icons-material/AllInclusiveRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import TaskCriteria from "./TaskCriteria";
import {BonusTag} from "@/components/Common/HomeworkTags";
import Utils from "../../services/Utils";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";
import UndoIcon from "@mui/icons-material/Undo";
import {useDraftTask, useTaskEditorState} from "@/store/storeHooks/taskEditorHooks";
import {useCourseActions} from "@/store/courseActions";
import {useIsCourseMentor} from "@/store/storeHooks/courseHooks";


// Оформление согласовано с редизайном страницы курса: те же радиусы, границы и мягкие плашки
const editorHeaderSx = {
    px: {xs: 2, sm: 2.5},
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const detailHeaderSx = {
    px: {xs: 2, sm: 2.5},
    py: 2,
    backgroundColor: "#f7f8fd",
    borderBottom: "1px solid #e6e8f0",
}

const detailTitleSx = {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.3,
    m: 0,
}

const sectionSx = {
    px: {xs: 2, sm: 2.5},
    py: 2.5,
}

// Подпись группы полей: мелкие капсы читаются как служебный текст и не спорят с названиями
const sectionLabelSx = {
    display: "block",
    color: "text.secondary",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
}

const sectionBoxSx = {
    px: 1.5,
    py: 1.5,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

// Редактор markdown задаёт себе внешние отступы инлайном, поэтому гасим их через !important
const markdownEditorSx = {
    "& > div": {marginTop: "8px !important", marginBottom: "0 !important"},
}

const criterionCardSx = {
    px: 1.5,
    py: 1.5,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
    backgroundColor: "#fff",
}

// Критерий дедлайна — единственный со штрафом, поэтому у него тёплая рамка вместо серой
const deadlineCriterionCardSx = {
    borderColor: "#f0e0bd",
    backgroundColor: "#fffdf7",
}

const accentChipSx = {
    height: 24,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 600},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const metaChipSx = {
    height: 24,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const countChipSx = {
    height: 20,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const deadlineChipSx = {
    height: 24,
    maxWidth: "100%",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

// Цвет пилюли дедлайна — это шкала: спокойный серый, пока время есть, тёплый за три дня,
// красный в последние сутки и приглушённый, когда строгий срок уже закрыт
const deadlineTones = {
    calm: {backgroundColor: "#eef0f5", color: "text.secondary"},
    soon: {backgroundColor: "#fff4e5", color: "#a35b00"},
    urgent: {
        backgroundColor: "#fdecec",
        color: "#c62828",
        fontWeight: 600,
        boxShadow: "inset 0 0 0 1px rgba(198, 40, 40, 0.18)",
    },
    closed: {backgroundColor: "#f4eeee", color: "#96595a"},
}

const autoChipSx = {
    height: 20,
    backgroundColor: "#e8f8ee",
    color: "#159947",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 600},
}

const alertSx = {borderRadius: "12px"}

const flatButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    alignSelf: "flex-start" as const,
}

const submitButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    py: 1,
}

const dangerIconButtonSx = {
    flexShrink: 0,
    border: "1px solid #f1d4d4",
    borderRadius: "10px",
}

const footerSx = {
    px: {xs: 2, sm: 2.5},
    py: 1.5,
    borderTop: "1px solid #e6e8f0",
    backgroundColor: "#fafbfe",
}

// Действие появляется при наведении на карточку, но остаётся доступным с клавиатуры
const hoverActionSx = {
    flexShrink: 0,
    transition: "opacity .15s",
    "&:focus-visible": {opacity: 1},
}

type TaskEditData = HomeworkTaskViewModel & {
    isModified?: boolean;
    hasErrors?: boolean;
    suggestedMaxRating?: number;
};

const CriterionTypeDeadline = CriterionType.NUMBER_1;

const CourseTaskEditor: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    toEditHomework: () => void,
}> = (props) => {
    const {
        patchTaskDraft,
        addCriterion,
        updateCriterion: updateCriterionInStore,
        removeCriterion: removeCriterionInStore,
        saveTask,
        deleteTask: deleteTaskAction,
        cancelTaskEdit,
    } = useCourseActions()

    const [isCriteriaOpen, setIsCriteriaOpen] = useState(false)
    const [addCriterionAnchor, setAddCriterionAnchor] = useState<null | HTMLElement>(null)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const task = props.task
    const homework = props.homework
    const {
        criteria,
        autoMaxFromCriteria,
        maxRating,
        isBonusExplicit,
        publicationDate,
        hasErrors,
        isNewTask,
        isNewHomework,
        homeworkPublicationDateIsSet,
        taskPublicationDate,
        taskDeadlineDate,
        isPublicationDateDisabled,
        maxRatingLabel,
        maxRatingError,
    } = useTaskEditorState(task, homework)

    const patchTask = useCallback((patch: Partial<TaskEditData>) => {
        patchTaskDraft({
            ...task,
            ...patch,
        } as TaskEditData)
    }, [patchTaskDraft, task])

    const isDeadlineCriterion = (criterion: CriterionViewModel) => criterion.type === CriterionTypeDeadline;

    const addDefaultCriterion = () => {
        addCriterion(task, {id: 0, type: 0, name: `Критерий №${criteria.length + 1}`, maxPoints: 1})
        setIsCriteriaOpen(true)
        setAddCriterionAnchor(null)
    }

    const addDeadlineCriterion = () => {
        const deadline = taskDeadlineDate || (homework.deadlineDate ? new Date(homework.deadlineDate) : new Date())
        addCriterion(task, {
            id: 0,
            type: CriterionTypeDeadline,
            name: "Сдано вовремя",
            maxPoints: 1,
            arguments: deadline.toISOString(),
        })
        setIsCriteriaOpen(true)
        setAddCriterionAnchor(null)
    }

    const updateCriterion = (index: number, patch: Partial<CriterionViewModel>) => {
        updateCriterionInStore(task, index, patch)
    }

    const removeCriterion = (index: number) => {
        removeCriterionInStore(task, index)
    }

    const renderAddCriterionMenu = () => (
        <Menu
            anchorEl={addCriterionAnchor}
            open={Boolean(addCriterionAnchor)}
            onClose={() => setAddCriterionAnchor(null)}
            slotProps={{paper: {sx: {borderRadius: "12px", minWidth: 220, mt: 0.5}}}}
        >
            <MenuItem onClick={addDefaultCriterion} sx={{gap: 1.25, py: 1}}>
                <ChecklistRoundedIcon sx={{fontSize: 18, color: "text.secondary"}}/>
                <Typography variant="body2">Обычный критерий</Typography>
            </MenuItem>
            <MenuItem onClick={addDeadlineCriterion} sx={{gap: 1.25, py: 1}}>
                <ScheduleIcon sx={{fontSize: 18, color: "text.secondary"}}/>
                <Typography variant="body2">Дедлайн</Typography>
                <Box sx={{flexGrow: 1}}/>
                <Chip label="Авто" size="small" sx={autoChipSx}/>
            </MenuItem>
        </Menu>
    );

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            await saveTask(task.id!, homework.id!, editOptions)
        } catch (error) {
            const errors = await ErrorsHandler.getErrorMessages(error as Response, "errors")
            enqueueSnackbar(errors[0] || "Не удалось сохранить задачу", {
                variant: "error",
                autoHideDuration: 4000,
            })
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const deleteTask = async () => {
        await deleteTaskAction(task.id!, homework.id!)
    }

    const cancelEditing = () => {
        cancelTaskEdit(task.id!, homework.id!)
    }

    const isDisabled = hasErrors

    const getEffectiveDeadlineDate = () => {
        const hasEffectiveDeadline = task.hasDeadline ?? homework.hasDeadline
        const deadlineDate = task.deadlineDate || homework.deadlineDate
        return hasEffectiveDeadline && deadlineDate ? new Date(deadlineDate) : undefined
    }

    const isBasedOnEffectiveDeadline = (criterion: CriterionViewModel) => {
        const effectiveDeadlineDate = getEffectiveDeadlineDate()
        return !!criterion.arguments
            && !!effectiveDeadlineDate
            && new Date(criterion.arguments).getTime() === effectiveDeadlineDate.getTime()
    }

    return (
        <Box>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={editorHeaderSx}>
                <IconButton
                    onClick={cancelEditing}
                    disabled={handleSubmitLoading}
                    size={"small"}
                    color={"error"}
                    aria-label={"undo"}
                >
                    <UndoIcon fontSize={"small"}/>
                </IconButton>
                <EditOutlinedIcon fontSize={"small"}/>
                <Typography variant={"body2"} sx={{fontWeight: 500}}>
                    {isNewTask ? "Новая задача" : "Редактирование задачи"}
                </Typography>
            </Stack>
            <Divider/>
            <Box sx={sectionSx}>
                <Stack direction={"column"} spacing={2.5}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} alignItems={"flex-start"}>
                        <TextField
                            required
                            fullWidth
                            size={"small"}
                            error={!task.title}
                            label="Название задачи"
                            variant="outlined"
                            sx={inputSx}
                            value={task.title ?? ""}
                            onChange={(e) => patchTask({title: e.target.value})}
                        />
                        <TextField
                            size="small"
                            required
                            error={!!maxRatingError}
                            helperText={maxRatingError || maxRatingLabel}
                            label="Баллы"
                            variant="outlined"
                            type="number"
                            sx={{...inputSx, width: {xs: "100%", sm: 220}, flexShrink: 0}}
                            value={Number.isFinite(maxRating) ? maxRating : ""}
                            InputProps={{readOnly: autoMaxFromCriteria}}
                            inputProps={{
                                min: 0,
                                step: "any",
                                onWheel: (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur(),
                            }}
                            onChange={(e) => {
                                if (autoMaxFromCriteria) return
                                const value = +e.target.value
                                if (Number.isFinite(value) && /^-?0\d/.test(e.target.value)) {
                                    e.target.value = String(value)
                                }
                                patchTask({maxRating: value})
                            }}
                            onBlur={(e) => {
                                const value = +e.target.value
                                if (e.target.value && Number.isFinite(value)) e.target.value = String(value)
                            }}
                        />
                    </Stack>
                    {!homework.tags!.includes(BonusTag) &&
                        <FormControlLabel
                            sx={{
                                m: 0,
                                pr: 1.5,
                                py: 0.25,
                                alignSelf: "flex-start",
                                border: "1px solid #e0e3e7",
                                borderRadius: "12px",
                            }}
                            label="Бонусная задача"
                            control={
                                <Checkbox
                                    disableRipple
                                    size={"small"}
                                    color="primary"
                                    checked={isBonusExplicit}
                                    onChange={() => patchTask({
                                        tags: isBonusExplicit
                                            ? (task.tags || []).filter(t => t !== BonusTag)
                                            : [...(homework.tags || []), BonusTag],
                                    })}
                                />
                            }
                        />}
                    <Box>
                        <Typography sx={sectionLabelSx}>Условие задачи</Typography>
                        <Box sx={markdownEditorSx}>
                            <MarkdownEditor
                                label={"Условие задачи"}
                                height={240}
                                maxHeight={400}
                                value={task.description || ""}
                                onChange={(value) => patchTask({description: value})}
                            />
                        </Box>
                    </Box>
                    {homeworkPublicationDateIsSet &&
                        <Box sx={sectionBoxSx}>
                            <Typography sx={{...sectionLabelSx, mb: 0.5}}>Даты задачи</Typography>
                            <TaskPublicationAndDeadlineDates
                                homework={homework}
                                hasDeadline={task.hasDeadline}
                                isDeadlineStrict={task.isDeadlineStrict}
                                publicationDate={taskPublicationDate}
                                deadlineDate={taskDeadlineDate}
                                disabledPublicationDate={isPublicationDateDisabled}
                                onChange={(state) => {
                                    patchTaskDraft({
                                        ...task,
                                        hasDeadline: state.hasDeadline,
                                        isDeadlineStrict: state.isDeadlineStrict,
                                        publicationDate: state.publicationDate,
                                        publicationDateNotSet: !state.publicationDate && (homework.publicationDateNotSet || !homework.publicationDate),
                                        deadlineDate: state.deadlineDate,
                                        deadlineDateNotSet: state.hasDeadline && !state.deadlineDate,
                                        hasErrors: state.hasErrors,
                                    } as HomeworkTaskViewModel)
                                }}
                            />
                        </Box>
                    }
                    {!homeworkPublicationDateIsSet &&
                        <Alert
                            severity="info"
                            sx={alertSx}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={props.toEditHomework}
                                    sx={{textTransform: "none", borderRadius: "10px"}}
                                >
                                    К заданию
                                </Button>
                            }
                        >
                            Для изменения дат укажите дату публикации домашнего задания
                        </Alert>
                    }
                    <Box sx={sectionBoxSx}>
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            <ChecklistRoundedIcon sx={{fontSize: 18, color: "#3f51b5"}}/>
                            <Typography variant={"body2"} sx={{fontWeight: 500}}>
                                Критерии оценивания
                            </Typography>
                            {criteria.length > 0 &&
                                <Chip size={"small"} label={criteria.length} sx={countChipSx}/>}
                            <Box sx={{flexGrow: 1}}/>
                            {criteria.length > 0 &&
                                <Tooltip arrow title={isCriteriaOpen ? "Свернуть" : "Развернуть"}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsCriteriaOpen(prev => !prev)}
                                    >
                                        {isCriteriaOpen
                                            ? <ExpandLessIcon fontSize="small"/>
                                            : <ExpandMoreIcon fontSize="small"/>}
                                    </IconButton>
                                </Tooltip>}
                        </Stack>
                        {criteria.length === 0 &&
                            <Stack direction={"column"} spacing={0.5} sx={{mt: 1}} alignItems={"flex-start"}>
                                <Typography variant="body2" color="text.secondary">
                                    Критерии оценивания не указаны
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon/>}
                                    onClick={(e) => setAddCriterionAnchor(e.currentTarget)}
                                    sx={flatButtonSx}
                                >
                                    Добавить критерий оценивания
                                </Button>
                            </Stack>}
                        {criteria.length > 0 &&
                            <Collapse in={isCriteriaOpen} timeout="auto" unmountOnExit>
                                <Stack direction={"column"} spacing={1} sx={{mt: 1.5}}>
                                    {criteria.map((c, index) => isDeadlineCriterion(c) ? (
                                        <Box key={index} sx={{...criterionCardSx, ...deadlineCriterionCardSx}}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1.5}}>
                                                <ScheduleIcon sx={{fontSize: 18, color: "#9a5b00"}}/>
                                                <Typography variant="body2" sx={{fontWeight: 500}}>
                                                    Критерий дедлайна
                                                </Typography>
                                                <Chip label="Авто" size="small" sx={autoChipSx}/>
                                                <Tooltip
                                                    arrow
                                                    placement="right"
                                                    title={`После ${c.arguments ? Utils.renderDateWithoutSeconds(new Date(c.arguments)) : "дедлайна"} будет списан ${c.maxPoints || 1} балл`}
                                                >
                                                    <HelpOutlineIcon sx={{fontSize: 16, color: "#667085"}}/>
                                                </Tooltip>
                                                <Box sx={{flexGrow: 1}}/>
                                                <Tooltip arrow title={"Удалить критерий"}>
                                                    <IconButton
                                                        onClick={() => removeCriterion(index)}
                                                        color="error"
                                                        size="small"
                                                    >
                                                        <CloseIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            <Stack
                                                direction={{xs: "column", md: "row"}}
                                                spacing={1.5}
                                                alignItems={"flex-start"}
                                            >
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                    label="Название критерия"
                                                    sx={inputSx}
                                                    error={!c.name}
                                                    value={c.name}
                                                    inputProps={{maxLength: 50}}
                                                    onChange={(e) => updateCriterion(index, {name: e.target.value.slice(0, 50)})}
                                                />
                                                <TextField
                                                    label="Дата и время"
                                                    type="datetime-local"
                                                    size="small"
                                                    variant="outlined"
                                                    required
                                                    error={!c.arguments}
                                                    sx={{...inputSx, width: {xs: "100%", md: 220}, flexShrink: 0}}
                                                    value={c.arguments ? Utils.toISOString(new Date(c.arguments)) : ""}
                                                    onChange={(e) =>
                                                        updateCriterion(index, {
                                                            arguments: e.target.value
                                                                ? new Date(e.target.value).toISOString()
                                                                : undefined,
                                                        })
                                                    }
                                                    InputLabelProps={{shrink: true}}
                                                    helperText={isBasedOnEffectiveDeadline(c) ? "На основе дедлайна" : " "}
                                                />
                                                <TextField
                                                    label="Штраф"
                                                    type="number"
                                                    size="small"
                                                    sx={{...inputSx, width: {xs: "100%", md: 128}, flexShrink: 0}}
                                                    value={c.maxPoints ?? 1}
                                                    inputProps={{min: 1}}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">−</InputAdornment>,
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "-") e.preventDefault();
                                                    }}
                                                    onChange={(e) =>
                                                        updateCriterion(index, {
                                                            maxPoints: Math.max(+e.target.value, 1),
                                                        })
                                                    }
                                                    onBlur={(e) =>
                                                        updateCriterion(index, {
                                                            maxPoints: Math.max(+e.target.value, 1),
                                                        })
                                                    }
                                                />
                                            </Stack>
                                        </Box>
                                    ) : (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            spacing={1.5}
                                            alignItems="center"
                                            sx={criterionCardSx}
                                        >
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                label="Название критерия"
                                                sx={inputSx}
                                                error={!c.name}
                                                value={c.name}
                                                inputProps={{maxLength: 50}}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const limited = raw.slice(0, 50);
                                                    updateCriterion(index, {name: limited});
                                                }}
                                            />
                                            <TextField
                                                label="Баллы"
                                                type="number"
                                                size="small"
                                                sx={{...inputSx, width: 104, flexShrink: 0}}
                                                value={c.maxPoints}
                                                inputProps={{min: 1}}
                                                onKeyDown={(e) => {
                                                    if (e.key === "-") e.preventDefault();
                                                }}
                                                onChange={(e) =>
                                                    updateCriterion(index, {
                                                        maxPoints: Math.max(+e.target.value, 1),
                                                    })
                                                }
                                                onBlur={(e) =>
                                                    updateCriterion(index, {
                                                        maxPoints: Math.max(+e.target.value, 1),
                                                    })
                                                }
                                            />
                                            <Tooltip arrow title={"Удалить критерий"}>
                                                <IconButton
                                                    onClick={() => removeCriterion(index)}
                                                    color={"error"}
                                                    size="small"
                                                >
                                                    <CloseIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    ))}
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon/>}
                                        onClick={(e) => setAddCriterionAnchor(e.currentTarget)}
                                        sx={flatButtonSx}
                                    >
                                        Добавить критерий оценивания
                                    </Button>
                                </Stack>
                            </Collapse>}
                        {renderAddCriterionMenu()}
                    </Box>
                </Stack>
            </Box>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={footerSx}>
                {!isNewHomework && publicationDate && new Date() >= new Date(publicationDate) && <ActionOptionsUI
                    disabled={isDisabled || handleSubmitLoading}
                    onChange={value => setEditOptions(value)}/>}
                {!isNewHomework && <LoadingButton
                    fullWidth
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disableElevation
                    type="submit"
                    disabled={isDisabled}
                    loadingPosition="end"
                    size={"large"}
                    endIcon={<span style={{width: 17}}/>}
                    loading={handleSubmitLoading}
                    sx={submitButtonSx}
                >
                    {isNewTask && "Добавить задачу"}
                    {!isNewTask && "Редактировать задачу " + (editOptions.sendNotification ? "с уведомлением" : "без уведомления")}
                </LoadingButton>}
                {isNewHomework && <Box sx={{flexGrow: 1}}/>}
                <Tooltip arrow title={"Удалить задачу"}>
                    <IconButton aria-label="delete" color="error" sx={dangerIconButtonSx}
                                onClick={() => setShowDeleteConfirmation(true)}>
                        <DeleteIcon fontSize={"small"}/>
                    </IconButton>
                </Tooltip>
            </Stack>
            <DeletionConfirmation
                onCancel={() => setShowDeleteConfirmation(false)}
                onSubmit={deleteTask}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задачи'}
                dialogContentText={`Вы точно хотите удалить задачу '${task.title || ""}'?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </Box>
    )
}

const day = 24 * 60 * 60 * 1000

// Главный вопрос студента к задаче — сколько осталось времени, поэтому в шапке не только дата,
// но и остаток срока, а строгость дедлайна видна по иконке: у закрытого срока замок
const TaskDeadline: FC<{task: HomeworkTaskViewModel, isMentor: boolean}> = ({task, isMentor}) => {
    const hasDeadline = task.hasDeadline ?? false
    const isDeadlineSet = hasDeadline && !task.deadlineDateNotSet && task.deadlineDate != null

    // Незаполненный срок — забота преподавателя: студенту такая пилюля ничего не даёт
    if (hasDeadline && !isDeadlineSet) return isMentor
        ? <Tooltip arrow title={"Задача ждёт даты: без неё срок сдачи не показывается студентам"}>
            <Chip
                size={"small"}
                icon={<WarningAmberRoundedIcon/>}
                label={"Дедлайн не выставлен"}
                sx={{...deadlineChipSx, ...deadlineTones.soon}}/>
        </Tooltip>
        : null

    if (!isDeadlineSet) return (
        <Tooltip arrow title={"Решения принимаются без ограничения по сроку"}>
            <Chip
                size={"small"}
                icon={<AllInclusiveRoundedIcon/>}
                label={"Без дедлайна"}
                sx={{...deadlineChipSx, ...deadlineTones.calm}}/>
        </Tooltip>
    )

    const deadline = new Date(task.deadlineDate!)
    const isStrict = task.isDeadlineStrict ?? false
    const remaining = deadline.getTime() - Date.now()
    const isPassed = remaining <= 0
    const isSoon = !isPassed && remaining <= 3 * day
    const isUrgent = !isPassed && remaining <= day

    const tone = isPassed
        ? isStrict ? deadlineTones.closed : deadlineTones.calm
        : isUrgent ? deadlineTones.urgent
            : isSoon ? deadlineTones.soon
                : deadlineTones.calm

    const icon = isPassed
        ? isStrict ? <LockClockRoundedIcon/> : <ScheduleIcon/>
        : isSoon ? <AlarmRoundedIcon/> : <ScheduleIcon/>

    const label = isPassed
        ? `Дедлайн истёк ${Utils.pluralizeDateTime(-remaining)} назад`
        : isSoon
            ? `До ${Utils.renderReadableDate(deadline)} · ещё ${Utils.pluralizeDateTime(remaining)}`
            : `До ${Utils.renderReadableDate(deadline)}`

    const strictNote = isStrict
        ? isPassed
            ? "Срок строгий: решения больше не принимаются"
            : "Срок строгий: после дедлайна решения не принимаются"
        : "Срок нестрогий: решения принимаются и после дедлайна"

    return (
        <Tooltip
            arrow
            title={<span style={{whiteSpace: "pre-line"}}>
                {`${Utils.renderReadableDate(deadline)}\n${strictNote}`}
            </span>}
        >
            <Chip size={"small"} icon={icon} label={label} sx={{...deadlineChipSx, ...tone}}/>
        </Tooltip>
    )
}

const CourseTaskExperimental: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    toEditHomework: () => void,
    isStudentAccepted?: boolean,
    rating?: number | '?',
}> = (props) => {
    const isCourseMentor = useIsCourseMentor()
    const draftTask = useDraftTask(props.task.id!, props.task.homeworkId!)
    const {startTaskEdit} = useCourseActions()

    const {task, homework} = props
    const [showEditMode, setShowEditMode] = useState(false)

    if (draftTask) {
        return <CourseTaskEditor
            key={task.id}
            task={draftTask}
            homework={homework}
            toEditHomework={props.toEditHomework}
        />
    }

    return (
        <Box
            onMouseEnter={() => setShowEditMode(isCourseMentor)}
            onMouseLeave={() => setShowEditMode(false)}
        >
            <Box sx={detailHeaderSx}>
                <Stack direction={"row"} alignItems={"flex-start"} spacing={1}>
                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                        <Typography component={"h2"} className={"antiLongWords"} sx={detailTitleSx}>
                            {task.title}
                        </Typography>
                        <Stack direction={"row"} spacing={0.75} useFlexGap flexWrap={"wrap"} sx={{ mt: 1 }}>
                            <Tooltip arrow title={!isCourseMentor && props.isStudentAccepted ? "Ваш балл за задачу" : "Максимальный балл"}>
                                <Chip
                                    size={"small"}
                                    icon={<StarRoundedIcon />}
                                    label={!isCourseMentor && props.isStudentAccepted ? `${props.rating ?? 0} / ${task.maxRating}` : task.maxRating}
                                    sx={accentChipSx} />
                            </Tooltip>

                            <TaskDeadline task={task} isMentor={isCourseMentor} />
                            {task.isGroupWork &&
                                <Chip
                                    size={"small"}
                                    icon={<GroupIcon />}
                                    label={"Командное"}
                                    sx={metaChipSx} />}
                        </Stack>
                    </Box>
                    {isCourseMentor &&
                        <Tooltip arrow placement={"left"} title={"Редактировать задачу"}>
                            <IconButton
                                size={"small"}
                                sx={{...hoverActionSx, opacity: showEditMode ? 1 : 0}}
                                onClick={() => {
                                    setShowEditMode(false)
                                    if (task.id! < 0) return
                                    startTaskEdit(task.id!).catch(() => {})
                                }}
                            >
                                <EditIcon color={"primary"} sx={{fontSize: 18}}/>
                            </IconButton>
                        </Tooltip>}
                </Stack>
            </Box>

            <Box sx={sectionSx}>
                {task.description
                    ? <Typography component="div" style={{color: "#454545"}} variant="body1">
                        <MarkdownPreview value={task.description!}/>
                    </Typography>
                    : <Typography variant={"body2"} sx={{color: "text.disabled", fontStyle: "italic"}}>
                        Условие задачи не заполнено
                    </Typography>}

                <TaskCriteria task={task}/>
            </Box>
        </Box>
    );
}
export default CourseTaskExperimental;