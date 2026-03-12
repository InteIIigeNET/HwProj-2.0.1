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
import {FC, useState} from "react"
import Utils from "services/Utils";
import {
    HomeworkViewModel, ActionOptions, HomeworkTaskViewModel
} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import Tags from "../Common/Tags";
import FilesUploader from "../Files/FilesUploader";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from '@mui/icons-material/AddTask';
import {LoadingButton} from "@mui/lab";
import DeletionConfirmation from "../DeletionConfirmation";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionOptionsUI from "components/Common/ActionOptions";
import {DefaultTags, TestTag} from "@/components/Common/HomeworkTags";
import {CourseUnitType} from "../Files/CourseUnitType"
import {useCourseState} from "@/store/hooks";
import {useIsCourseMentor} from "@/store/storeHooks/courseHooks";
import {FilesHandler} from "@/components/Files/FilesHandler";
import {
    useDraftHomework,
    getHomeworkDeleteMessage,
    useHomeworkEditorState
} from "@/store/storeHooks/homeworkEditorHooks";
import {useCourseActions} from "@/store/courseActions";

export interface HomeworkAndFilesInfo {
    homework: HomeworkViewModel,
    filesInfo: IFileInfo[]
}

const CourseHomeworkEditor: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    onDone?: () => void,
    onStartProcessing: (homeworkId: number,
                        courseUnitType: CourseUnitType,
                        previouslyExistingFilesCount: number,
                        waitingNewFilesCount: number,
                        deletingFilesIds: number[]) => void;
}> = (props) => {
    const loadedHomework = props.homeworkAndFilesInfo.homework
    const {
        patchHomeworkDraft,
        saveHomework,
        deleteHomework,
        cancelHomeworkEdit,
    } = useCourseActions()

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const {filesState, setFilesState} = FilesHandler(props.homeworkAndFilesInfo.filesInfo)
    const initialFilesInfo = props.homeworkAndFilesInfo.filesInfo.filter(x => x.id !== undefined)

    const homeworkId = loadedHomework.id!
    const courseId = loadedHomework.courseId!
    const {
        isNewHomework,
        publicationDate,
        deadlineDate,
        isPublished,
        changedTaskPublicationDates,
        taskHasErrors,
        hasErrors,
        deadlineSuggestion,
        tagSuggestion,
    } = useHomeworkEditorState(loadedHomework)

    const homeworkSaveFileOptions = {
        initialFilesInfo,
        selectedFilesInfo: filesState.selectedFilesInfo,
        onStartProcessing: props.onStartProcessing,
        onDone: props.onDone,
    }

    const homeworkDeleteFileOptions = { 
        initialFilesInfo }

    const handleDeleteHomework = async () => {
        await deleteHomework(homeworkId, homeworkDeleteFileOptions)
    }

    const cancelEditing = () => {
        cancelHomeworkEdit(loadedHomework.id!)
        props.onDone?.()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            await saveHomework(homeworkId, editOptions, homeworkSaveFileOptions)
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const isDisabled = hasErrors || taskHasErrors

    return (
        <CardContent style={{position: 'relative'}}>
            <IconButton
                onClick={cancelEditing}
                disabled={handleSubmitLoading}
                size="small"
                color="error"
                style={{position: 'absolute', top: -16, right: -16, zIndex: 1, backgroundColor: 'white', boxShadow: '0 0 4px rgba(0,0,0,0.2)'}}
            >
                <CloseIcon fontSize="small"/>
            </IconButton>
            <Grid item container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"} alignContent={"center"} style={{marginTop: -24}}>
                <Grid item>
                    <TextField
                        required
                        fullWidth
                        style={{width: '300px'}}
                        label="Название задания"
                        variant="standard"
                        margin="normal"
                        error={!loadedHomework.title}
                        value={loadedHomework.title || ''}
                        onChange={(e) => patchHomeworkDraft({ ...loadedHomework, title: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6} style={{marginTop: 6}}>
                    <Tags
                        tags={loadedHomework.tags || []}
                        onTagsChange={(tags) => patchHomeworkDraft({ ...loadedHomework, tags })}
                        isElementSmall={false}
                        suggestion={tagSuggestion}
                        requestTags={() => ApiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                </Grid>
            </Grid>
            <Grid container>
                {(loadedHomework.tags || []).includes(TestTag) &&
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
                        value={loadedHomework.description || ''}
                        onChange={(value) => patchHomeworkDraft({ ...loadedHomework, description: value })}
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
                            hasDeadline={loadedHomework.hasDeadline ?? false}
                            isDeadlineStrict={loadedHomework.isDeadlineStrict ?? false}
                            publicationDate={publicationDate}
                            deadlineDate={deadlineDate}
                            autoCalculatedDeadline={deadlineSuggestion}
                            disabledPublicationDate={!isNewHomework && isPublished}
                            onChange={(state) => {
                                const conflictsWithTasks = changedTaskPublicationDates.some(d => publicationDate && d < publicationDate)
                                const currentPublicationDate = loadedHomework.publicationDate instanceof Date
                                    ? loadedHomework.publicationDate.toISOString()
                                    : loadedHomework.publicationDate
                                const currentDeadlineDate = loadedHomework.deadlineDate instanceof Date
                                    ? loadedHomework.deadlineDate.toISOString()
                                    : loadedHomework.deadlineDate
                                const nextPublicationDate = state.publicationDate?.toISOString()
                                const nextDeadlineDate = state.deadlineDate?.toISOString()
                                const nextDeadlineDateNotSet = state.hasDeadline && !state.deadlineDate
                                const nextHasErrors = state.hasErrors || conflictsWithTasks
                                if (
                                    currentPublicationDate === nextPublicationDate
                                    && currentDeadlineDate === nextDeadlineDate
                                    && (loadedHomework.hasDeadline ?? false) === state.hasDeadline
                                    && (loadedHomework.isDeadlineStrict ?? false) === state.isDeadlineStrict
                                    && (loadedHomework.deadlineDateNotSet ?? false) === nextDeadlineDateNotSet
                                    && (!!(loadedHomework as HomeworkViewModel & { hasErrors?: boolean }).hasErrors) === nextHasErrors
                                ) {
                                    return
                                }
                                patchHomeworkDraft({
                                    ...loadedHomework,
                                    publicationDate: nextPublicationDate,
                                    hasDeadline: state.hasDeadline,
                                    deadlineDate: nextDeadlineDate,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    deadlineDateNotSet: nextDeadlineDateNotSet,
                                    hasErrors: nextHasErrors,
                                } as unknown as HomeworkViewModel)
                            }}
                        />
                    </Grid>
                </Grid>
                {taskHasErrors && <Grid item xs={12}>
                    <Alert severity={"error"}>Одна или более вложенных задач содержат ошибки</Alert>
                </Grid>}
            </Grid>
            <CardActions>
                {publicationDate && new Date() >= new Date(publicationDate) && <ActionOptionsUI
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
                onSubmit={handleDeleteHomework}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задания'}
                dialogContentText={getHomeworkDeleteMessage(loadedHomework.title || '', initialFilesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </CardContent>
    )
}

const CourseHomeworkExperimental: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    onAddTask: (homework: HomeworkViewModel) => void,
    onStartProcessing: (homeworkId: number,
                        courseUnitType: CourseUnitType,
                        previouslyExistingFilesCount: number,
                        waitingNewFilesCount: number,
                        deletingFilesIds: number[]) => void;
}> = (props) => {
    const isCourseMentor = useIsCourseMentor();
    const processingFilesState = useCourseState(state => state.courseFiles.processingFilesState);
    const draftHomework = useDraftHomework(props.homeworkAndFilesInfo.homework.id!);
    const {startHomeworkEdit} = useCourseActions();

    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredTasks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)

    if (draftHomework) return <CourseHomeworkEditor
        homeworkAndFilesInfo={{homework: draftHomework, filesInfo}}
        onStartProcessing={props.onStartProcessing}
    />

    const openEditor = () => {
        if (homework.id! < 0) return
        startHomeworkEdit(homework.id!)
            .catch(() => {})
    }

    return <CardContent
        onMouseEnter={() => setShowEditMode(isCourseMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Grid item xs={12} container direction={"row"} alignItems={"start"} alignContent={"center"}
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
                        setShowEditMode(false)
                        openEditor()
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
        {filesInfo.length > 0 && (
            <div>
                {processingFilesState[homework.id!]?.isLoading &&
                    <div style={{display: 'flex', alignItems: 'center', color: '#1976d2', fontWeight: '500'}}>
                        <CircularProgress size="20px"/>
                        &nbsp;&nbsp;Обрабатываем файлы...
                    </div>}
                    <FilesPreviewList
                        showOkStatus={isCourseMentor}
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