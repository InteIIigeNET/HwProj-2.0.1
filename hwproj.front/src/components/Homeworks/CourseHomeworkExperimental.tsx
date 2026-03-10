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
import {FC, useEffect, useMemo, useState} from "react"
import Utils from "services/Utils";
import {
    HomeworkViewModel, ActionOptions, HomeworkTaskViewModel, PostTaskViewModel
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
import {BonusTag, DefaultTags, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import Lodash from "lodash";
import {CourseUnitType} from "../Files/CourseUnitType"
import ProcessFilesUtils from "../Utils/ProcessFilesUtils";
import {useCourseState} from "@/store/hooks";
import {useIsCourseMentor} from "@/store/courseHooks";
import {FilesHandler} from "@/components/Files/FilesHandler";
import {useEditingSelection} from "@/store/courseEditingHooks";
import {useDraftHomework, useHomeworkEditing, getHomeworkDeleteMessage} from "@/store/homeworkEditorHooks";

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
    const homework = props.homeworkAndFilesInfo.homework
    const isNewHomework = homework.id! < 0
    const homeworks = useCourseState(state => state.homeworks.items)
    const draft = useDraftHomework(homework.id!)
    const {
        startEditingHomework,
        updateDraftHomework,
        commitHomework,
        commitHomeworkDeletion,
        cancelHomeworkEdit,
        loadHomeworkForEditing,
        submitHomeworkApi,
        deleteHomeworkApi,
    } = useHomeworkEditing()
    const {select} = useEditingSelection()

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editOptions, setEditOptions] = useState<ActionOptions>({sendNotification: false})

    const {filesState, setFilesState, handleFilesChange} = FilesHandler(props.homeworkAndFilesInfo.filesInfo)
    const initialFilesInfo = props.homeworkAndFilesInfo.filesInfo.filter(x => x.id !== undefined)

    useEffect(() => {
        if (draft || homework.id! < 0) return
        loadHomeworkForEditing(homework.id!)
            .then(loaded => startEditingHomework(loaded))
            .catch(() => {})
    }, [homework.id, draft, startEditingHomework, loadHomeworkForEditing])

    const loadedHomework = draft ?? homework
    const homeworkId = loadedHomework.id!
    const courseId = loadedHomework.courseId!
    const publicationDate = loadedHomework.publicationDateNotSet || !loadedHomework.publicationDate
        ? undefined
        : new Date(loadedHomework.publicationDate!)
    const deadlineDate = loadedHomework.deadlineDateNotSet || !loadedHomework.deadlineDate
        ? undefined
        : new Date(loadedHomework.deadlineDate!)
    const isPublished = !loadedHomework.isDeferred
    const changedTaskPublicationDates = (loadedHomework.tasks || [])
        .filter(t => t.publicationDate != null)
        .map(t => new Date(t.publicationDate!))
    const taskHasErrors = (homework.tasks || []).some((x: HomeworkTaskViewModel & { hasErrors?: boolean }) => x.hasErrors === true)
    const hasErrors = !loadedHomework.title || !!(loadedHomework as HomeworkViewModel & { hasErrors?: boolean }).hasErrors

    const deadlineSuggestion = useMemo(() => {
        if (!isNewHomework || !publicationDate) return undefined
        const isTest = (loadedHomework.tags || []).includes(TestTag)
        const isBonus = (loadedHomework.tags || []).includes(BonusTag)
        type DateCandidate = { deadlineDate: Date; daysDiff: number }
        const mapped: DateCandidate[] = homeworks
            .filter(x => {
                const xIsTest = isTestWork(x)
                const xIsBonus = isBonusWork(x)
                return x.id! > 0 && x.hasDeadline && (isTest && xIsTest || isBonus && xIsBonus || !isTest && !isBonus && !xIsTest && !xIsBonus)
            })
            .map(x => ({
                deadlineDate: new Date(x.deadlineDate!),
                daysDiff: Math.floor((new Date(x.deadlineDate!).getTime() - new Date(x.publicationDate!).getTime()) / (1000 * 3600 * 24))
            }))
        const dateCandidate = Lodash(mapped)
            .groupBy((x: DateCandidate) => [x.daysDiff, x.deadlineDate.getHours(), x.deadlineDate.getMinutes()])
            .entries()
            .sortBy((x: [string, DateCandidate[]]) => x[1].length)
            .last()?.[1][0]
        if (!dateCandidate) return undefined
        const out = new Date(publicationDate)
        out.setDate(out.getDate() + dateCandidate.daysDiff)
        out.setHours(dateCandidate.deadlineDate.getHours(), dateCandidate.deadlineDate.getMinutes(), 0, 0)
        return out
    }, [isNewHomework, publicationDate, loadedHomework.tags, homeworks])

    const tagSuggestion = useMemo(() => {
        const title = (loadedHomework.title || '').toLowerCase()
        const tags = loadedHomework.tags || []
        if (tags.includes(TestTag)) return undefined
        return (title.includes("контрольн") || title.includes("проверочн") || title.includes("переписывание") || title.includes("тест")) ? TestTag : undefined
    }, [loadedHomework.title, loadedHomework.tags])

    const deleteHomework = async () => {
        await deleteHomeworkApi(homeworkId, isNewHomework)
        const deletingFileIds = initialFilesInfo.filter(fileInfo => fileInfo.id).map(fileInfo => fileInfo.id!)
        await ProcessFilesUtils.processFilesWithErrorsHadling({
            courseId: courseId!,
            courseUnitType: CourseUnitType.Homework,
            courseUnitId: homeworkId,
            deletingFileIds: deletingFileIds,
            newFiles: []
        })
        commitHomeworkDeletion(homeworkId)
        select({isHomework: true, id: undefined})
    }

    const cancelEditing = () => {
        cancelHomeworkEdit(homework.id!, isNewHomework)
        props.onDone?.()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            const update = {
                title: loadedHomework.title!,
                description: loadedHomework.description,
                tags: loadedHomework.tags || [],
                hasDeadline: loadedHomework.hasDeadline,
                deadlineDate: deadlineDate,
                isDeadlineStrict: loadedHomework.isDeadlineStrict,
                publicationDate: publicationDate,
                actionOptions: editOptions,
                tasks: isNewHomework ? (homework.tasks || []).map(t => ({
                    ...t,
                    title: t.title!,
                    maxRating: t.maxRating!
                } as PostTaskViewModel)) : []
            }

            const updatedHomework = await submitHomeworkApi(courseId!, homeworkId, isNewHomework, update)

            const updatedHomeworkId = updatedHomework.value!.id!
            await handleFilesChange(
                courseId, CourseUnitType.Homework, updatedHomeworkId,
                props.onStartProcessing,
                () => {
                    commitHomework(homework.id!, updatedHomework.value!)
                    select({isHomework: true, id: updatedHomeworkId})
                    props.onDone?.()
                },
            )
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const isDisabled = hasErrors || taskHasErrors

    if (!draft) return null

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
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
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
                        onChange={(e) => updateDraftHomework({ ...draft!, title: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6} style={{marginTop: 6}}>
                    <Tags
                        tags={loadedHomework.tags || []}
                        onTagsChange={(tags) => updateDraftHomework({ ...draft!, tags })}
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
                        onChange={(value) => updateDraftHomework({ ...draft!, description: value })}
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
                                updateDraftHomework({
                                    ...draft!,
                                    publicationDate: state.publicationDate,
                                    hasDeadline: state.hasDeadline,
                                    deadlineDate: state.deadlineDate,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    deadlineDateNotSet: state.hasDeadline && !state.deadlineDate,
                                    hasErrors: state.hasErrors || conflictsWithTasks,
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
                onSubmit={deleteHomework}
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
    const draft = useDraftHomework(props.homeworkAndFilesInfo.homework.id!);
    const {loadHomeworkForEditing, startEditingHomework} = useHomeworkEditing();

    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredTasks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)

    if (draft) return <CourseHomeworkEditor
        homeworkAndFilesInfo={{homework, filesInfo}}
        onStartProcessing={props.onStartProcessing}
    />

    const openEditor = () => {
        if (homework.id! < 0) return
        loadHomeworkForEditing(homework.id!)
            .then(loaded => startEditingHomework(loaded))
            .catch(() => {})
    }

    return <CardContent
        onMouseEnter={() => setShowEditMode(isCourseMentor)}
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