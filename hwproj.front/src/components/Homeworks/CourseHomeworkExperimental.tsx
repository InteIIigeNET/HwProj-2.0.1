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
import {FC, useState} from "react"
import Utils from "services/Utils";
import {
    HomeworkTaskViewModel, HomeworkViewModel, ActionOptions, GroupViewModel
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
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from "@mui/icons-material/Delete";
import ActionOptionsUI from "components/Common/ActionOptions";
import {DefaultTags, TestTag} from "@/components/Common/HomeworkTags";
import {CourseUnitType} from "../Files/CourseUnitType"
import {useCourseState} from "@/store/hooks";
import {useIsCourseMentor} from "@/store/storeHooks/courseHooks";
import {FilesHandler} from "@/components/Files/FilesHandler";
import {useDraftHomework, getHomeworkDeleteMessage, useHomeworkEditorState} from "@/store/storeHooks/homeworkEditorHooks";
import {useCourseActions} from "@/store/courseActions";
import GroupSelector from "../Common/GroupSelector";
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';

export const taskDeadlineBeforePublicationMessage = (
    task: HomeworkTaskViewModel,
    homework: HomeworkViewModel,
): string | undefined => {
    const homeworkPublication = homework.publicationDateNotSet || !homework.publicationDate
        ? undefined
        : new Date(homework.publicationDate)
    const publication = task.publicationDate ? new Date(task.publicationDate) : homeworkPublication
    const deadline = !task.deadlineDateNotSet && task.deadlineDate ? new Date(task.deadlineDate) : undefined
    if (!publication || !deadline || deadline >= publication) return undefined
    return `Дедлайн задачи раньше ее публикации: ${Utils.renderDateWithoutSeconds(publication)}`
}

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

// Материалы задания: вместо рамки — мягкая подложка, а файлы внутри идут плоскими строками.
// Так блок читается как часть описания, а не как ещё одна карточка внутри карточки
const materialsBoxSx = {
    px: 1.5,
    py: 1.25,
    borderRadius: "12px",
    backgroundColor: "#f7f8fd",
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

// Ограничение действует на всю страницу группы, а не на отдельное поле, поэтому плашка
// прижата к её верхнему краю: без скруглений и без отступов по краям она читается
// как полоса под переключателем, а не как ещё одна карточка над полями
const topAlertSx = {borderRadius: 0}

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
    onGroupsUpdate: () => void;
    groups: GroupViewModel[];
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
    const [page, setPage] = useState<"homework" | "group">("homework")
    const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(loadedHomework.groupId)

    const courseStudents = useCourseState(state => state.course.acceptedStudents) ?? []

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

    const homeworkDeleteFileOptions = {initialFilesInfo}

    const handleDeleteHomework = async () => {
        await deleteHomework(homeworkId, homeworkDeleteFileOptions)
    }

    const cancelEditing = () => {
        cancelHomeworkEdit(loadedHomework.id!)
        props.onDone?.()
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        try {
            await saveHomework(homeworkId, editOptions, homeworkSaveFileOptions) // remove fake homework
        } finally {
            setHandleSubmitLoading(false)
        }
    }

    const taskDeadlineMessage = (loadedHomework.tasks || [])
        .map(task => taskDeadlineBeforePublicationMessage(task, loadedHomework))
        .find((message): message is string => !!message)

    const isDisabled = hasErrors || taskHasErrors || !!taskDeadlineMessage

    return <Box>
        <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={editorHeaderSx}>
            <IconButton
                onClick={cancelEditing}
                disabled={handleSubmitLoading}
                size={"small"}
                color={"error"}
                aria-label={"undo"}
            >
                <UndoIcon fontSize={"small"}/>
            </IconButton>
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
                            error={!loadedHomework.title}
                            value={loadedHomework.title || ''}
                            onChange={(e) => patchHomeworkDraft({...loadedHomework, title: e.target.value})}
                        />
                        <Box sx={{width: "100%", minWidth: 0}}>
                            <Tags tags={loadedHomework.tags || []}
                                  onTagsChange={(tags) => patchHomeworkDraft({...loadedHomework, tags})}
                                  isElementSmall={true}
                                  suggestion={tagSuggestion}
                                  requestTags={() => ApiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                        </Box>
                    </Stack>
                    {(loadedHomework.tags || []).includes(TestTag) &&
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
                                value={loadedHomework.description || ''}
                                onChange={(value) => patchHomeworkDraft({...loadedHomework, description: value})}
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
                            hasDeadline={loadedHomework.hasDeadline ?? false}
                            isDeadlineStrict={loadedHomework.isDeadlineStrict ?? false}
                            publicationDate={publicationDate}
                            deadlineDate={deadlineDate}
                            autoCalculatedDeadline={deadlineSuggestion}
                            disabledPublicationDate={!isNewHomework && isPublished}
                            onChange={(state) => {
                                const nextPublication = state.publicationDate
                                const conflictsWithTasks = changedTaskPublicationDates.some(d => nextPublication && d < nextPublication)
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
                    </Box>
                    {taskDeadlineMessage &&
                        <Alert severity={"error"} sx={alertSx}>
                            {taskDeadlineMessage}
                        </Alert>}
                    {taskHasErrors && !taskDeadlineMessage &&
                        <Alert severity={"error"} sx={alertSx}>
                            Одна или более вложенных задач содержат ошибки
                        </Alert>}
                </Stack>
            </Box>
            <Stack direction={"row"} alignItems={"center"} spacing={1} sx={footerSx}>
                {publicationDate && new Date() >= new Date(publicationDate) && <ActionOptionsUI
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
                onSubmit={handleDeleteHomework}
                isOpen={showDeleteConfirmation}
                dialogTitle={'Удаление задания'}
                dialogContentText={getHomeworkDeleteMessage(loadedHomework.title || '', initialFilesInfo)}
                confirmationWord={''}
                confirmationText={''}
            />
        </Box>}
        {page === "group" && <Box>
            {!isNewHomework &&
                <Alert severity="info" sx={topAlertSx}>
                    Группу нельзя изменить после публикации задания, но состав группы
                    можно менять в любое время
                </Alert>}
            <Box sx={sectionSx}>
                <GroupSelector
                    courseId={courseId}
                    courseStudents={courseStudents}
                    onGroupIdChange={(groupId?: number) => {
                        setSelectedGroupId(groupId)
                        patchHomeworkDraft({...loadedHomework, groupId})
                    }}
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
    onAddTask: (homework: HomeworkViewModel) => void,
    onStartProcessing: (homeworkId: number,
                        courseUnitType: CourseUnitType,
                        previouslyExistingFilesCount: number,
                        waitingNewFilesCount: number,
                        deletingFilesIds: number[]) => void;
    onGroupsUpdate: () => void;
    groups: GroupViewModel[];
}> = (props) => {
    const isCourseMentor = useIsCourseMentor();
    const processingFilesState = useCourseState(state => state.courseFiles.processingFilesState);
    const draftHomework = useDraftHomework(props.homeworkAndFilesInfo.homework.id!);
    const {startHomeworkEdit} = useCourseActions();

    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredTasks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)
    const group = props.groups.find(g => g.id === homework.groupId)
    const isProcessing = processingFilesState[homework.id!]?.isLoading

    if (draftHomework) return <CourseHomeworkEditor
        homeworkAndFilesInfo={{homework: draftHomework, filesInfo}}
        onStartProcessing={props.onStartProcessing}
        onGroupsUpdate={props.onGroupsUpdate}
        groups={props.groups}
    />

    return <Box
        onMouseEnter={() => setShowEditMode(isCourseMentor)}
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
                {isCourseMentor &&
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
                                    setShowEditMode(false)
                                    if (homework.id! < 0) return
                                    startHomeworkEdit(homework.id!).catch(() => {})
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
                    <Box sx={materialsBoxSx}>
                        <Stack direction={"row"} alignItems={"center"} spacing={1} sx={{mb: 0.25}}>
                            <Typography sx={sectionLabelSx}>Материалы</Typography>
                            {isProcessing &&
                                <Stack direction={"row"} alignItems={"center"} spacing={0.75}
                                       sx={{color: "#1976d2"}}>
                                    <CircularProgress size={"14px"}/>
                                    <Typography variant={"caption"} sx={{fontWeight: 500}}>
                                        Обрабатываем файлы...
                                    </Typography>
                                </Stack>}
                        </Stack>
                        <FilesPreviewList
                            flat
                            showOkStatus={isCourseMentor}
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
