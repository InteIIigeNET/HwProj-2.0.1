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
import {Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskCriteria from "./TaskCriteria";
import {BonusTag} from "@/components/Common/HomeworkTags";


interface IEditTaskMetadataState {
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    publicationDate: Date | undefined;
    isPublished: boolean;
    hasErrors: boolean
}

type TaskEditData = HomeworkTaskViewModel & {
    isModified?: boolean;
    hasErrors?: boolean;
    suggestedMaxRating?: number;
};

const CourseTaskEditor: FC<{
    speculativeTask: TaskEditData,
    speculativeHomework: HomeworkViewModel,
    onUpdate: (update: { task: TaskEditData, isDeleted?: boolean, isSaved?: boolean }) => void,
    getAllHomeworks: () => HomeworkViewModel[],
    toEditHomework: () => void,
}> = (props) => {
    const [taskData, setTaskData] = useState<{
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isLoaded: boolean
    }>({
        task: props.speculativeTask,
        homework: props.speculativeHomework,
        isLoaded: props.speculativeTask.id! < 0 || props.speculativeTask.isModified === true
    })

    const [criteria, setCriteria] = useState<CriterionViewModel[]>(taskData.task.criteria || [])
    const [isCriteriaOpen, setIsCriteriaOpen] = useState(false)

    const addDefaultCriterion = () => {
        setCriteria(prev => [
            ...prev,
            {id: 0, type: 0, name: `Критерий №${prev.length + 1}`, maxPoints: 1}
        ]);
        setIsCriteriaOpen(true);
    };

    const updateCriterion = (index: number, patch: Partial<CriterionViewModel>) =>
        setCriteria(prev =>
            prev.map((c, i) => (i === index ? {...c, ...patch} : c))
        )

    const removeCriterion = (index: number) =>
        setCriteria(prev => prev.filter((_, i) => i !== index))

    const criteriaTotalPoints = useMemo(
        () =>
            (criteria).reduce(
                (sum, c) => sum + (c.maxPoints || 0),
                0
            ),
        [criteria]
    )

    const autoMaxFromCriteria = criteria.length > 0;

    useEffect(() => {
        if (autoMaxFromCriteria) setMaxRating(criteriaTotalPoints);
    }, [criteriaTotalPoints, autoMaxFromCriteria]);

    const isNewTask = taskData.task.id! < 0

    const [metadata, setMetadata] = useState<IEditTaskMetadataState | undefined>(
        isNewTask || taskData.isLoaded ? {
            publicationDate: taskData.task.publicationDate,
            hasDeadline: taskData.task.hasDeadline,
            deadlineDate: taskData.task.deadlineDate,
            isDeadlineStrict: taskData.task.isDeadlineStrict,
            isPublished: taskData.task.isDeferred || !taskData.homework.isDeferred,
            hasErrors: false,
        } : undefined)

    useEffect(() => {
        if (isNewTask || taskData.isLoaded) return
        ApiSingleton.tasksApi
            .tasksGetForEditingTask(task.id!)
            .then(r => {
                const task = r.task!
                setTaskData({
                    homework: r.homework!,
                    task: r.task!,
                    isLoaded: true,
                })
                setCriteria(task.criteria || [])
                setMetadata({
                    hasDeadline: task.hasDeadline!,
                    deadlineDate: task.deadlineDateNotSet
                        ? undefined
                        : new Date(task.deadlineDate!),
                    isDeadlineStrict: task.isDeadlineStrict!,
                    publicationDate: task.publicationDateNotSet
                        ? undefined
                        : new Date(task.publicationDate!),
                    isPublished: !task.isDeferred,
                    hasErrors: false,
                })
            })
    }, [])

    const {task, homework, isLoaded} = taskData
    const {id} = task

    //TODO: suggested max rating
    const [title, setTitle] = useState<string>(task.title!)
    const [maxRating, setMaxRating] = useState<number>(
        criteria.length > 0 ? criteriaTotalPoints : task.maxRating!
    )
    const [description, setDescription] = useState<string>(task.description || "")
    const [isBonusExplicit, setIsBonusExplicit] = useState<boolean>(props.speculativeTask.tags!.includes(BonusTag) && !props.speculativeHomework.tags!.includes(BonusTag))

    const [hasErrors, setHasErrors] = useState<boolean>(props.speculativeTask.hasErrors || false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false);
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const publicationDate = metadata?.publicationDate || homework.publicationDate

    useEffect(() => {
        const update = {
            ...props.speculativeTask,
            ...metadata!,
            title: title!,
            description: description,
            deadlineDateNotSet: metadata?.hasDeadline === true && !metadata.deadlineDate,
            maxRating: maxRating,
            isBonusExplicit: isBonusExplicit,
            tags: isBonusExplicit ? [...homework.tags!, BonusTag] : homework.tags!,
            hasErrors: hasErrors,
            criteria: criteria,
        }
        props.onUpdate({task: update});
    }, [title, description, maxRating, metadata, isBonusExplicit, hasErrors, criteria]);

    useEffect(() => {
        setHasErrors(!title || maxRating <= 0 || metadata?.hasErrors === true)
    }, [title, maxRating, metadata?.hasErrors])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)

        const update = {
            ...metadata!,
            title: title!,
            description: description,
            isBonusExplicit: isBonusExplicit,
            maxRating: maxRating,
            actionOptions: editOptions,
            criteria: criteria,
        };

        const updatedTask = isNewTask
            ? await ApiSingleton.tasksApi.tasksAddTask(homework.id!, update)
            : await ApiSingleton.tasksApi.tasksUpdateTask(+id!, update)

        if (isNewTask)
            props.onUpdate({
                task: props.speculativeTask,
                isDeleted: true,
            })
        props.onUpdate({task: updatedTask.value!, isSaved: true})
    }

    const deleteTask = async () => {
        if (!isNewTask) await ApiSingleton.tasksApi.tasksDeleteTask(id!)
        props.onUpdate({task, isDeleted: true})
    }

    const isDisabled = hasErrors || !isLoaded
    const isNewHomework = taskData.task.homeworkId! < 0

    const homeworkPublicationDateIsSet = !homework.publicationDateNotSet

    const maxRatingLabel =
        criteria.length > 0 ? "Критерии" : props.speculativeTask.suggestedMaxRating === maxRating ? "Вычислено" : undefined

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"flex-start"} alignContent={"start"}>
                <Grid item xs={8}>
                    <Stack direction={"row"} spacing={1} alignItems={"flex-end"}>
                        <TextField
                            required
                            fullWidth
                            error={!title}
                            label="Название задачи"
                            variant="standard"
                            margin="normal"
                            value={title}
                            onChange={(e) => {
                                e.persist()
                                setTitle(e.target.value)
                            }}
                        />
                        {!homework.tags!.includes(BonusTag) && <FormControlLabel
                            style={{height: 32}}
                            label="Бонусное"
                            control={
                                <Checkbox
                                    disableRipple
                                    size={"small"}
                                    color="primary"
                                    checked={isBonusExplicit}
                                    onChange={(e) => {
                                        setIsBonusExplicit(prevState => !prevState)
                                    }}
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
                        InputProps={{readOnly: autoMaxFromCriteria}}
                        onChange={(e) => {
                            if (!autoMaxFromCriteria) {
                                e.persist();
                                setMaxRating(+e.target.value);
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
                        value={description}
                        onChange={(value) => {
                            setDescription(value)
                        }}
                    />
                </Grid>
                {metadata && homeworkPublicationDateIsSet &&
                    <Grid item xs={12} style={{marginBottom: "15px"}}>
                        <TaskPublicationAndDeadlineDates
                            homework={homework}
                            hasDeadline={metadata.hasDeadline}
                            isDeadlineStrict={metadata.isDeadlineStrict}
                            publicationDate={metadata.publicationDate}
                            deadlineDate={metadata.deadlineDate}
                            disabledPublicationDate={metadata.isPublished}
                            onChange={(state) => {
                                setMetadata({
                                    hasDeadline: state.hasDeadline,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    publicationDate: state.publicationDate,
                                    deadlineDate: state.deadlineDate,
                                    isPublished: metadata.isPublished,
                                    hasErrors: state.hasErrors
                                })
                            }}
                        />
                    </Grid>
                }
                {metadata && !homeworkPublicationDateIsSet &&
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
                dialogContentText={`Вы точно хотите удалить задачу '${title || ""}'?`}
                confirmationWord={''}
                confirmationText={''}
            />
        </CardContent>
    )
}

const CourseTaskExperimental: FC<{
    task: TaskEditData,
    homework: HomeworkViewModel,
    isMentor: boolean,
    initialEditMode: boolean,
    onMount: () => void,
    onUpdate: (x: { task: TaskEditData, isDeleted?: boolean }) => void
    toEditHomework: () => void,
    getAllHomeworks: () => HomeworkViewModel[],
}> = (props) => {
    const {task, homework} = props
    const [showEditMode, setShowEditMode] = useState(false)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setEditMode(props.initialEditMode)
        props.onMount()
    }, [task.id])

    if (editMode) {
        return <CourseTaskEditor
            key={task.id}
            speculativeTask={task}
            speculativeHomework={homework}
            onUpdate={update => {
                const updateFix = {
                    ...update,
                    task: {
                        ...update.task,
                        isModified: !update.isSaved,
                    }
                }
                props.onUpdate(updateFix)
                if (update.isSaved) setEditMode(false)
            }}
            getAllHomeworks={props.getAllHomeworks}
            toEditHomework={props.toEditHomework}
        />
    }

    return (
        <CardContent
            onMouseEnter={() => setShowEditMode(props.isMentor)}
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
                                setEditMode(true);
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