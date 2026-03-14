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
    Checkbox,
    FormControlLabel
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useCallback, useState} from "react"
import {ActionOptions, CriterionViewModel, HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {LoadingButton} from "@mui/lab";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import DeletionConfirmation from "../DeletionConfirmation";
import ActionOptionsUI from "../Common/ActionOptions";
import {useDraftTask, useTaskEditorState} from "@/store/storeHooks/taskEditorHooks";
import {useCourseActions} from "@/store/courseActions";
import {useIsCourseMentor} from "@/store/storeHooks/courseHooks";
import {Stack} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import TaskCriteria from "./TaskCriteria";
import TaskCriteriaEditor from "./TaskCriteriaEditor";
import {BonusTag} from "@/components/Common/HomeworkTags";

type TaskEditData = HomeworkTaskViewModel & {
    hasErrors?: boolean;
    suggestedMaxRating?: number;
};

const CourseTaskEditor: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    onDone?: () => void,
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
    } = useTaskEditorState(task, homework)

    const patchTask = useCallback((patch: Partial<TaskEditData>) => {
        patchTaskDraft({
            ...task,
            ...patch,
        } as TaskEditData)
    }, [patchTaskDraft, task])

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

    const handleTitleChange = (title: string) => {
        patchTask({title})
    }

    const handleToggleBonus = () => {
        patchTask({
            tags: isBonusExplicit
                ? (task.tags || []).filter(t => t !== BonusTag)
                : [...(homework.tags || []), BonusTag]
        })
    }

    const handleMaxRatingChange = (value: string) => {
        if (autoMaxFromCriteria) return

        const raw = +value || 0
        const clamped = raw < 1 ? 1 : raw > 100 ? 100 : Math.round(raw)
        const ratingErrors = clamped < 1 || clamped > 100

        patchTask({
            maxRating: clamped,
            hasErrors: ratingErrors || !!(task as TaskEditData).hasErrors,
        })
    }

    const handleDescriptionChange = (description: string) => {
        patchTask({description})
    }

    const handleDatesChange = (state: {
        hasDeadline?: boolean;
        isDeadlineStrict?: boolean;
        publicationDate?: Date;
        deadlineDate?: Date;
        hasErrors: boolean;
    }) => {
        patchTaskDraft({
            ...task,
            hasDeadline: state.hasDeadline,
            isDeadlineStrict: state.isDeadlineStrict,
            publicationDate: state.publicationDate?.toISOString(),
            deadlineDate: state.deadlineDate?.toISOString(),
            deadlineDateNotSet: state.hasDeadline && !state.deadlineDate,
            hasErrors: state.hasErrors,
        } as unknown as HomeworkTaskViewModel)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            await saveTask(task.id!, homework.id!, editOptions)
            props.onDone?.()
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const handleDeleteTask = async () => {
        await deleteTaskAction(task.id!, homework.id!)
    }

    const handleCancel = () => {
        cancelTaskEdit(task.id!, homework.id!)
        props.onDone?.()
    }

    const isDisabled = hasErrors

    return (
        <CardContent style={{position: 'relative'}}>
            <IconButton
                onClick={handleCancel}
                disabled={handleSubmitLoading}
                size="small"
                color="error"
                style={{position: 'absolute', top: -16, right: -16, zIndex: 1, backgroundColor: 'white', boxShadow: '0 0 4px rgba(0,0,0,0.2)'}}
            >
                <UndoIcon fontSize="small"/>
            </IconButton>
            <Grid item container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
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
                            onChange={(e) => handleTitleChange(e.target.value)}
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
                                    onChange={handleToggleBonus}
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
                        onChange={(e) => handleMaxRatingChange(e.target.value)}
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
                        onChange={handleDescriptionChange}
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
                            disabledPublicationDate={isPublicationDateDisabled}
                            onChange={handleDatesChange}
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
                <TaskCriteriaEditor
                    criteria={criteria}
                    isOpen={isCriteriaOpen}
                    onToggleOpen={() => setIsCriteriaOpen(prev => !prev)}
                    onAddCriterion={addDefaultCriterion}
                    onUpdateCriterion={updateCriterion}
                    onRemoveCriterion={removeCriterion}
                />
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
                onSubmit={handleDeleteTask}
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
    const draftTask = useDraftTask(props.task.id!, props.task.homeworkId!);
    const {startTaskEdit} = useCourseActions();

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

    const handleOpenEditor = () => {
        if (task.id! < 0) return
        startTaskEdit(task.id!)
            .catch(() => {})
    }

    return (
        <CardContent
            onMouseEnter={() => setShowEditMode(isCourseMentor)}
            onMouseLeave={() => setShowEditMode(false)}
        >
            <Grid item xs={12} container direction={"row"} alignItems={"center"} alignContent={"center"}
                  justifyContent={"space-between"}>
                <Grid item container spacing={1} xs={11} alignItems={"center"}>
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
                                handleOpenEditor();
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