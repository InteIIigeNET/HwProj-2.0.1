﻿import {CardActions, CardContent, Chip, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import FilesPreviewList from "components/Files/FilesPreviewList";
import {IFileInfo} from "components/Files/IFileInfo";
import {FC, useEffect, useState} from "react"
import Utils from "services/Utils";
import {FileInfoDTO, HomeworkViewModel, ActionOptions} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";
import UpdateFilesUtils from "../Utils/UpdateFilesUtils";
import Tags from "../Common/Tags";
import apiSingleton from "../../api/ApiSingleton";
import FilesUploader from "../Files/FilesUploader";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import {LoadingButton} from "@mui/lab";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";
import DeletionConfirmation from "../DeletionConfirmation";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionOptionsUI from "components/Common/ActionOptions";

export interface HomeworkAndFilesInfo {
    homework: HomeworkViewModel,
    filesInfo: IFileInfo[]
}

interface IEditHomeworkState {
    publicationDate?: Date;
    hasDeadline: boolean;
    deadlineDate?: Date;
    isDeadlineStrict: boolean;
}

interface IEditFilesState {
    initialFilesInfo: IFileInfo[]
    selectedFilesInfo: IFileInfo[]
    isLoadingInfo: boolean
}

const CourseHomeworkEditor: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    onUpdate: (update: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] } & { isDeleted?: boolean }) => void
}> = (props) => {
    const speculativeHomework = props.homeworkAndFilesInfo.homework

    const [homeworkData, setHomeworkData] = useState<{
        homework: HomeworkViewModel,
        isLoaded: boolean
    }>({homework: speculativeHomework, isLoaded: false})

    useEffect(() => {
        ApiSingleton.homeworksApi
            .homeworksGetForEditingHomework(speculativeHomework.id!)
            .then(homework => setHomeworkData({homework, isLoaded: true}))
    }, [])

    const {homework, isLoaded} = homeworkData

    const filesInfo = props.homeworkAndFilesInfo.filesInfo
    const homeworkId = homework.id!
    const courseId = homework.courseId!

    const publicationDate = homework.publicationDateNotSet
        ? undefined
        : new Date(homework.publicationDate!)

    const deadlineDate = homework.deadlineDateNotSet
        ? undefined
        : new Date(homework.deadlineDate!)

    const isPublished = !homework.isDeferred
    const changedTaskPublicationDates = homework.tasks!
        .filter(t => t.publicationDate != null)
        .map(t => new Date(t.publicationDate!))

    const [metadata, setMetadata] = useState<IEditHomeworkState>({
        publicationDate: publicationDate,
        hasDeadline: homework.hasDeadline!,
        deadlineDate: deadlineDate,
        isDeadlineStrict: homework.isDeadlineStrict!,
    })
    const [title, setTitle] = useState<string>(homework.title!)
    const [tags, setTags] = useState<string[]>(homework.tags!)
    const [description, setDescription] = useState<string>(homework.description!)
    const [filesControlState, setFilesControlState] = useState<IEditFilesState>({
        initialFilesInfo: filesInfo,
        selectedFilesInfo: filesInfo,
        isLoadingInfo: false
    });
    const [hasErrors, setHasErrors] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const deleteHomework = async () => {
        await ApiSingleton.homeworksApi.homeworksDeleteHomework(homeworkId)

        // Удаляем файлы домашней работы из хранилища
        const deleteOperations = filesInfo.map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(courseId!, initialFile))
        await Promise.all(deleteOperations)

        props.onUpdate({homework, fileInfos: [], isDeleted: true})
    }

    const getDeleteMessage = (homeworkName: string, filesInfo: IFileInfo[]) => {
        let message = `Вы точно хотите удалить задание "${homeworkName}"?`;
        if (filesInfo.length > 0) {
            message += ` Будет также удален файл ${filesInfo[0].name}`;
            if (filesInfo.length > 1) {
                message += ` и другие прикрепленные файлы`;
            }
        }

        return message;
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        const updatedHomework = await ApiSingleton.homeworksApi.homeworksUpdateHomework(+homeworkId!, {
            title: title!,
            description: description,
            tags: tags,
            hasDeadline: metadata.hasDeadline,
            deadlineDate: metadata.deadlineDate,
            isDeadlineStrict: metadata.isDeadlineStrict,
            publicationDate: metadata.publicationDate,
            actionOptions: editOptions,
        })

        // Если какие-то файлы из ранее добавленных больше не выбраны, удаляем их из хранилища
        const deleteOperations = filesControlState.initialFilesInfo
            .filter(initialFile =>
                initialFile.key &&
                !filesControlState.selectedFilesInfo.some(s => s.key === initialFile.key)
            )
            .map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(courseId, initialFile));

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, загружаем их в хранилище
        const uploadOperations = filesControlState.selectedFilesInfo
            .filter(selectedFile =>
                selectedFile.file &&
                !filesControlState.initialFilesInfo.some(i => i.key === selectedFile.key)
            )
            .map(selectedFile => UpdateFilesUtils.uploadFileWithErrorsHadling(
                selectedFile.file!,
                courseId,
                +homeworkId!)
            );

        // Дожидаемся удаления и загрузки необходимых файлов
        await Promise.all([...deleteOperations, ...uploadOperations])

        if (deleteOperations.length === 0 && uploadOperations.length === 0) {
            props.onUpdate({homework: updatedHomework.value!, fileInfos: filesControlState.selectedFilesInfo})
        } else {
            try {
                const newFilesDtos = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, homeworkId!)
                props.onUpdate({homework: updatedHomework.value!, fileInfos: newFilesDtos})
            } catch (e) {
                const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
                enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 4000});
                props.onUpdate({homework: updatedHomework.value!, fileInfos: filesControlState.selectedFilesInfo})
            }
        }
    }

    const isSomeTaskSoonerThanHomework = changedTaskPublicationDates.some(d => d < metadata.publicationDate!)
    const isDisabled = isSomeTaskSoonerThanHomework || hasErrors || !isLoaded

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"}>
                <Grid item>
                    <TextField
                        required
                        fullWidth
                        style={{width: '300px'}} //TODO
                        label="Название задания"
                        variant="standard"
                        margin="normal"
                        value={title}
                        onChange={(e) => {
                            e.persist()
                            setTitle(e.target.value)
                        }}
                    />
                </Grid>
                <Grid item xs={6} style={{marginTop: 6}}>
                    <Tags tags={tags} onTagsChange={newTags => setTags(newTags)} isElementSmall={false}
                          requestTags={() => apiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} style={{marginBottom: "5px", marginTop: -2}}>
                    <MarkdownEditor
                        label={"Условие задания"}
                        height={240}
                        maxHeight={400}
                        value={description}
                        onChange={(value) => {
                            setDescription(value)
                        }}
                    />
                </Grid>
                <Grid item xs={12} style={{marginBottom: "15px"}}>
                    <Grid container direction="column">
                        <FilesUploader
                            initialFilesInfo={filesControlState.selectedFilesInfo}
                            isLoading={filesControlState.isLoadingInfo}
                            onChange={(filesInfo) => {
                                setFilesControlState((prevState) => ({
                                    ...prevState,
                                    selectedFilesInfo: filesInfo
                                }))
                            }}
                        />
                        <PublicationAndDeadlineDates
                            hasDeadline={metadata.hasDeadline}
                            isDeadlineStrict={metadata.isDeadlineStrict}
                            publicationDate={metadata.publicationDate}
                            deadlineDate={metadata.deadlineDate}
                            autoCalculatedDeadline={undefined}
                            disabledPublicationDate={isPublished}
                            onChange={(state) => {
                                setMetadata({
                                    hasDeadline: state.hasDeadline,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    publicationDate: state.publicationDate,
                                    deadlineDate: state.deadlineDate,
                                })
                                setHasErrors(state.hasErrors)
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <CardActions>
                {metadata.publicationDate && new Date() >= new Date(metadata.publicationDate) && <ActionOptionsUI
                    disabled={isDisabled || handleSubmitLoading}
                    onChange={value => setEditOptions(value)}/>}
                <LoadingButton
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
                    Редактировать задание ({editOptions.sendNotification ? "с уведомлением" : "без уведомления"})
                </LoadingButton>
                <IconButton aria-label="delete" color="error" onClick={() => setShowDeleteConfirmation(true)}>
                    <DeleteIcon/>
                </IconButton>
            </CardActions>
            <DeletionConfirmation
                onCancel={() => setShowDeleteConfirmation(false)}
                onSubmit={deleteHomework}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задания'}
                dialogContentText={getDeleteMessage(homework.title!, filesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </CardContent>
    )
}

const CourseHomeworkExperimental: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    isMentor: boolean,
    initialEditMode: boolean,
    onMount: () => void,
    onUpdate: (x: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] } & { isDeleted?: boolean }) => void
}> = (props) => {
    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredHomeworks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setEditMode(props.initialEditMode)
        props.onMount()
    }, [homework.id])

    if (editMode) return <CourseHomeworkEditor
        homeworkAndFilesInfo={{homework, filesInfo}}
        onUpdate={update => {
            setEditMode(false)
            props.onUpdate(update)
        }}
    />

    return <CardContent
        onMouseEnter={() => setShowEditMode(props.isMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Grid xs={12} container direction={"row"} alignItems={"center"} alignContent={"center"}
              justifyContent={"space-between"}>
            <Grid item container spacing={1} xs={11}>
                <Grid item>
                    <Typography variant="h6" component="div">
                        {homework.title}
                    </Typography>
                </Grid>
                {props.isMentor && deferredHomeworks!.length > 0 &&
                    <Grid item><Chip label={"🕘 " + deferredHomeworks!.length}/></Grid>
                }
                {tasksCount > 0 && <Grid item>
                    <Chip
                        label={tasksCount + " " + Utils.pluralizeHelper(["Задача", "Задачи", "Задач"], tasksCount)}/>
                </Grid>}
                {homework.tags?.filter(t => t !== '').map((tag, index) => (
                    <Grid item key={index}>
                        <Chip key={index} label={tag}/>
                    </Grid>
                ))}
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
            <MarkdownPreview value={homework.description!}/>
        </Typography>
        {
            filesInfo && filesInfo.length > 0 &&
            <div>
                <FilesPreviewList
                    filesInfo={filesInfo}
                    onClickFileInfo={async (fileInfo: IFileInfo) => {
                        const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.key!)
                        window.open(url, '_blank');
                    }}
                />
            </div>
        }
    </CardContent>
}
export default CourseHomeworkExperimental;