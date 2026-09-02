import {
    Alert,
    Badge,
    Box,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import FilesPreviewList from "components/Files/FilesPreviewList";
import {IFileInfo} from "components/Files/IFileInfo";
import {FC, useEffect, useState} from "react"
import Utils from "services/Utils";
import {
    HomeworkViewModel, ActionOptions, HomeworkTaskViewModel, PostTaskViewModel, AccountDataDto, GroupViewModel
} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import Tags from "../Common/Tags";
import apiSingleton from "../../api/ApiSingleton";
import FilesUploader from "../Files/FilesUploader";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from '@mui/icons-material/AddTask';
import {LoadingButton} from "@mui/lab";
import DeletionConfirmation from "../DeletionConfirmation";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionOptionsUI from "components/Common/ActionOptions";
import {BonusTag, DefaultTags, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import Lodash from "lodash";
import {CourseUnitType} from "../Files/CourseUnitType"
import ProcessFilesUtils from "../Utils/ProcessFilesUtils";
import {FilesHandler} from "@/components/Files/FilesHandler";
import GroupSelector from "../Common/GroupSelector";
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";

// Оформление согласовано с редизайном страницы курса: те же радиусы, границы и мягкие плашки
const editorHeaderSx = {
    px: {xs: 2, sm: 2.5},
    py: 0.75,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const detailHeaderSx = {
    px: {xs: 2, sm: 2.5},
    py: 2,
    backgroundColor: "#f7f8fd",
    borderBottom: "1px solid #e6e8f0",
}

const detailTitleSx = {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.3,
    m: 0,
}

const sectionSx = {
    px: {xs: 2, sm: 2.5},
    py: 2.5,
}

// Подпись группы полей: мелкие капсы читаются как служебный текст и не спорят с названиями
const sectionLabelSx = {
    display: "block",
    color: "text.secondary",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
}

const sectionBoxSx = {
    px: 1.5,
    py: 1.5,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

// Редактор markdown задаёт себе внешние отступы инлайном, поэтому гасим их через !important
const markdownEditorSx = {
    "& > div": {marginTop: "8px !important", marginBottom: "0 !important"},
}

// Переключатель страниц редактора: одна дорожка с рамкой вместо двух самостоятельных кнопок,
// активная страница — белая плашка внутри неё, поэтому обводка очерчивает переключатель целиком.
// Радиусы и фон приходится продавливать через !important: MUI сам гасит их у кнопок внутри группы
const pageSwitchSx = {
    p: "3px",
    gap: "3px",
    border: "1px solid #ccd2e6",
    borderRadius: "11px",
    backgroundColor: "#e4e7f3",
    "& .MuiToggleButtonGroup-grouped": {
        px: 1.25,
        py: 0.375,
        gap: 0.75,
        marginLeft: 0,
        border: 0,
        borderRadius: "8px !important",
        color: "text.secondary",
        textTransform: "none",
        fontSize: "0.8125rem",
        fontWeight: 500,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
        "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.08)"},
    },
    "& .MuiToggleButtonGroup-grouped.Mui-selected": {
        color: "#3f51b5",
        backgroundColor: "#fff",
        boxShadow: "0 1px 2px rgba(16, 24, 40, .14)",
        "&:hover": {backgroundColor: "#fff"},
    },
}

const accentChipSx = {
    height: 24,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const metaChipSx = {
    height: 24,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

// Отложенные задачи — состояние «ещё не опубликовано», поэтому нейтрально-тёплая плашка
const deferredChipSx = {
    height: 24,
    backgroundColor: "#fff4d6",
    color: "#8a6d00",
    "& .MuiChip-label": {px: 0.875, fontSize: "0.8125rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.75, mr: -0.25, fontSize: 16, color: "inherit"},
}

const alertSx = {borderRadius: "12px"}

const footerSx = {
    px: {xs: 2, sm: 2.5},
    py: 1.5,
    borderTop: "1px solid #e6e8f0",
    backgroundColor: "#fafbfe",
}

const submitButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    py: 1,
}

const dangerIconButtonSx = {
    flexShrink: 0,
    border: "1px solid #f1d4d4",
    borderRadius: "10px",
}

// Действия появляются при наведении на карточку, но остаются доступными с клавиатуры
const hoverActionSx = {
    flexShrink: 0,
    transition: "opacity .15s",
    "&:focus-within": {opacity: 1},
}

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
    onGroupsUpdate: () => void;
    groups: GroupViewModel[];
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
    const [selectedGroupId, setSelectedGroupId] = useState(loadedHomework.groupId)
    const [courseStudents, setCourseStudents] = useState<AccountDataDto[]>([])
    const [page, setPage] = useState<"homework" | "group">("homework")

    useEffect(() => {
        const loadCourseStudents = async () => {
            try {
                const courseData = await ApiSingleton.coursesApi.coursesGetAllCourseData(courseId)
                setCourseStudents(courseData.course?.acceptedStudents || [])
            } catch (error) {
                console.error('Failed to load course students:', error)
            }
        }
        loadCourseStudents()
    }, [courseId])

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
            groupId: selectedGroupId,
            hasErrors: hasErrors,
            deadlineDateNotSet: metadata.hasDeadline && !metadata.deadlineDate,
            isModified: true,
        }

        props.onUpdate({homework: update})
    }, [title, description, tags, metadata, hasErrors, filesState.selectedFilesInfo, selectedGroupId])

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

        try {
            const update = {
                homeworkId: homeworkId,
                title: title!,
                description: description,
                tags: tags,
                hasDeadline: metadata.hasDeadline,
                deadlineDate: metadata.deadlineDate,
                isDeadlineStrict: metadata.isDeadlineStrict,
                publicationDate: metadata.publicationDate,
                groupId: selectedGroupId,
                actionOptions: editOptions,
                tasks: isNewHomework ? homework.tasks!.map(t => {
                    const task: PostTaskViewModel = {
                        ...t,
                        title: t.title!,
                        maxRating: t.maxRating!,
                        criteria: t.criteria || []
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
        } catch (error) {
            const errors = await ErrorsHandler.getErrorMessages(error as Response, "errors");
            enqueueSnackbar(errors[0] || "Не удалось сохранить задание", {
                variant: "error",
                autoHideDuration: 4000,
            });
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const isDisabled = hasErrors || !isLoaded || taskHasErrors

    return <Box>
        <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={editorHeaderSx}>
            <EditOutlinedIcon fontSize={"small"}/>
            <Typography variant={"body2"} sx={{fontWeight: 500, display: {xs: "none", sm: "block"}}}>
                {isNewHomework ? "Новое задание" : "Редактирование задания"}
            </Typography>
            <Box sx={{flexGrow: 1}}/>
            <ToggleButtonGroup
                size={"small"}
                value={page}
                exclusive
                onChange={(_, x) => {
                    if (x === "homework" || x === "group") setPage(x)
                }}
                sx={pageSwitchSx}
            >
                <ToggleButton value="homework">
                    <AssignmentIcon sx={{fontSize: 17}}/>
                    Задание
                </ToggleButton>
                <ToggleButton value="group">
                    <Badge badgeContent={selectedGroupId != undefined ? 1 : 0} variant="dot" color={"primary"}
                           showZero={false}>
                        <GroupIcon sx={{fontSize: 17}}/>
                    </Badge>
                    Группа
                </ToggleButton>
            </ToggleButtonGroup>
        </Stack>
        <Divider/>
        {page === "homework" && <Box>
            <Box sx={sectionSx}>
                <Stack direction={"column"} spacing={2.5}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} alignItems={"flex-start"}>
                        <TextField
                            required
                            fullWidth
                            size={"small"}
                            label="Название задания"
                            variant="outlined"
                            sx={{...inputSx, maxWidth: {sm: 320}}}
                            error={!title}
                            value={title}
                            onChange={(e) => {
                                e.persist()
                                setHasErrors(prevState => prevState || !e.target.value)
                                setTitle(e.target.value)
                            }}
                        />
                        <Box sx={{width: "100%", minWidth: 0}}>
                            <Tags tags={tags} onTagsChange={setTags} isElementSmall={true}
                                  suggestion={tagSuggestion}
                                  requestTags={() => apiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                        </Box>
                    </Stack>
                    {tags.includes(TestTag) &&
                        <Alert severity="info" variant={"outlined"} sx={alertSx}>
                            Вы можете сгруппировать контрольные работы и переписывания с помощью
                            дополнительного тега. Например, 'КР 1'
                        </Alert>}
                    <Box>
                        <Typography sx={sectionLabelSx}>Общее описание задания</Typography>
                        <Box sx={markdownEditorSx}>
                            <MarkdownEditor
                                label={"Общее описание задания"}
                                height={240}
                                maxHeight={400}
                                value={description}
                                onChange={(value) => {
                                    setDescription(value)
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={sectionBoxSx}>
                        <Typography sx={{...sectionLabelSx, mb: 0.5}}>Материалы</Typography>
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
                    </Box>
                    <Box sx={sectionBoxSx}>
                        <Typography sx={{...sectionLabelSx, mb: 0.5}}>Даты задания</Typography>
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
                    </Box>
                    {taskHasErrors &&
                        <Alert severity={"error"} sx={alertSx}>
                            Одна или более вложенных задач содержат ошибки
                        </Alert>}
                </Stack>
            </Box>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={footerSx}>
                {metadata.publicationDate && new Date() >= new Date(metadata.publicationDate) && <ActionOptionsUI
                    disabled={isDisabled || handleSubmitLoading}
                    onChange={value => setEditOptions(value)}/>}
                <LoadingButton
                    fullWidth
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disableElevation
                    type="submit"
                    disabled={isDisabled}
                    loadingPosition="end"
                    size={"large"}
                    endIcon={<span style={{width: 17}}/>}
                    loading={handleSubmitLoading}
                    sx={submitButtonSx}
                >
                    {isNewHomework && "Добавить задание"}
                    {!isNewHomework && "Редактировать задание " + (editOptions.sendNotification ? "с уведомлением" : "без уведомления")}
                </LoadingButton>
                <Tooltip arrow title={"Удалить задание"}>
                    <IconButton aria-label="delete" color="error" sx={dangerIconButtonSx}
                                onClick={() => setShowDeleteConfirmation(true)}>
                        <DeleteIcon fontSize={"small"}/>
                    </IconButton>
                </Tooltip>
            </Stack>
            <DeletionConfirmation
                onCancel={() => setShowDeleteConfirmation(false)}
                onSubmit={deleteHomework}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задания'}
                dialogContentText={getDeleteMessage(homework.title!, initialFilesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </Box>}
        {page === "group" && <Box>
            <Box sx={sectionSx}>
                <GroupSelector
                    courseId={courseId}
                    courseStudents={courseStudents}
                    onGroupIdChange={(groupId?: number) => setSelectedGroupId(groupId)}
                    selectedGroupId={selectedGroupId}
                    choiceDisabled={!isNewHomework}
                    onGroupsUpdate={props.onGroupsUpdate}
                    groups={props.groups}
                />
            </Box>
            {!isNewHomework && !isPublished &&
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={footerSx}>
                    <LoadingButton
                        fullWidth
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disableElevation
                        type="submit"
                        disabled={isDisabled}
                        loadingPosition="end"
                        size={"large"}
                        endIcon={<span style={{width: 17}}/>}
                        loading={handleSubmitLoading}
                        sx={submitButtonSx}
                    >
                        {"Редактировать задание"}
                    </LoadingButton>
                </Stack>}
        </Box>}
    </Box>
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
    onGroupsUpdate: () => void;
    groups: GroupViewModel[];
}> = (props) => {
    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredTasks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const group = props.groups.find(g => g.id === homework.groupId)

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
        onGroupsUpdate={props.onGroupsUpdate}
        groups={props.groups}
    />

    return <Box
        onMouseEnter={() => setShowEditMode(props.isMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Box sx={detailHeaderSx}>
            <Stack direction={"row"} alignItems={"flex-start"} spacing={1}>
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Typography component={"h2"} className={"antiLongWords"} sx={detailTitleSx}>
                        {homework.title}
                    </Typography>
                    <Stack direction={"row"} spacing={0.75} useFlexGap flexWrap={"wrap"} sx={{mt: 1}}>
                        {tasksCount > 0 &&
                            <Chip
                                size={"small"}
                                icon={<AssignmentOutlinedIcon/>}
                                label={tasksCount + " "
                                    + Utils.pluralizeHelper(["Задача", "Задачи", "Задач"], tasksCount)}
                                sx={metaChipSx}/>}
                        {deferredTasks.length > 0 &&
                            <Tooltip arrow title={"Отложенные задачи"}>
                                <Chip
                                    size={"small"}
                                    icon={<ScheduleIcon/>}
                                    label={deferredTasks.length + " "
                                        + Utils.pluralizeHelper(["отложенная", "отложенные", "отложенных"], deferredTasks.length)}
                                    sx={deferredChipSx}/>
                            </Tooltip>}
                        {homework.tags?.filter(t => DefaultTags.includes(t)).map((tag, index) => (
                            <Chip key={index} size={"small"} label={tag} sx={accentChipSx}/>
                        ))}
                        {group &&
                            <Tooltip arrow title={"Командная работа"}>
                                <Chip size={"small"} icon={<GroupIcon/>} label={group.name} sx={metaChipSx}/>
                            </Tooltip>}
                    </Stack>
                </Box>
                {props.isMentor &&
                    <Stack direction={"row"} spacing={0.5}
                           sx={{...hoverActionSx, opacity: showEditMode ? 1 : 0}}>
                        <Tooltip placement={"left"} arrow title={"Добавить задачу"}>
                            <IconButton
                                size={"small"}
                                onClick={() => props.onAddTask(homework)}
                            >
                                <AddTaskIcon color={"primary"} sx={{fontSize: 18}}/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip placement={"left"} arrow title={"Редактировать задание"}>
                            <IconButton
                                size={"small"}
                                onClick={() => {
                                    setEditMode(true)
                                    setShowEditMode(false)
                                }}>
                                <EditIcon color={"primary"} sx={{fontSize: 18}}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>}
            </Stack>
        </Box>

        <Box sx={sectionSx}>
            <Stack direction={"column"} spacing={2}>
                {homework.description
                    ? <Typography component="div" style={{color: "#454545"}} variant="body1">
                        <MarkdownPreview value={homework.description!}/>
                    </Typography>
                    : <Typography variant={"body2"} sx={{color: "text.disabled", fontStyle: "italic"}}>
                        Описание задания не заполнено
                    </Typography>}
                {filesInfo.length > 0 &&
                    <Box sx={sectionBoxSx}>
                        <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{mb: 0.5}}>
                            <Typography sx={sectionLabelSx}>Материалы</Typography>
                            {props.isProcessing &&
                                <Stack direction={"row"} alignItems={"center"} spacing={0.75}
                                       sx={{color: "#1976d2"}}>
                                    <CircularProgress size={"14px"}/>
                                    <Typography variant={"caption"} sx={{fontWeight: 500}}>
                                        Обрабатываем файлы...
                                    </Typography>
                                </Stack>}
                        </Stack>
                        <FilesPreviewList
                            showOkStatus={props.isMentor}
                            filesInfo={filesInfo}
                            onClickFileInfo={async (fileInfo: IFileInfo) => {
                                const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.id!);
                                window.open(url, '_blank');
                            }}
                        />
                    </Box>}
            </Stack>
        </Box>
    </Box>
}
export default CourseHomeworkExperimental;
