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
    Box
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useEffect, useState, useMemo} from "react"
import {ActionOptions, HomeworkTaskViewModel, HomeworkViewModel,CriterionViewModel} from "@/api";
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


interface IEditTaskMetadataState {
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    publicationDate: Date | undefined;
    isPublished: boolean;
    hasErrors: boolean
}

type Criterion = CriterionViewModel;

type TaskWithCriteria = HomeworkTaskViewModel & {
    isModified?: boolean;
    hasErrors?: boolean;
    suggestedMaxRating?: number;
};

const CourseTaskEditor: FC<{
    speculativeTask: TaskWithCriteria,
    speculativeHomework: HomeworkViewModel,
    onUpdate: (update: { task: TaskWithCriteria, isDeleted?: boolean, isSaved?: boolean }) => void,
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

    const [criterias, setCriteria] = useState<Criterion[]>(props.speculativeTask.criterias ?? []);

    const [debouncedCriterias, setDebouncedCriterias] = useState<Criterion[]>(criterias);

    const [isCriteriasOpen, setIsCriteriasOpen] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => {
            setDebouncedCriterias(criterias);
        }, 150);

        return () => window.clearTimeout(id);
    }, [criterias]);

    const toNonNegativeInt = (v: any) => Math.max(0, Math.floor(Number(v) || 0));

    const addDefaultCriterion = () => {
        setCriteria(prev => [
            ...prev,
            { id: 0, type: "basic", name: `Критерий №${prev.length + 1}`, points: 0 }
        ]);
        setIsCriteriasOpen(true);
    };

    const updateCriterion = (index: number, patch: Partial<Criterion>) =>
        setCriteria(prev =>
            prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
        );

    const removeCriterion = (index: number) =>
        setCriteria(prev => prev.filter((_, i) => i !== index));

    const criteriaTotal = useMemo(
        () =>
            (criterias ?? []).reduce(
                (sum, c) =>
                    sum +
                    (typeof c.points === "number" && Number.isFinite(c.points)
                        ? c.points
                        : 0),
                0
            ),
        [criterias]
    );


    const autoMaxFromCriteria = criterias.length > 0;

    useEffect(() => {
        if (autoMaxFromCriteria) setMaxRating(criteriaTotal);
    }, [criteriaTotal, autoMaxFromCriteria]);

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
                const serverCriterias =
                    (task as any).criterias ?? (task as any).criterias ?? [];

                setCriteria(
                    (serverCriterias as any[]).map(c => ({
                        id: c.id,
                        type: c.type ?? "basic",
                        name: (c.name ?? "").slice(0, 50),
                        points: Math.max(0, Math.floor(Number(c.points) || 0)),
                    }))
                );
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

    const [title, setTitle] = useState<string>(task.title!)
    const [maxRating, setMaxRating] = useState<number>(
        criterias.length > 0
            ? criteriaTotal
            : (isNewTask ? 0 : task.maxRating!)
    )
    const [description, setDescription] = useState<string>(task.description!)
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
            hasErrors: hasErrors,
            criterias: debouncedCriterias,
        };
        props.onUpdate({ task: update });
    }, [title, description, maxRating, metadata, hasErrors, debouncedCriterias]);

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
            maxRating: maxRating,
            actionOptions: editOptions,
            criterias: criterias.map(c => ({
                id: c.id,
                type: (c as any).type ?? "basic",
                name: c.name,
                points: Math.max(0, Math.floor(Number(c.points) || 0)),
            })),
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

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"} alignContent={"start"} style={{marginTop: -20}}>
                <Grid item xs={8}>
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
                </Grid>
                <Grid item>
                    <TextField
                        size="small"
                        required
                        fullWidth
                        error={maxRating <= 0 || maxRating > 100}
                        style={{width: "90px"}}
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
                <Grid item xs={12} sx={{ mt: 1, mb: 2 }}>

                    {criterias.length === 0 && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Пока критериев оцениваний нет. Нажмите «Добавить критерий оценивания».
                            </Typography>

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
                                <span style={{ fontSize: "18px", lineHeight: "18px" }}>+</span>
                                Добавить критерий оценивания
                            </Button>
                        </>
                    )}

                    {criterias.length > 0 && (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => setIsCriteriasOpen(prev => !prev)}
                                    sx={{ mr: 1, p: 0.5 }}
                                >
                                    {isCriteriasOpen ? (
                                        <ExpandLessIcon fontSize="small" />
                                    ) : (
                                        <ExpandMoreIcon fontSize="small" />
                                    )}
                                </IconButton>

                                <Typography variant="subtitle1">
                                    Критерии оценивания:
                                </Typography>
                            </Box>

                            <Collapse in={isCriteriasOpen} timeout="auto" unmountOnExit>
                                <Stack spacing={1}>
                                    {criterias.map((c, index) => (
                                        <Grid
                                            key={index}
                                            container
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ py: 0.5 }}
                                        >
                                            <Grid item xs>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Название критерия"
                                                    value={c.name}
                                                    inputProps={{ maxLength: 50 }}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const limited = raw.slice(0, 50);
                                                        updateCriterion(index, { name: limited });
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <TextField
                                                    label="Баллы"
                                                    type="number"
                                                    size="small"
                                                    sx={{ width: 100 }}
                                                    value={c.points}
                                                    inputProps={{ min: 0 }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "-") e.preventDefault();
                                                    }}
                                                    onChange={(e) =>
                                                        updateCriterion(index, {
                                                            points: toNonNegativeInt(e.target.value),
                                                        })
                                                    }
                                                    onBlur={(e) =>
                                                        updateCriterion(index, {
                                                            points: toNonNegativeInt(e.target.value),
                                                        })
                                                    }
                                                />
                                            </Grid>

                                            <Grid item>
                                                <IconButton
                                                    onClick={() => removeCriterion(index)}
                                                    sx={{
                                                        color: "#d32f2f",
                                                        "&:hover": {
                                                            color: "#b71c1c",
                                                            backgroundColor: "transparent",
                                                        },
                                                    }}
                                                    size="small"
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Stack>

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
                                    <span style={{ fontSize: "18px", lineHeight: "18px" }}>+</span>
                                    Добавить критерий оценивания
                                </Button>
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
    task: TaskWithCriteria,
    homework: HomeworkViewModel,
    isMentor: boolean,
    initialEditMode: boolean,
    onMount: () => void,
    onUpdate: (x: { task: TaskWithCriteria, isDeleted?: boolean }) => void
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
                if (update.isSaved) setEditMode(false)
                const updateFix = {
                    ...update,
                    task: {
                        ...update.task,
                        isModified: !update.isSaved,
                        criterias: update.task.criterias,
                    }
                }
                props.onUpdate(updateFix)
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
                            <Chip color={"info"} label="Командное" />
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
                            <EditIcon color={"primary"} style={{fontSize: 17}} />
                        </IconButton>
                    </Grid>
                )}
            </Grid>

            <Divider style={{marginTop: 15, marginBottom: 15}} />

            <Typography component="div" style={{color: "#454545"}} gutterBottom variant="body1">
                <MarkdownPreview value={task.description!} />
            </Typography>

            {task.criterias && task.criterias.length > 0 && (
                <>
                    <Divider style={{marginTop: 15, marginBottom: 10}} />

                    <Typography variant="subtitle1" gutterBottom>
                        Критерии оценивания:
                    </Typography>

                    <Stack spacing={0.5}>
                        {task.criterias.map(c => (
                            <Stack key={c.id} direction="row" justifyContent="space-between">
                                <Typography variant="body2">{c.name}</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                 Максимум:   {c.points} б.
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </>
            )}
        </CardContent>
    );
}
export default CourseTaskExperimental;