import {
    Alert,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import FilesPreviewList from "components/Files/FilesPreviewList";
import {IFileInfo} from "components/Files/IFileInfo";
import {FC, useEffect, useState} from "react"
import Utils from "services/Utils";
import {FileInfoDTO, HomeworkViewModel, ActionOptions, HomeworkTaskViewModel, CreateTaskViewModel} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import UpdateFilesUtils from "../Utils/UpdateFilesUtils";
import Tags from "../Common/Tags";
import apiSingleton from "../../api/ApiSingleton";
import FilesUploader from "../Files/FilesUploader";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from '@mui/icons-material/AddTask';
import {LoadingButton} from "@mui/lab";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";
import DeletionConfirmation from "../DeletionConfirmation";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionOptionsUI from "components/Common/ActionOptions";
import {BonusTag, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import Lodash from "lodash";

export interface HomeworkAndFilesInfo {
    homework: HomeworkViewModel & { isModified?: boolean },
    filesInfo: IFileInfo[]
}

interface IEditHomeworkState {
    publicationDate?: Date;
    hasDeadline: boolean;
    deadlineDate?: Date;
    isDeadlineStrict: boolean;
    hasErrors: boolean;
}

interface IEditFilesState {
    initialFilesInfo: IFileInfo[]
    selectedFilesInfo: IFileInfo[]
    isLoadingInfo: boolean
}

const CourseHomeworkEditor: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    getAllHomeworks: () => HomeworkViewModel[],
    onUpdate: (update: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] } & {
        isDeleted?: boolean,
        isSaved?: boolean
    }) => void
}> = (props) => {
    const homework = props.homeworkAndFilesInfo.homework
    const isNewHomework = homework.id! < 0

    const [homeworkData, setHomeworkData] = useState<{
        loadedHomework: HomeworkViewModel,
        isLoaded: boolean
    }>({loadedHomework: homework, isLoaded: isNewHomework || homework.isModified == true})

    useEffect(() => {
        if (homeworkData.isLoaded) return
        ApiSingleton.homeworksApi
            .homeworksGetForEditingHomework(homework.id!)
            .then(homework => setHomeworkData({loadedHomework: homework, isLoaded: true}))
    }, [])

    const {loadedHomework, isLoaded} = homeworkData

    const initialFilesInfo = props.homeworkAndFilesInfo.filesInfo.filter(x => x.key !== "local")

    const homeworkId = loadedHomework.id!
    const courseId = loadedHomework.courseId!

    const publicationDate = loadedHomework.publicationDateNotSet || !loadedHomework.publicationDate
        ? undefined
        : new Date(loadedHomework.publicationDate!)

    const deadlineDate = loadedHomework.deadlineDateNotSet || !loadedHomework.deadlineDate
        ? undefined
        : new Date(loadedHomework.deadlineDate!)

    const isPublished = !loadedHomework.isDeferred
    const changedTaskPublicationDates = loadedHomework.tasks!
        .filter(t => t.publicationDate != null)
        .map(t => new Date(t.publicationDate!))

    const taskHasErrors = homework.tasks!.some((x: HomeworkTaskViewModel & {
        hasErrors?: boolean
    }) => x.hasErrors === true)

    const [metadata, setMetadata] = useState<IEditHomeworkState>({
        publicationDate: publicationDate,
        hasDeadline: loadedHomework.hasDeadline!,
        deadlineDate: deadlineDate,
        isDeadlineStrict: loadedHomework.isDeadlineStrict!,
        hasErrors: false,
    })
    const [title, setTitle] = useState<string>(loadedHomework.title!)
    const [tags, setTags] = useState<string[]>(loadedHomework.tags!)
    const [description, setDescription] = useState<string>(loadedHomework.description!)
    const [filesState, setFilesState] = useState<IEditFilesState>({
        initialFilesInfo: initialFilesInfo,
        selectedFilesInfo: props.homeworkAndFilesInfo.filesInfo,
        isLoadingInfo: false
    });
    const [hasErrors, setHasErrors] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const [deadlineSuggestion, setDeadlineSuggestion] = useState<Date | undefined>(undefined)

    useEffect(() => {
        if (!isNewHomework || !metadata.publicationDate) return
        const isTest = tags.includes(TestTag)
        const isBonus = tags.includes(BonusTag)

        const dateCandidate = Lodash(props.getAllHomeworks()
            .filter(x => {
                const xIsTest = isTestWork(x)
                const xIsBonus = isBonusWork(x)
                return x.id! > 0 && x.hasDeadline && (isTest && xIsTest || isBonus && xIsBonus || !isTest && !isBonus && !xIsTest && !xIsBonus)
            })
            .map(x => {
                const deadlineDate = new Date(x.deadlineDate!)
                return ({
                    deadlineDate: deadlineDate,
                    daysDiff: Math.floor((deadlineDate.getTime() - new Date(x.publicationDate!).getTime()) / (1000 * 3600 * 24))
                });
            }))
            .groupBy(x => [x.daysDiff, x.deadlineDate.getHours(), x.deadlineDate.getMinutes()])
            .entries()
            .sortBy(x => x[1].length).last()?.[1][0]
        if (dateCandidate) {
            const publicationDate = new Date(metadata.publicationDate)
            const dateTime = dateCandidate.deadlineDate
            publicationDate.setDate(publicationDate.getDate() + dateCandidate.daysDiff)
            publicationDate.setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0)
            setDeadlineSuggestion(publicationDate)
        } else {
            setDeadlineSuggestion(undefined)
        }
    }, [tags, metadata.publicationDate])

    useEffect(() => {
        const update = {
            ...homework,
            ...metadata,
            tasks: homework.tasks,
            title: title,
            description: description,
            tags: tags,
            hasErrors: hasErrors,
            deadlineDateNotSet: metadata.hasDeadline && !metadata.deadlineDate,
            isModified: true,
        }

        props.onUpdate({fileInfos: filesState.selectedFilesInfo, homework: update})
    }, [title, description, tags, metadata, hasErrors, filesState.selectedFilesInfo])

    useEffect(() => {
        setHasErrors(!title || metadata.hasErrors)
    }, [title, metadata.hasErrors])

    const deleteHomework = async () => {
        if (!isNewHomework) await ApiSingleton.homeworksApi.homeworksDeleteHomework(homeworkId)

        // Удаляем файлы домашней работы из хранилища
        const deleteOperations = initialFilesInfo.map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(courseId!, initialFile))
        await Promise.all(deleteOperations)

        props.onUpdate({homework: loadedHomework, fileInfos: [], isDeleted: true})
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

        const update = {
            homeworkId: homeworkId,
            title: title!,
            description: description,
            tags: tags,
            hasDeadline: metadata.hasDeadline,
            deadlineDate: metadata.deadlineDate,
            isDeadlineStrict: metadata.isDeadlineStrict,
            publicationDate: metadata.publicationDate,
            actionOptions: editOptions,
            tasks: homework.tasks!.map(t => {
                const task: CreateTaskViewModel = {
                    ...t,
                    title: t.title!,
                    maxRating: t.maxRating!
                }
                return task
            })
        }

        const updatedHomework = isNewHomework
            ? await ApiSingleton.homeworksApi.homeworksAddHomework(courseId!, update)
            : await ApiSingleton.homeworksApi.homeworksUpdateHomework(+homeworkId!, update)

        const updatedHomeworkId = updatedHomework.value!.id!

        // Если какие-то файлы из ранее добавленных больше не выбраны, удаляем их из хранилища
        const deleteOperations = filesState.initialFilesInfo
            .filter(initialFile =>
                initialFile.key &&
                !filesState.selectedFilesInfo.some(s => s.key === initialFile.key)
            )
            .map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(courseId, initialFile));

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, загружаем их в хранилище
        const uploadOperations = filesState.selectedFilesInfo
            .filter(selectedFile =>
                selectedFile.file &&
                !filesState.initialFilesInfo.some(i => i.key === selectedFile.key)
            )
            .map(selectedFile => UpdateFilesUtils.uploadFileWithErrorsHadling(
                selectedFile.file!,
                courseId,
                updatedHomeworkId)
            );

        // Дожидаемся удаления и загрузки необходимых файлов
        await Promise.all([...deleteOperations, ...uploadOperations])

        if (deleteOperations.length === 0 && uploadOperations.length === 0) {
            if (isNewHomework) props.onUpdate({
                homework: update,
                fileInfos: [],
                isDeleted: true
            }) // remove fake homework
            props.onUpdate({
                homework: updatedHomework.value!,
                fileInfos: filesState.selectedFilesInfo,
                isSaved: true
            })
        } else {
            try {
                const newFilesDtos = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, updatedHomeworkId)
                if (isNewHomework) props.onUpdate({
                    homework: update,
                    fileInfos: [],
                    isDeleted: true
                }) // remove fake homework
                props.onUpdate({homework: updatedHomework.value!, fileInfos: newFilesDtos, isSaved: true})
            } catch (e) {
                const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
                enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 4000});
                if (isNewHomework) props.onUpdate({
                    homework: update,
                    fileInfos: [],
                    isDeleted: true
                }) // remove fake homework
                props.onUpdate({
                    homework: updatedHomework.value!,
                    fileInfos: filesState.selectedFilesInfo,
                    isSaved: true
                })
            }
        }
    }

    const isDisabled = hasErrors || !isLoaded || taskHasErrors

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"} alignContent={"center"} style={{marginTop: -20}}>
                <Grid item>
                    <TextField
                        required
                        fullWidth
                        style={{width: '300px'}} //TODO
                        label="Название задания"
                        variant="standard"
                        margin="normal"
                        error={!title}
                        value={title}
                        onChange={(e) => {
                            e.persist()
                            setHasErrors(prevState => prevState || !e.target.value)
                            setTitle(e.target.value)
                        }}
                    />
                </Grid>
                <Grid item xs={6} style={{marginTop: 6}}>
                    <Tags tags={tags} onTagsChange={setTags} isElementSmall={false}
                          requestTags={() => apiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                </Grid>
            </Grid>
            <Grid container>
                {tags.includes(TestTag) &&
                    <Grid item>
                        <Alert severity="info" variant={"outlined"}>
                            Вы можете сгруппировать контрольные работы и переписывания с помощью
                            дополнительного тега. Например, 'КР 1'
                        </Alert>
                    </Grid>}
                <Grid item xs={12} style={{marginBottom: "5px", marginTop: -2}}>
                    <MarkdownEditor
                        label={"Общее описание задания"}
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
                            initialFilesInfo={filesState.selectedFilesInfo}
                            isLoading={filesState.isLoadingInfo}
                            onChange={(filesInfo) => {
                                setFilesState((prevState) => ({
                                    ...prevState,
                                    selectedFilesInfo: filesInfo
                                }));
                            }}
                            homeworkId={homeworkId}/>
                        <PublicationAndDeadlineDates
                            hasDeadline={metadata.hasDeadline}
                            isDeadlineStrict={metadata.isDeadlineStrict}
                            publicationDate={metadata.publicationDate}
                            deadlineDate={metadata.deadlineDate}
                            autoCalculatedDeadline={deadlineSuggestion}
                            disabledPublicationDate={!isNewHomework && isPublished}
                            onChange={(state) => {
                                const conflictsWithTasks = changedTaskPublicationDates.some(d => d < metadata.publicationDate!)
                                setMetadata({
                                    hasDeadline: state.hasDeadline,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    publicationDate: state.publicationDate,
                                    deadlineDate: state.deadlineDate,
                                    hasErrors: state.hasErrors || conflictsWithTasks,
                                })
                            }}
                        />
                    </Grid>
                </Grid>
                {taskHasErrors && <Grid item xs={12}>
                    <Alert severity={"error"}>Одна или более вложенных задач содержат ошибки</Alert>
                </Grid>}
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
                    {isNewHomework && "Добавить задание"}
                    {!isNewHomework && "Редактировать задание " + (editOptions.sendNotification ? "с уведомлением" : "без уведомления")}
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
                dialogContentText={getDeleteMessage(homework.title!, initialFilesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </CardContent>
    )
}

const CourseHomeworkExperimental: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    getAllHomeworks: () => HomeworkViewModel[],
    isMentor: boolean,
    initialEditMode: boolean,
    onMount: () => void,
    onUpdate: (x: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] } & { isDeleted?: boolean }) => void
    onAddTask: (homework: HomeworkViewModel) => void,
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
        getAllHomeworks={props.getAllHomeworks}
        homeworkAndFilesInfo={{homework, filesInfo}}
        onUpdate={update => {
            if (update.isSaved) setEditMode(false)
            props.onUpdate(update)
        }}
    />

    return <CardContent
        onMouseEnter={() => setShowEditMode(props.isMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Grid xs={12} container direction={"row"} alignItems={"start"} alignContent={"center"}
              justifyContent={"space-between"}>
            <Grid item container spacing={1} xs={10}>
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
                <Stack direction={"row"}>
                    <Tooltip placement={"left"} arrow title={"Добавить задачу"}>
                        <IconButton
                            onClick={() => props.onAddTask(homework)}
                        >
                            <AddTaskIcon color={"primary"} style={{fontSize: 17}}/>
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => {
                        setEditMode(true)
                        setShowEditMode(false)
                    }}>
                        <EditIcon color={"primary"} style={{fontSize: 17}}/>
                    </IconButton>
                </Stack>
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