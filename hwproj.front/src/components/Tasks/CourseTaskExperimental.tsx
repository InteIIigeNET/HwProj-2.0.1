import {Alert, CardActions, CardContent, Chip, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useEffect, useState} from "react"
import {ActionOptions, HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {Button} from "@material-ui/core";
import {LoadingButton} from "@mui/lab";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import DeletionConfirmation from "../DeletionConfirmation";
import ActionOptionsUI from "../Common/ActionOptions";
import {useAppSelector} from "@/store/hooks";

interface IEditTaskMetadataState {
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    publicationDate: Date | undefined;
    isPublished: boolean;
    hasErrors: boolean
}

const CourseTaskEditor: FC<{
    speculativeTask: HomeworkTaskViewModel & { isModified?: boolean, hasErrors?: boolean, suggestedMaxRating?: number },
    speculativeHomework: HomeworkViewModel,
    onUpdate: (update: { task: HomeworkTaskViewModel, isDeleted?: boolean, isSaved?: boolean }) => void,
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

    const isNewTask = taskData.task.id! < 0

    const [metadata, setMetadata] = useState<IEditTaskMetadataState | undefined>(
        isNewTask || taskData.isLoaded ? {
            publicationDate: taskData.task.publicationDate,
            hasDeadline: taskData.task.hasDeadline,
            deadlineDate: taskData.task.deadlineDate,
            isDeadlineStrict: taskData.task.isDeadlineStrict,
            isPublished: taskData.task.isDeferred || !taskData.homework.isDeferred,
            hasErrors: false
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
                });
            })
    }, [])

    const {task, homework, isLoaded} = taskData
    const {id} = task

    const [title, setTitle] = useState<string>(task.title!)
    const [maxRating, setMaxRating] = useState<number>(task.maxRating!)
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
            hasErrors: hasErrors
        }
        props.onUpdate({task: update})
    }, [title, description, maxRating, metadata, hasErrors])

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
        }

        const updatedTask = isNewTask
            ? await ApiSingleton.tasksApi.tasksAddTask(homework.id!, update)
            : await ApiSingleton.tasksApi.tasksUpdateTask(+id!, update)

        if (isNewTask)
            props.onUpdate({
                task: props.speculativeTask,
                isDeleted: true, //remove task with undefined id
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
                        size={"small"}
                        required
                        fullWidth
                        helperText={props.speculativeTask.suggestedMaxRating === maxRating ? "Вычислено" : undefined}
                        error={maxRating <= 0 || maxRating > 100}
                        style={{width: '90px'}}
                        label="Баллы"
                        variant="outlined"
                        margin="normal"
                        type="number"
                        value={maxRating}
                        onChange={(e) => {
                            e.persist()
                            setMaxRating(+e.target.value)
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
                                    isPublished: metadata.isPublished, // Остается прежним
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
    task: HomeworkTaskViewModel,
    homework: HomeworkViewModel,
    initialEditMode: boolean,
    onMount: () => void,
    onUpdate: (x: { task: HomeworkTaskViewModel, isDeleted?: boolean }) => void
    toEditHomework: () => void,
}> = (props) => {
    const mentors = useAppSelector(state => state.course.mentors);
    const userId = useAppSelector(state => state.auth.userId);
    const isMentor = mentors.some(m => m.userId === userId);

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
                        isModified: !update.isSaved
                    }
                }
                props.onUpdate(updateFix)
            }}
            toEditHomework={props.toEditHomework}
        />
    }

    return <CardContent
        onMouseEnter={() => setShowEditMode(isMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Grid xs={12} container direction={"row"} alignItems={"center"} alignContent={"center"}
              justifyContent={"space-between"}>
            <Grid container spacing={1} xs={11} alignItems={"center"}>
                <Grid item style={{marginRight: 1}}>
                    <Typography variant="h6" component="div">
                        {task.title}
                    </Typography>
                </Grid>
                {task.isGroupWork && <Grid item>
                    <Chip color={"info"} label="Командное"/>
                </Grid>}
                <Grid item>
                    <Typography>{"⭐ " + task.maxRating}</Typography>
                </Grid>
            </Grid>
            {showEditMode && <Grid item>
                <IconButton onClick={() => {
                    setShowEditMode(false)
                    setEditMode(true)
                }}>
                    <EditIcon color={"primary"} style={{fontSize: 17}}/>
                </IconButton>
            </Grid>}
        </Grid>
        <Divider style={{marginTop: 15, marginBottom: 15}}/>
        <Typography component="div" style={{color: "#454545"}} gutterBottom variant="body1">
            <MarkdownPreview value={task.description!}/>
        </Typography>
    </CardContent>
}
export default CourseTaskExperimental;