import {
    Alert,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
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
import {HomeworkViewModel, ActionOptions, HomeworkTaskViewModel, CreateTaskViewModel} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
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
import {BonusTag, DefaultTags, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import Lodash from "lodash";
import {CourseUnitType} from "../Files/CourseUnitType"
import ProcessFilesUtils from "../Utils/ProcessFilesUtils";
import {FilesHandler} from "@/components/Files/FilesHandler";

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

const CourseHomeworkEditor: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    getAllHomeworks: () => HomeworkViewModel[],
    onUpdate: (update: { homework: HomeworkViewModel } & {
        isDeleted?: boolean,
        isSaved?: boolean
    }) => void
    onStartProcessing: (homeworkId: number,
        courseUnitType: CourseUnitType,
        previouslyExistingFilesCount: number,
        waitingNewFilesCount: number,
        deletingFilesIds: number[]) => void;
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

    const {filesState, setFilesState, handleFilesChange} = FilesHandler(props.homeworkAndFilesInfo.filesInfo)
    const initialFilesInfo = props.homeworkAndFilesInfo.filesInfo.filter(x => x.id !== undefined)

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

    const [hasErrors, setHasErrors] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const [deadlineSuggestion, setDeadlineSuggestion] = useState<Date | undefined>(undefined)
    const [tagSuggestion, setTagSuggestion] = useState<string | undefined>(undefined)

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

        props.onUpdate({homework: update})
    }, [title, description, tags, metadata, hasErrors, filesState.selectedFilesInfo])

    useEffect(() => {
        setHasErrors(!title || metadata.hasErrors)
    }, [title, metadata.hasErrors])

    useEffect(() => {
        const x = title.toLowerCase()
        setTagSuggestion(
            !tags.includes(TestTag) && (
                x.includes("контрольн") ||
                x.includes("проверочн") ||
                x.includes("переписывание") ||
                x.includes("тест"))
                ? TestTag : undefined)
    }, [title, tags]);

    const deleteHomework = async () => {
        if (!isNewHomework) await ApiSingleton.homeworksApi.homeworksDeleteHomework(homeworkId)

        // Удаляем файлы домашней работы с сервера
        var deletingFileIds = initialFilesInfo.filter(fileInfo => fileInfo.id).map(fileInfo => fileInfo.id!)
        await ProcessFilesUtils.processFilesWithErrorsHadling({
            courseId: courseId!,
            courseUnitType: CourseUnitType.Homework,
            courseUnitId: homeworkId,
            deletingFileIds: deletingFileIds,
            newFiles: []
        })

        props.onUpdate({homework: loadedHomework, isDeleted: true})
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
            tasks: isNewHomework ? homework.tasks!.map(t => {
                const task: CreateTaskViewModel = {
                    ...t,
                    title: t.title!,
                    maxRating: t.maxRating!
                }
                return task
            }) : []
        }

        const updatedHomework = isNewHomework
            ? await ApiSingleton.homeworksApi.homeworksAddHomework(courseId!, update)
            : await ApiSingleton.homeworksApi.homeworksUpdateHomework(+homeworkId!, update)

        const updatedHomeworkId = updatedHomework.value!.id!
        await handleFilesChange(
            courseId, CourseUnitType.Homework, updatedHomeworkId,
            props.onStartProcessing,
            () => {
                if (isNewHomework) props.onUpdate({
                    homework: update,
                    isDeleted: true
                }) // remove fake homework
                props.onUpdate({homework: updatedHomework.value!, isSaved: true});
            },
        );
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
                          suggestion={tagSuggestion}
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
                            courseUnitType={CourseUnitType.Homework}
                            courseUnitId={homeworkId}/>
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
    onUpdate: (x: { homework: HomeworkViewModel } & {
        isDeleted?: boolean
    }) => void
    onAddTask: (homework: HomeworkViewModel) => void,
    isProcessing: boolean;
    onStartProcessing: (homeworkId: number,
        courseUnitType: CourseUnitType,
        previouslyExistingFilesCount: number,
        waitingNewFilesCount: number,
        deletingFilesIds: number[]) => void;
}> = (props) => {
    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredTasks = homework.tasks!.filter(t => t.isDeferred!)
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
        onStartProcessing={props.onStartProcessing}
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
                {tasksCount > 0 && <Grid item>
                    <Chip
                        label={tasksCount + " "
                            + Utils.pluralizeHelper(["Задача", "Задачи", "Задач"], tasksCount)
                            + (deferredTasks!.length > 0 ? ` (🕘 ${deferredTasks.length} ` + Utils.pluralizeHelper(["отложенная", "отложенные", "отложенных"], deferredTasks.length) + ")" : "")}/>
                </Grid>}
                {homework.tags?.filter(t => DefaultTags.includes(t)).map((tag, index) => (
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
        {props.isProcessing ? (
            <div style={{display: 'flex', alignItems: 'center', color: '#1976d2', fontWeight: '500'}}>
                <CircularProgress size="20px"/>
                &nbsp;&nbsp;Обрабатываем файлы...
            </div>
        ) : filesInfo.length > 0 && (
            <div>
                <FilesPreviewList
                    showOkStatus={props.isMentor}
                    filesInfo={filesInfo}
                    onClickFileInfo={async (fileInfo: IFileInfo) => {
                        const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.id!);
                        window.open(url, '_blank');
                    }}
                />
            </div>
        )
        }
    </CardContent>
}
export default CourseHomeworkExperimental;