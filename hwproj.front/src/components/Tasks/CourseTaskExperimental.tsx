import {
    Alert,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    TextField,
    Typography,
    Button,
    Box,
    Link,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useEffect, useState, useMemo} from "react"
import {ActionOptions, CriterionViewModel, HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {LoadingButton} from "@mui/lab";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import DeletionConfirmation from "../DeletionConfirmation";
import ActionOptionsUI from "../Common/ActionOptions";
import {useDraftTask, useTaskEditing} from "@/store/taskEditorHooks";
import {useIsCourseMentor} from "@/store/courseHooks";
import {Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskCriteria from "./TaskCriteria";
import {BonusTag} from "@/components/Common/HomeworkTags";

type TaskEditData = HomeworkTaskViewModel & {
    isModified?: boolean;
    hasErrors?: boolean;
    suggestedMaxRating?: number;
};

const CourseTaskEditor: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    onDone?: () => void,
    toEditHomework: () => void,
}> = (props) => {
    const draft = useDraftTask(props.task.id!, props.task.homeworkId!)
    const {
        startEditingTask,
        updateDraftTask,
        addCriterion,
        updateCriterion: updateCriterionInStore,
        removeCriterion: removeCriterionInStore,
        submitTaskEdit,
        deleteTaskEdit,
        cancelTaskEdit,
    } = useTaskEditing()

    const [isCriteriaOpen, setIsCriteriaOpen] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    useEffect(() => {
        if (draft || props.task.id! < 0) return
        ApiSingleton.tasksApi
            .tasksGetForEditingTask(props.task.id!)
            .then(r => startEditingTask(r.task!, r.homework!))
            .catch(() => {})
    }, [props.task.id, draft, startEditingTask])

    const task = draft ?? props.task
    const homework = props.homework
    const {id} = task
    const isNewTask = task.id! < 0
    const criteria = task.criteria || []
    const criteriaTotalPoints = useMemo(
        () => criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0),
        [criteria]
    )
    const autoMaxFromCriteria = criteria.length > 0
    const maxRating = autoMaxFromCriteria ? criteriaTotalPoints : (task.maxRating ?? 0)
    const isBonusExplicit = (task.tags || []).includes(BonusTag) && !(homework.tags || []).includes(BonusTag)
    const publicationDate = task.publicationDate ?? homework.publicationDate
    const taskHasErrors = !!(task as TaskEditData).hasErrors
    const hasErrors = !task.title || maxRating <= 0 || taskHasErrors || !!(task as HomeworkTaskViewModel & { hasErrors?: boolean }).hasErrors

    const addDefaultCriterion = () => {
        addCriterion(task, { id: 0, type: 0, name: `Критерий №${criteria.length + 1}`, maxPoints: 1 })
        setIsCriteriaOpen(true)
    }

    const updateCriterion = (index: number, patch: Partial<CriterionViewModel>) => {
        updateCriterionInStore(task, index, patch)
    }

    const removeCriterion = (index: number) => {
        removeCriterionInStore(task, index)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            const update = {
                title: task.title!,
                description: task.description || '',
                isBonusExplicit,
                maxRating,
                actionOptions: editOptions,
                criteria,
                hasDeadline: task.hasDeadline,
                isDeadlineStrict: task.isDeadlineStrict,
                publicationDate: task.publicationDate,
                deadlineDate: task.deadlineDate,
            }
            await submitTaskEdit(task, homework, isNewTask, update)
            props.onDone?.()
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const deleteTask = async () => {
        await deleteTaskEdit(task, homework, isNewTask)
    }

    const handleCancel = () => {
        cancelTaskEdit(task, homework, isNewTask)
        props.onDone?.()
    }

    const isDisabled = hasErrors
    const isNewHomework = task.homeworkId! < 0
    const homeworkPublicationDateIsSet = !homework.publicationDateNotSet
    const taskPublicationDate = task.publicationDateNotSet ? undefined : (task.publicationDate ? new Date(task.publicationDate) : undefined)
    const taskDeadlineDate = task.deadlineDateNotSet ? undefined : (task.deadlineDate ? new Date(task.deadlineDate) : undefined)
    const isPublished = task.isDeferred || !homework.isDeferred
    const maxRatingLabel = criteria.length > 0 ? "Критерии" : (props.task as TaskEditData).suggestedMaxRating === maxRating ? "Вычислено" : undefined

    if (!draft) return null

    return (
        <CardContent style={{position: 'relative'}}>
            <IconButton
                onClick={handleCancel}
                disabled={handleSubmitLoading}
                size="small"
                color="error"
                style={{position: 'absolute', top: -16, right: -16, zIndex: 1, backgroundColor: 'white', boxShadow: '0 0 4px rgba(0,0,0,0.2)'}}
            >
                <CloseIcon fontSize="small"/>
            </IconButton>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"flex-start"} alignContent={"start"}>
                <Grid item xs={8}>
                    <Stack direction={"row"} spacing={1} alignItems={"flex-end"}>
                        <TextField
                            required
                            fullWidth
                            error={!task.title}
                            label="Название задачи"
                            variant="standard"
                            margin="normal"
                            value={task.title || ''}
                            onChange={(e) => updateDraftTask({ ...task, title: e.target.value })}
                        />
                        {!(homework.tags || []).includes(BonusTag) && <FormControlLabel
                            style={{height: 32}}
                            label="Бонусная"
                            control={
                                <Checkbox
                                    disableRipple
                                    size={"small"}
                                    color="primary"
                                    checked={isBonusExplicit}
                                    onChange={() => updateDraftTask({
                                        ...task,
                                        tags: isBonusExplicit ? (task.tags || []).filter(t => t !== BonusTag) : [...(homework.tags || []), BonusTag]
                                    })}
                                />
                            }
                        />}
                    </Stack>
                </Grid>
                <Grid item>
                    <TextField
                        size="small"
                        required
                        fullWidth
                        error={maxRating <= 0 || maxRating > 100}
                        helperText={maxRatingLabel}
                        style={{width: "90px", marginTop: 3}}
                        label="Баллы"
                        variant="outlined"
                        margin="normal"
                        type="number"
                        value={maxRating}
                        inputProps={{min: 1, max: 100}}
                        InputProps={{readOnly: autoMaxFromCriteria}}
                        onChange={(e) => {
                            if (!autoMaxFromCriteria) {
                                const raw = +e.target.value || 0;
                                const clamped = raw < 1 ? 1 : raw > 100 ? 100 : Math.round(raw);
                                const ratingErrors = clamped < 1 || clamped > 100;
                                updateDraftTask({
                                    ...task,
                                    maxRating: clamped,
                                    hasErrors: ratingErrors || !!(task as TaskEditData).hasErrors,
                                } as TaskEditData);
                            }
                        }}
                    />
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} style={{marginBottom: "5px", marginTop: -2}}>
                    <MarkdownEditor
                        label={"Условие задачи"}
                        height={240}
                        maxHeight={400}
                        value={task.description || ''}
                        onChange={(value) => updateDraftTask({ ...task, description: value })}
                    />
                </Grid>
                {homeworkPublicationDateIsSet &&
                    <Grid item xs={12} style={{marginBottom: "15px"}}>
                        <TaskPublicationAndDeadlineDates
                            homework={homework}
                            hasDeadline={task.hasDeadline ?? false}
                            isDeadlineStrict={task.isDeadlineStrict ?? false}
                            publicationDate={taskPublicationDate}
                            deadlineDate={taskDeadlineDate}
                            disabledPublicationDate={isPublished}
                            onChange={(state) => updateDraftTask({
                                ...task,
                                hasDeadline: state.hasDeadline,
                                isDeadlineStrict: state.isDeadlineStrict,
                                publicationDate: state.publicationDate,
                                deadlineDate: state.deadlineDate,
                                deadlineDateNotSet: state.hasDeadline && !state.deadlineDate,
                                hasErrors: state.hasErrors,
                            } as unknown as HomeworkTaskViewModel)}
                        />
                    </Grid>
                }
                {!homeworkPublicationDateIsSet &&
                    <Grid item xs={12} style={{marginBottom: "15px"}}>
                        <Alert
                            severity="info"
                            icon={false}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={props.toEditHomework}
                                >
                                    К заданию
                                </Button>
                            }
                        >
                            Для изменения дат укажите дату публикации домашнего задания
                        </Alert>
                    </Grid>
                }
                <Grid item xs={12} sx={{mt: 1, mb: 2}}>
                    {criteria.length === 0 && (
                        <Grid container direction={"row"} alignItems="baseline">
                            <Grid item>
                                <Typography variant="body2" color="text.secondary">
                                    Критерии оценивания не указаны.&nbsp;
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Link style={{cursor: "pointer"}} variant="body2" color="primary"
                                      onClick={addDefaultCriterion}>
                                    Добавить критерий оценивания
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                    {criteria.length > 0 && (
                        <>
                            <Box sx={{mb: 1}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsCriteriaOpen(prev => !prev)}
                                    >
                                        {isCriteriaOpen ? (
                                            <ExpandLessIcon fontSize="small"/>
                                        ) : (
                                            <ExpandMoreIcon fontSize="small"/>
                                        )}
                                    </IconButton>

                                    <Chip size={"small"} label={criteria.length} color={"default"}/>

                                    <Typography variant="subtitle1">
                                        Критерии оценивания
                                    </Typography>
                                </Stack>
                            </Box>

                            <Collapse in={isCriteriaOpen} timeout="auto" unmountOnExit>
                                <Stack spacing={0.5}>
                                    {criteria.map((c, index) => (
                                        <Grid
                                            key={index}
                                            container
                                            spacing={1}
                                            alignItems="center"
                                            sx={{py: 0.5}}
                                        >
                                            <Grid item xs>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant={"standard"}
                                                    label="Название критерия"
                                                    value={c.name}
                                                    inputProps={{maxLength: 50}}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const limited = raw.slice(0, 50);
                                                        updateCriterion(index, {name: limited});
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <TextField
                                                    label="Баллы"
                                                    type="number"
                                                    size="small"
                                                    sx={{width: 100}}
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
                                            </Grid>
                                            <Grid item>
                                                <IconButton
                                                    onClick={() => removeCriterion(index)}
                                                    color={"error"}
                                                    size="small"
                                                >
                                                    <CloseIcon fontSize="small"/>
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button
                                        size="small"
                                        onClick={addDefaultCriterion}
                                        sx={{
                                            textTransform: "none",
                                            fontSize: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            color: "#1976d2",
                                            paddingLeft: "0px",
                                            paddingRight: "0px",
                                            minWidth: "auto",
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                                textDecoration: "none"
                                            }
                                        }}
                                    >
                                        + Добавить критерий оценивания
                                    </Button>
                                </Stack>
                            </Collapse>
                        </>
                    )}
                </Grid>
            </Grid>
            <CardActions>
                {!isNewHomework && publicationDate && new Date() >= new Date(publicationDate) && <ActionOptionsUI
                    disabled={isDisabled || handleSubmitLoading}
                    onChange={value => setEditOptions(value)}/>}
                {!isNewHomework && <LoadingButton
                    fullWidth
                    onClick={handleSubmit}
                    color="primary"
                    variant="text"
                    type="submit"
                    disabled={isDisabled}
                    loadingPosition="end"
                    size={"large"}
                    endIcon={<span style={{width: 17}}/>}
                    loading={handleSubmitLoading}
                >
                    {isNewTask && "Добавить задачу"}
                    {!isNewTask && "Редактировать задачу " + (editOptions.sendNotification ? "с уведомлением" : "без уведомления")}
                </LoadingButton>}
                <IconButton aria-label="delete" color="error" onClick={() => setShowDeleteConfirmation(true)}>
                    <DeleteIcon/>
                </IconButton>
            </CardActions>
            <DeletionConfirmation
                onCancel={() => setShowDeleteConfirmation(false)}
                onSubmit={deleteTask}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задачи'}
                dialogContentText={`Вы точно хотите удалить задачу '${task.title || ""}'?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </CardContent>
    )
}

const CourseTaskExperimental: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    toEditHomework: () => void,
}> = (props) => {
    const isCourseMentor = useIsCourseMentor();
    const draft = useDraftTask(props.task.id!, props.task.homeworkId!);
    const {loadTaskForEditing, startEditingTask} = useTaskEditing();

    const {task, homework} = props
    const [showEditMode, setShowEditMode] = useState(false)

    if (draft) {
        return <CourseTaskEditor
            key={task.id}
            task={task}
            homework={homework}
            toEditHomework={props.toEditHomework}
        />
    }

    const openEditor = () => {
        if (task.id! < 0) return
        loadTaskForEditing(task.id!)
            .then(r => startEditingTask(r.task!, r.homework!))
            .catch(() => {})
    }

    return (
        <CardContent
            onMouseEnter={() => setShowEditMode(isCourseMentor)}
            onMouseLeave={() => setShowEditMode(false)}
        >
            <Grid xs={12} container direction={"row"} alignItems={"center"} alignContent={"center"}
                  justifyContent={"space-between"}>
                <Grid container spacing={1} xs={11} alignItems={"center"}>
                    <Grid item style={{marginRight: 1}}>
                        <Typography variant="h6" component="div">
                            {task.title}
                        </Typography>
                    </Grid>
                    {task.isGroupWork && (
                        <Grid item>
                            <Chip color={"info"} label="Командное"/>
                        </Grid>
                    )}
                    <Grid item>
                        <Typography>{"⭐ " + task.maxRating}</Typography>
                    </Grid>
                </Grid>
                {showEditMode && (
                    <Grid item>
                        <IconButton
                            onClick={() => {
                                setShowEditMode(false);
                                openEditor();
                            }}
                        >
                            <EditIcon color={"primary"} style={{fontSize: 17}}/>
                        </IconButton>
                    </Grid>
                )}
            </Grid>

            <Divider style={{marginTop: 15, marginBottom: 15}}/>

            <Typography component="div" style={{color: "#454545"}} gutterBottom variant="body1">
                <MarkdownPreview value={task.description!}/>
            </Typography>

            <TaskCriteria task={task}/>
        </CardContent>
    );
}
export default CourseTaskExperimental;