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
    FormControlLabel,
    Menu,
    MenuItem
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useEffect, useState, useMemo} from "react"
import {ActionOptions, CriterionType, CriterionViewModel, HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
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
import Utils from "../../services/Utils";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";


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

const CriterionTypeDeadline = CriterionType.NUMBER_1;

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
    const [addCriterionAnchor, setAddCriterionAnchor] = useState<null | HTMLElement>(null)

    const isDeadlineCriterion = (criterion: CriterionViewModel) => criterion.type === CriterionTypeDeadline;

    const addDefaultCriterion = () => {
        setCriteria(prev => [
            ...prev,
            {id: 0, type: 0, name: `Критерий №${prev.length + 1}`, maxPoints: 1}
        ]);
        setIsCriteriaOpen(true);
        setAddCriterionAnchor(null);
    };

    const addDeadlineCriterion = () => {
        const deadline = metadata?.deadlineDate || homework.deadlineDate
            ? new Date(metadata?.deadlineDate || homework.deadlineDate!)
            : new Date();

        setCriteria(prev => [
            ...prev,
            {
                id: 0,
                type: CriterionTypeDeadline,
                name: "Сдано вовремя",
                maxPoints: 1,
                arguments: deadline.toISOString(),
            }
        ]);
        setIsCriteriaOpen(true);
        setAddCriterionAnchor(null);
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
                (sum, c) => sum + (isDeadlineCriterion(c) ? 0 : (c.maxPoints || 0)),
                0
            ),
        [criteria]
    )

    const autoMaxFromCriteria = criteria.length > 0;
    const criteriaHasErrors = criteria.some(c =>
        !c.name || (c.maxPoints ?? 0) <= 0 || (isDeadlineCriterion(c) && !c.arguments)
    );

    const renderAddCriterionMenu = () => (
        <Menu
            anchorEl={addCriterionAnchor}
            open={Boolean(addCriterionAnchor)}
            onClose={() => setAddCriterionAnchor(null)}
        >
            <MenuItem onClick={addDefaultCriterion}>Обычный критерий</MenuItem>
            <MenuItem onClick={addDeadlineCriterion} sx={{color: "#16a34a", fontWeight: 700}}>
                Автокритерий: дедлайн
            </MenuItem>
        </Menu>
    );

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
        setHasErrors(!title || maxRating <= 0 || metadata?.hasErrors === true || criteriaHasErrors)
    }, [title, maxRating, metadata?.hasErrors, criteriaHasErrors])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)

        try {
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
        } catch (error) {
            const errors = await ErrorsHandler.getErrorMessages(error as Response, "errors");
            enqueueSnackbar(errors[0] || "Не удалось сохранить задачу", {
                variant: "error",
                autoHideDuration: 4000,
            });
        } finally {
            setHandleSubmitLoading(false)
        }
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
                            label="Бонусная"
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
                        error={maxRating <= 0}
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
                                      onClick={(e) => setAddCriterionAnchor(e.currentTarget)}>
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
                                    {criteria.map((c, index) => isDeadlineCriterion(c) ? (
                                        <Box
                                            key={index}
                                            sx={{
                                                border: "1px solid #E2E5EC",
                                                borderRadius: "8px",
                                                p: 2,
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            <Grid container spacing={1.5} alignItems="flex-start">
                                                <Grid item xs={12}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Chip
                                                            label="Авто"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: "#E8F8EE",
                                                                color: "#159947",
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                            Критерий дедлайна
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        variant="standard"
                                                        label="Название критерия"
                                                        value={c.name}
                                                        inputProps={{maxLength: 50}}
                                                        onChange={(e) => updateCriterion(index, {name: e.target.value.slice(0, 50)})}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        label="Штраф"
                                                        type="number"
                                                        size="small"
                                                        sx={{width: 110}}
                                                        value={-(c.maxPoints ?? 1)}
                                                        inputProps={{max: -1}}
                                                        onChange={(e) =>
                                                            updateCriterion(index, {
                                                                maxPoints: Math.max(Math.abs(+e.target.value || 1), 1),
                                                            })
                                                        }
                                                        onBlur={(e) =>
                                                            updateCriterion(index, {
                                                                maxPoints: Math.max(Math.abs(+e.target.value || 1), 1),
                                                            })
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <IconButton
                                                        onClick={() => removeCriterion(index)}
                                                        color="error"
                                                        size="small"
                                                    >
                                                        <CloseIcon fontSize="small"/>
                                                    </IconButton>
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        label="Дата и время"
                                                        type="datetime-local"
                                                        size="small"
                                                        required
                                                        error={!c.arguments}
                                                        value={c.arguments ? Utils.toISOString(new Date(c.arguments)) : ""}
                                                        onChange={(e) =>
                                                            updateCriterion(index, {
                                                                arguments: e.target.value
                                                                    ? new Date(e.target.value).toISOString()
                                                                    : undefined,
                                                            })
                                                        }
                                                        InputLabelProps={{shrink: true}}
                                                    />
                                                </Grid>
                                                <Grid item sx={{pt: "20px !important"}}>
                                                    <Typography variant="body2">
                                                        На основе дедлайна
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Box
                                                        sx={{
                                                            border: "1px solid #FDBA74",
                                                            backgroundColor: "#FFF7ED",
                                                            color: "#667085",
                                                            p: 1,
                                                            minWidth: 220,
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{display: "block", fontWeight: 700, color: "#475467"}}>
                                                            Как сработает правило
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            После {c.arguments ? Utils.renderDateWithoutSeconds(new Date(c.arguments)) : "дедлайна"} будет списан {c.maxPoints || 1} балл
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ) : (
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
                                        onClick={(e) => setAddCriterionAnchor(e.currentTarget)}
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
                    {renderAddCriterionMenu()}
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
