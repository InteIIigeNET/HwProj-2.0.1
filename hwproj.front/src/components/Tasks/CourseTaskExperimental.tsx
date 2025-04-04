﻿import {CardContent, Chip, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import {FC, useEffect, useState} from "react"
import {HomeworkTaskViewModel, HomeworkViewModel} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import {LoadingButton} from "@mui/lab";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";

interface IEditTaskMetadataState {
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    publicationDate: Date | undefined;
    isPublished: boolean;
}

const CourseTaskEditor: FC<{
    speculativeTask: HomeworkTaskViewModel,
    speculativeHomework: HomeworkViewModel,
    onUpdate: (update: HomeworkTaskViewModel) => void
}> = (props) => {
    const [taskData, setTaskData] = useState<{
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isLoaded: boolean
    }>({task: props.speculativeTask, homework: props.speculativeHomework, isLoaded: false})

    const [metadata, setMetadata] = useState<IEditTaskMetadataState | undefined>(undefined)

    useEffect(() => {
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
                    deadlineDate: task.deadlineDate == null
                        ? undefined
                        : new Date(task.deadlineDate),
                    isDeadlineStrict: task.isDeadlineStrict!,
                    publicationDate: task.publicationDate == null
                        ? undefined
                        : new Date(task.publicationDate),
                    isPublished: !task.isDeferred
                });
            })
    }, [])

    const {task, homework, isLoaded} = taskData
    const {id} = task

    const [title, setTitle] = useState<string>(task.title!)
    const [maxRating, setMaxRating] = useState<number>(task.maxRating!)
    const [description, setDescription] = useState<string>(task.description!)
    const [hasErrors, setHasErrors] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        const updatedTask = await ApiSingleton.tasksApi.tasksUpdateTask(+id!, {
            ...metadata!,
            title: title!,
            description: description,
            maxRating: maxRating,
        })

        props.onUpdate(updatedTask.value!)
    }

    const isDisabled = hasErrors || !isLoaded

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"}>
                <Grid item>
                    <TextField
                        required
                        fullWidth
                        style={{width: '300px'}} //TODO
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
                        required
                        fullWidth
                        style={{width: '75px'}}
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
                {metadata && <Grid item xs={12} style={{marginBottom: "15px"}}>
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
                            })
                            setHasErrors(state.hasErrors)
                        }}
                    />
                </Grid>}
                <LoadingButton
                    fullWidth
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={isDisabled}
                    loadingPosition="end"
                    endIcon={<span style={{width: 17}}/>}
                    loading={handleSubmitLoading}
                    style={isDisabled ? undefined : {color: "white", backgroundColor: "#3f51b5"}}
                >
                    Редактировать задачу
                </LoadingButton>
            </Grid>
        </CardContent>
    )
}

const CourseTaskExperimental: FC<{
    task: HomeworkTaskViewModel,
    homework: HomeworkViewModel,
    isMentor: boolean,
    onUpdate: (x: HomeworkTaskViewModel) => void
}> = (props) => {
    const {task, homework} = props
    const [showEditMode, setShowEditMode] = useState(false)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setEditMode(false)
    }, [task.id])

    if (editMode) {
        return <CourseTaskEditor
            speculativeTask={task}
            speculativeHomework={homework}
            onUpdate={update => {
                setEditMode(false)
                props.onUpdate(update)
            }}
        />
    }

    return <CardContent
        onMouseEnter={() => setShowEditMode(props.isMentor)}
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
                    setEditMode(true)
                    setShowEditMode(false)
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