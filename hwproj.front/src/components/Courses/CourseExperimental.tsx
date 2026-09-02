import * as React from "react";
import {
    FileInfoDTO, GroupViewModel,
    HomeworkTaskViewModel,
    HomeworkViewModel, SolutionDto, StatisticsCourseMatesModel,
} from "@/api";
import {
    AlertTitle,
    Box,
    Button,
    Collapse,
    Divider,
    Fab,
    IconButton,
    ListItemButton,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from "@mui/material";
import {FC, useEffect, useState} from "react";
import {Alert, Card, CardActions, Chip, Paper, Stack, Tooltip} from "@mui/material";
import {Link} from "react-router-dom";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import {BonusTag, DefaultTags, getTip, isBonusWork, isTestWork, TestTag} from "../Common/HomeworkTags";
import FileInfoConverter from "components/Utils/FileInfoConverter";
import CourseHomeworkExperimental from "components/Homeworks/CourseHomeworkExperimental";
import CourseTaskExperimental from "../Tasks/CourseTaskExperimental";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from '@mui/icons-material/Error';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import Lodash from "lodash";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import GroupIcon from '@mui/icons-material/Group';

// Оформление списка заданий согласовано с редизайном страницы курса и списка курсов
const listPanelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const listHeaderSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const headerChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const countChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const filterBarSx = {
    px: 1.5,
    py: 0.75,
    backgroundColor: "#fff8e6",
    color: "#8a6d00",
}

const listScrollSx = {
    p: 1,
    overflowY: "auto" as const,
    maxHeight: {xs: "none", md: "70vh"},
    "&::-webkit-scrollbar": {width: "6px"},
    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
    "&::-webkit-scrollbar-thumb": {backgroundColor: "#c4cad2", borderRadius: "3px"},
    "&::-webkit-scrollbar-thumb:hover": {backgroundColor: "#a8b0d8"},
}

const emptyStateSx = {
    py: 3,
    px: 2,
    textAlign: "center" as const,
    color: "text.secondary",
}

const rowSx = {
    px: 1.25,
    gap: 1,
    borderRadius: "10px",
    alignItems: "center" as const,
    transition: "background-color .15s",
    "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.06)"},
    "&.Mui-selected": {
        backgroundColor: "rgba(63, 81, 181, 0.14)",
        "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.18)"},
    },
}

// Непрерывная линия таймлайна: внутри задания связывает его задачи, а между заданиями
// продолжается в промежуток, поэтому список читается как одна лента, а не как набор блоков.
// Отступы подобраны под центры маркеров: 18px — центр строки задания, 19px — центр последней задачи.
const railSx = (isFirst: boolean, isLast: boolean, hasTasks: boolean) => ({
    position: "absolute" as const,
    left: 25,
    width: "2px",
    backgroundColor: "#e3e6ee",
    borderRadius: "1px",
    top: isFirst ? 20 : 0,
    bottom: isLast
        ? (hasTasks ? 17 : "calc(100% - 20px)")
        : -14,
})

// Задание — крупный узел ленты, задача — мелкий: так видна вложенность
const homeworkDotSx = {
    width: 12,
    height: 12,
    flexShrink: 0,
    borderRadius: "50%",
}

const taskMarkerSx = {
    width: 32,
    flexShrink: 0,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
}

// Колонки раскладки: Grid container со spacing нельзя вкладывать в Stack со spacing —
// Stack ставит детям margin: 0 и стирает отрицательные отступы Grid, из-за чего колонка съезжает
const columnSx = (share: number) => ({
    width: "100%",
    minWidth: 0,
    flex: {md: `${share} 1 0`},
})

const taskDotSx = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "2px solid",
    backgroundColor: "#fff",
}

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    courseFilesInfo: FileInfoDTO[]
    studentSolutions: StatisticsCourseMatesModel[]
    courseId: number
    isMentor: boolean
    isStudentAccepted: boolean
    userId: string
    selectedHomeworkId: number | undefined
    onHomeworkUpdate: (update: { homework: HomeworkViewModel } & {
        isDeleted?: boolean
    }) => void
    onTaskUpdate: (update: { task: HomeworkTaskViewModel, isDeleted?: boolean }) => void,
    processingFiles: {
        [homeworkId: number]: {
            isLoading: boolean;
        };
    };
    onStartProcessing: (homeworkId: number,
                        courseUnitType: CourseUnitType,
                        previouslyExistingFilesCount: number,
                        waitingNewFilesCount: number,
                        deletingFilesIds: number[]) => void;
    onGroupsUpdate: () => void;
    groups: GroupViewModel[];
}

interface ICourseExperimentalState {
    initialEditMode: boolean,
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
    }
}

export const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const [hideDeferred, setHideDeferred] = useState<boolean>(false)
    const [showOnlyGroupedTest, setShowOnlyGroupedTest] = useState<string | undefined>(undefined)
    const filterAdded = hideDeferred || showOnlyGroupedTest !== undefined

    const [showSearch, setShowSearch] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")

    // Определяем разрешение экрана пользователя
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Состояние для кнопки "Наверх"
    const [showScrollButton, setShowScrollButton] = useState(false);

    const homeworks = props.homeworks.slice().reverse().filter(x => {
        if (hideDeferred) return !x.isDeferred
        if (showOnlyGroupedTest !== undefined) return x.tags!.includes(TestTag) && x.tags!.includes(showOnlyGroupedTest)
        return true
    })

    const {isMentor, studentSolutions, isStudentAccepted, userId, selectedHomeworkId, courseFilesInfo} = props

    const [state, setState] = useState<ICourseExperimentalState>({
        initialEditMode: false,
        selectedItem: {id: undefined, isHomework: true},
    })

    useEffect(() => {
        const defaultHomeworkIndex = Math.max(selectedHomeworkId ? homeworks?.findIndex(x => x.id === selectedHomeworkId) : 0, 0)
        const defaultHomework = homeworks?.[defaultHomeworkIndex]
        setState((prevState) => ({
            ...prevState,
            selectedItem: {isHomework: true, id: defaultHomework?.id},
        }))
    }, [hideDeferred])

    // Обработчик прокрутки страницы
    useEffect(() => {
        const handleScroll = () => {
            // Показывать кнопку при прокрутке ниже 400px
            const shouldShow = window.scrollY > 400;
            if (shouldShow !== showScrollButton) {
                setShowScrollButton(shouldShow);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showScrollButton]);

    // Функция прокрутки вверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 110,
            behavior: 'instant'
        });
    };

    const initialEditMode = state.initialEditMode
    const {id, isHomework} = state.selectedItem

    const renderDate = (date: Date) => {
        date = new Date(date)
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleString("ru-RU", options)
    }

    const renderTime = (date: Date) => {
        date = new Date(date)
        const options: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit"
        };
        return date.toLocaleString("ru-RU", options)
    }

    // В узкой колонке списка нужна компактная дата: "12 сент." вместо "12 сентября"
    const renderShortDate = (date: Date) => {
        date = new Date(date)
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleString("ru-RU", options)
    }

    const isRowSelected = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id

    const taskSolutionsMap = new Map<number, SolutionDto[]>()

    if (!isMentor && isStudentAccepted) {
        studentSolutions
            .filter(t => t.id === userId)
            .flatMap(t => t.homeworks!)
            .flatMap(t => t.tasks!)
            .forEach(x => taskSolutionsMap.set(x.id!, x.solutions!))
    }

    const showWarningsForEntity = (entity: HomeworkViewModel | HomeworkTaskViewModel, isHomework: boolean) => {
        if (!isMentor) return false
        if (entity.publicationDateNotSet || entity.hasDeadline && entity.deadlineDateNotSet) return true

        if (!isHomework) return false
        const result = validateTestGrouping(entity)
        return result !== true && result.hasErrors
    }

    // Расшифровываем предупреждение в подсказке, чтобы преподаватель сразу понимал, что именно не заполнено
    const getWarningTitle = (entity: HomeworkViewModel | HomeworkTaskViewModel, isHomeworkEntity: boolean) => {
        if (entity.publicationDateNotSet) return "Не выставлена дата публикации"
        if (entity.hasDeadline && entity.deadlineDateNotSet) return "Не выставлена дата дедлайна"
        if (isHomeworkEntity) {
            const result = validateTestGrouping(entity)
            if (result !== true && result.hasErrors)
                return `Контрольные работы с ключом «${result.groupingTag}» отличаются по количеству задач или баллам`
        }
        return "Проверьте настройки"
    }

    const renderWarningIcon = (entity: HomeworkViewModel | HomeworkTaskViewModel, isHomeworkEntity: boolean) =>
        <Tooltip arrow title={getWarningTitle(entity, isHomeworkEntity)}>
            <WarningAmberRoundedIcon fontSize="small" sx={{flexShrink: 0, color: "#ed6c02"}}/>
        </Tooltip>

    const renderHomeworkStatus = (homework: HomeworkViewModel & { isModified?: boolean, hasErrors?: boolean }) => {
        const hasErrors = homework.id! < 0 && (homework.hasErrors || homework.tasks!.some((t: HomeworkTaskViewModel & {
            hasErrors?: boolean
        }) => t.hasErrors))
        if (hasErrors)
            return <Tooltip arrow title={"Заполнены не все обязательные поля"}>
                <ErrorIcon fontSize="small" color={"error"} sx={{flexShrink: 0}}/>
            </Tooltip>
        if (homework.isModified)
            return <Tooltip arrow title={"Есть несохранённые изменения"}>
                <EditIcon fontSize="small" color={"primary"} sx={{flexShrink: 0}}/>
            </Tooltip>
        return showWarningsForEntity(homework, true) ? renderWarningIcon(homework, true) : null
    }

    const renderTaskStatus = (task: HomeworkTaskViewModel & { isModified?: boolean, hasErrors?: boolean }) => {
        if (taskSolutionsMap.has(task.id!)) {
            const solutions = taskSolutionsMap.get(task.id!)
            const {
                lastSolution,
                lastRatedSolution,
                color,
                solutionsDescription
            } = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, task.maxRating!)
            if (lastSolution != null) return (
                <Tooltip arrow disableInteractive enterDelay={1000}
                         title={<span style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
                    <Chip size={"small"}
                          label={lastRatedSolution == null ? "?" : lastRatedSolution.rating}
                          sx={{
                              backgroundColor: color,
                              height: 22,
                              minWidth: 30,
                              fontWeight: 500,
                              "& .MuiChip-label": {px: 0.75},
                          }}/>
                </Tooltip>
            )
        }
        if (task.hasErrors) return <Tooltip arrow title={"Заполнены не все обязательные поля"}>
            <ErrorIcon fontSize="small" color={"error"}/>
        </Tooltip>
        if (task.isModified) return <Tooltip arrow title={"Есть несохранённые изменения"}>
            <EditIcon fontSize="small" color={"primary"}/>
        </Tooltip>
        if (showWarningsForEntity(task, false)) return renderWarningIcon(task, false)
        return <Box sx={{...taskDotSx, borderColor: task.isDeferred ? "#dcdfe6" : "#a8b0d8"}}/>
    }

    // Узел задания: если есть статус (ошибка, правки, предупреждение) — он занимает место узла
    const renderHomeworkNode = (homework: HomeworkViewModel & { isModified?: boolean, hasErrors?: boolean }) => {
        const status = isMentor ? renderHomeworkStatus(homework) : null
        if (status !== null) return status
        return <Box sx={{...homeworkDotSx, backgroundColor: homework.isDeferred ? "#c9cedb" : "#3f51b5"}}/>
    }

    // Дедлайн задачи в списке: близкий срок подсвечивается только тому студенту, который ещё ничего не сдал
    const renderTaskDeadline = (task: HomeworkTaskViewModel) => {
        if (task.deadlineDateNotSet || !task.deadlineDate) return null
        const deadline = new Date(task.deadlineDate).getTime()
        const now = Date.now()
        const hasSolution = (taskSolutionsMap.get(task.id!)?.length ?? 0) > 0
        const isSoon = !isMentor && !hasSolution && deadline > now && deadline - now <= 3 * 24 * 60 * 60 * 1000
        return (
            <Stack direction={"row"} alignItems={"center"} spacing={0.25}
                   sx={{flexShrink: 0, color: isSoon ? "warning.main" : "text.secondary"}}>
                {isSoon && <ScheduleIcon sx={{fontSize: 14}}/>}
                <Typography variant={"caption"} sx={{whiteSpace: "nowrap", fontWeight: isSoon ? 500 : 400}}>
                    {renderShortDate(task.deadlineDate) + ", " + renderTime(task.deadlineDate)}
                </Typography>
            </Stack>
        )
    }

    // Студенту показываем набранные за задание баллы, преподавателю — количество задач
    const renderHomeworkCounter = (homework: HomeworkViewModel) => {
        const tasksCount = homework.tasks!.length
        if (isMentor) return tasksCount > 0
            ? <Tooltip arrow title={"Задач в задании"}>
                <Chip size={"small"} label={tasksCount} sx={countChipSx}/>
            </Tooltip>
            : null

        let maxSum = 0
        let ratingSum = 0
        let ratedCount = 0
        homework.tasks!.forEach(t => {
            const solutions = taskSolutionsMap.get(t.id!)
            if (solutions === undefined) return
            maxSum += t.maxRating ?? 0
            const {lastRatedSolution} = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions, t.maxRating!)
            if (lastRatedSolution == null) return
            ratingSum += lastRatedSolution.rating ?? 0
            ratedCount++
        })
        if (ratedCount === 0) return null
        return <Tooltip arrow title={"Набрано баллов за задание"}>
            <Chip size={"small"} label={ratingSum + " / " + maxSum} sx={countChipSx}/>
        </Tooltip>
    }

    const onSelectedItemMount = () =>
        setState((prevState) => ({
            ...prevState,
            initialEditMode: false,
        }))

    const toEditHomework = (homework: HomeworkViewModel) =>
        setState({
            initialEditMode: true,
            selectedItem: {id: homework.id!, isHomework: true},
        })

    const validateTestGrouping = (homework: HomeworkViewModel) => {
        if (!homework.tags!.includes(TestTag)) return true

        const groupingTag = homework.tags!.find(x => !DefaultTags.includes(x))
        if (groupingTag === undefined) return true

        const groupedHomeworks = homeworks.filter(x => x.tags!.includes(TestTag) && x.tags!.includes(groupingTag))
        if (groupedHomeworks.length === 1) return true

        const keys = new Set(groupedHomeworks.map(h => h.tasks!.map(t => t.maxRating).join(";")))
        return {groupingTag: groupingTag, hasErrors: keys.size !== 1}
    }

    const getDatesAlert = (entity: HomeworkViewModel | HomeworkTaskViewModel, isHomework: boolean) => {
        if (entity.publicationDateNotSet) {
            return (
                <Alert severity="warning">
                    {"Не выставлена дата публикации"}
                </Alert>
            )
        }

        if (isMentor && entity.hasDeadline && entity.deadlineDateNotSet) return (
            <Alert severity="warning">
                {"Не выставлена дата дедлайна"}
            </Alert>
        )

        if (entity.id! < 0) {
            if (isHomework)
                return <Alert severity="info">Новое задание будет добавлено после нажатия на 'Добавить задание'</Alert>
            if ((entity as HomeworkTaskViewModel)?.homeworkId! < 0)
                return <Alert severity="info"
                              action={
                                  <Button
                                      color="inherit"
                                      size="small"
                                      onClick={() => setState((prevState) => ({
                                          ...prevState,
                                          selectedItem: {
                                              isHomework: true,
                                              id: (entity as HomeworkTaskViewModel).homeworkId!
                                          }
                                      }))}
                                  >
                                      Перейти к заданию
                                  </Button>}>Часть добавления нового задания</Alert>
            return <Alert severity="info">Новая задача будет добавлена после нажатия на 'Добавить задачу'</Alert>
        }

        if (entity.isDeferred) return (
            <Alert severity="info"
                   action={
                       <Button
                           color="inherit"
                           size="small"
                           onClick={() => setHideDeferred(true)}
                       >
                           Скрыть неопубликованное
                       </Button>}>
                {isHomework ? "Задание будет опубликовано " : "Задача будет опубликована "}
                {renderDate(entity.publicationDate!) + " " + renderTime(entity.publicationDate!)}
            </Alert>
        )
    }
    const getGroupingAlert = (homework: HomeworkViewModel) => {
        const result = validateTestGrouping(homework)
        if (result === true) return null
        const {hasErrors, groupingTag} = result
        if (!hasErrors) return <Alert severity="success"
                                      action={
                                          <Button
                                              fullWidth
                                              color="inherit"
                                              size="small"
                                              onClick={() => setShowOnlyGroupedTest(groupingTag)}
                                          >
                                              Задания
                                          </Button>}>
            Работа сгруппирована по ключу '<b>{groupingTag}</b>'.
        </Alert>

        return <Alert severity="warning"
                      action={
                          <Button
                              fullWidth
                              color="inherit"
                              size="small"
                              onClick={() => setShowOnlyGroupedTest(groupingTag)}
                          >
                              Задания
                          </Button>}>
            <AlertTitle>Группировка контрольных работ</AlertTitle>
            Создано несколько контрольных работ, сгруппированных по ключу '<b>{groupingTag}</b>',
            однако работы отличаются между собой по количеству задач или их максимальным баллам.
            <br/>
            <br/>
            Количество задач должно быть <b>одинаковым</b>, а баллы между соответствующими задачами <b>равными</b>.
        </Alert>
    }

    const searchQuery = search.trim().toLowerCase()

    // Поиск сужает только список слева: остальная логика (группировка КР, подбор баллов) считает по всем заданиям
    const visibleHomeworks = searchQuery === ""
        ? homeworks
        : homeworks.filter(x => x.id! < 0
            || (x.title ?? "").toLowerCase().includes(searchQuery)
            || x.tasks!.some(t => (t.title ?? "").toLowerCase().includes(searchQuery)))

    const selectedItemHomework = isHomework
        ? homeworks.find(x => x.id === id)!
        : homeworks.find(x => x.tasks!.some(t => t.id === id))!

    const selectedItem = isHomework
        ? selectedItemHomework
        : selectedItemHomework?.tasks!.find(x => x.id === id) as HomeworkTaskViewModel

    const [newTaskCounter, setNewTaskCounter] = useState<number>(-1)

    const addNewHomework = () => {
        props.onHomeworkUpdate({
            homework: {
                courseId: props.courseId,
                title: "Новое задание",
                publicationDateNotSet: false,
                publicationDate: undefined,
                hasDeadline: false,
                id: -1,
                isGroupWork: false,
                deadlineDateNotSet: false,
                deadlineDate: undefined,
                isDeadlineStrict: false,
                description: "",
                tasks: [],
                tags: []
            }
        })
        setState((prevState) => ({
            ...prevState,
            selectedItem: {
                isHomework: true,
                id: -1
            }
        }))
    }

    const addNewTask = (homework: HomeworkViewModel) => {
        const id = newTaskCounter
        const tags = homework.tags!
        const isTest = tags.includes(TestTag)
        const isBonus = tags.includes(BonusTag)

        const ratingCandidate = Lodash(homeworks
            .map(h => h.tasks![0])
            .filter(x => {
                if (x === undefined) return false
                const xIsTest = isTestWork(x)
                const xIsBonus = isBonusWork(x)
                return x.id! > 0 && (isTest && xIsTest || isBonus && xIsBonus || !isTest && !isBonus && !xIsTest && !xIsBonus)
            }))
            .map(x => x.maxRating!)
            .groupBy(x => [x])
            .entries()
            .sortBy(x => x[1].length).last()?.[1][0]

        const task = {
            homeworkId: homework.id,
            maxRating: ratingCandidate || 10,
            suggestedMaxRating: ratingCandidate,
            title: `Новая задача`,
            tags: homework.tags,
            isDeferred: homework.isDeferred,
            description: "",
            id
        }

        props.onTaskUpdate({task})
        setState((prevState) => ({
            ...prevState,
            selectedItem: {
                isHomework: false,
                id: id
            }
        }))
        setNewTaskCounter(id - 1)
    }

    const renderHomework = (homework: HomeworkViewModel & { isModified?: boolean }) => {
        const filesInfo = id ? FileInfoConverter.getCourseUnitFilesInfo(courseFilesInfo, CourseUnitType.Homework, id) : []
        const homeworkEditMode = homework && (homework.id! < 0 || homework.isModified === true)
        return homework && <Stack direction={"column"} spacing={2}>
            <Card style={{backgroundColor: "ghostwhite"}} raised={homeworkEditMode}>
                {isMentor && getGroupingAlert(homework)}
                {isMentor && getDatesAlert(homework, true)}
                <CourseHomeworkExperimental
                    key={homework.id}
                    getAllHomeworks={() => homeworks}
                    homeworkAndFilesInfo={{homework, filesInfo}}
                    isMentor={isMentor}
                    initialEditMode={initialEditMode || homeworkEditMode}
                    onMount={onSelectedItemMount}
                    onAddTask={addNewTask}
                    onUpdate={update => {
                        props.onHomeworkUpdate(update)
                        setState((prevState) => ({
                            ...prevState,
                            selectedItem: {
                                isHomework: true,
                                id: update.isDeleted ? undefined : update.homework.id!
                            }
                        }))
                    }}
                    isProcessing={props.processingFiles[homework.id!]?.isLoading || false}
                    onStartProcessing={props.onStartProcessing}
                    onGroupsUpdate={props.onGroupsUpdate}
                    groups={props.groups}
                />
            </Card>
        </Stack>
    }

    const renderTask = (task: HomeworkTaskViewModel & { isModified?: boolean }, homework: HomeworkViewModel) => {
        const taskEditMode = task && (task.id! < 0 || task.isModified === true)
        return task && <Card style={{backgroundColor: "ghostwhite"}} raised={taskEditMode}>
            {isMentor && getDatesAlert(task, false)}
            <CourseTaskExperimental
                key={task.id}
                task={task}
                homework={homework!}
                isMentor={isMentor}
                initialEditMode={initialEditMode || taskEditMode}
                onMount={onSelectedItemMount}
                onUpdate={update => {
                    props.onTaskUpdate(update)
                    if (update.isDeleted)
                        setState((prevState) => ({
                            ...prevState,
                            selectedItem: {
                                isHomework: true,
                                id: homework!.id
                            }
                        }))
                }}
                toEditHomework={() => toEditHomework(homework!)} getAllHomeworks={() => homeworks}/>
            {!props.isMentor && props.isStudentAccepted && < CardActions>
                <Link
                    style={{color: '#212529'}}
                    to={"/task/" + task.id!.toString()}>
                    <Button
                        size="medium"
                        variant="text"
                        color="primary"
                    >
                        Решения
                    </Button>
                </Link>
            </CardActions>}
        </Card>
    }

    const renderGif = () =>
        <DotLottieReact
            src="https://lottie.host/5f96ad46-7c60-4d6f-9333-bbca189be66d/iNWo5peHOK.lottie"
            loop
            autoplay
        />

    const renderLecturerWelcomeScreen = () => <Stack spacing={1} direction={"column"} alignItems={"center"}>
        <SwitchAccessShortcutIcon color={"success"} fontSize={"large"}/>
        <Alert severity={"success"} icon={"😃"}>
            <AlertTitle>Спасибо за ещё один курс</AlertTitle>
            Самое время добавить новое задание!
        </Alert>
    </Stack>

    return <Stack direction={{xs: "column", md: "row"}} spacing={1} alignItems={"flex-start"}>
        <Box sx={{...columnSx(4), order: {xs: 2, md: 1}}}>
            <Paper variant={"outlined"} sx={listPanelSx}>
                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={listHeaderSx}>
                    <AssignmentOutlinedIcon fontSize={"small"}/>
                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Задания</Typography>
                    <Chip size={"small"} label={visibleHomeworks.length} sx={headerChipSx}/>
                    <Box sx={{flexGrow: 1}}/>
                    <Tooltip arrow title={showSearch ? "Сбросить поиск" : "Поиск по названию"}>
                        <IconButton
                            size={"small"}
                            onClick={() => {
                                setSearch("")
                                setShowSearch(!showSearch)
                            }}
                            sx={{color: showSearch ? "#3f51b5" : "text.secondary"}}
                        >
                            {showSearch ? <ClearIcon fontSize={"small"}/> : <SearchIcon fontSize={"small"}/>}
                        </IconButton>
                    </Tooltip>
                    {isMentor && !filterAdded && (homeworks[0]?.id || 1) > 0 &&
                        <Button
                            onClick={addNewHomework}
                            size={"small"}
                            startIcon={<AddIcon/>}
                            sx={{textTransform: "none", borderRadius: "10px", flexShrink: 0}}
                        >
                            Задание
                        </Button>}
                </Stack>
                <Divider/>
                <Collapse in={showSearch} unmountOnExit>
                    <Box sx={{px: 1.5, py: 1.25}}>
                        <TextField
                            fullWidth
                            autoFocus
                            size={"small"}
                            value={search}
                            placeholder={"Название задания или задачи"}
                            onChange={event => setSearch(event.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon fontSize={"small"}
                                                            sx={{mr: 1, color: "text.secondary"}}/>,
                                sx: {borderRadius: "10px", fontSize: "0.9375rem"},
                            }}
                        />
                    </Box>
                    <Divider/>
                </Collapse>
                {filterAdded && <>
                    <Stack direction={"row"} alignItems={"center"} spacing={1} sx={filterBarSx}>
                        <FilterAltOutlinedIcon sx={{fontSize: 18, flexShrink: 0}}/>
                        <Typography variant={"caption"} sx={{flexGrow: 1, minWidth: 0}}>
                            {hideDeferred
                                ? "Только опубликованные задания"
                                : showOnlyGroupedTest
                                    ? "Контрольные работы «" + showOnlyGroupedTest + "»"
                                    : ""}
                        </Typography>
                        <Button
                            size={"small"}
                            color={"inherit"}
                            onClick={() => {
                                setHideDeferred(false)
                                setShowOnlyGroupedTest(undefined)
                            }}
                            sx={{textTransform: "none", borderRadius: "8px", flexShrink: 0}}
                        >
                            Показать все
                        </Button>
                    </Stack>
                    <Divider/>
                </>}
                <Box sx={listScrollSx}>
                    {isMentor && homeworks.length === 0 && renderLecturerWelcomeScreen()}
                    {!isMentor && homeworks.length === 0 &&
                        <Typography variant={"body2"} sx={emptyStateSx}>Заданий пока нет</Typography>}
                    {homeworks.length > 0 && visibleHomeworks.length === 0 &&
                        <Typography variant={"body2"} sx={emptyStateSx}>
                            {"Ничего не найдено по запросу «" + search.trim() + "»"}
                        </Typography>}
                    <Stack direction={"column"} spacing={1.5}>
                        {visibleHomeworks.map((x: HomeworkViewModel & {
                            isModified?: boolean,
                            hasErrors?: boolean
                        }, index) => {
                            const isGroupSelected = selectedItemHomework?.id === x.id
                            const hasTasks = x.tasks!.length > 0
                            return <Box key={x.id} sx={{
                                position: "relative",
                                // Без вертикальных отступов: строки прилегают к рамке задания без пустого зазора,
                                // воздух внутри строк даёт их собственный py
                                borderRadius: "12px",
                                border: "1px solid",
                                borderColor: isGroupSelected ? "#3f51b5" : "transparent",
                                backgroundColor: isGroupSelected ? "#f7f8fd" : "transparent",
                                transition: "border-color .15s, background-color .15s",
                            }}>
                                <Box sx={railSx(index === 0, index === visibleHomeworks.length - 1, hasTasks)}/>
                                <ListItemButton
                                    selected={isRowSelected(true, x.id!)}
                                    onClick={() => setState(prevState => ({
                                        ...prevState,
                                        selectedItem: {isHomework: true, id: x.id},
                                    }))}
                                    sx={{...rowSx, py: 1.25}}
                                >
                                    <Box sx={taskMarkerSx}>{renderHomeworkNode(x)}</Box>
                                    <Stack direction={"row"} alignItems={"center"} spacing={0.75}
                                           sx={{flexGrow: 1, minWidth: 0}}>
                                        {x.groupId && <Tooltip arrow title={"Командная работа"}>
                                            <GroupIcon
                                                fontSize={"small"}
                                                sx={{flexShrink: 0}}
                                                color={x.isDeferred ? "disabled" : x.tags!.includes(TestTag) ? "primary" : "action"}/>
                                        </Tooltip>}
                                        <Box sx={{minWidth: 0}}>
                                            <Typography
                                                className="antiLongWords"
                                                sx={{fontSize: "1rem", fontWeight: 600, lineHeight: 1.3}}
                                                color={x.isDeferred
                                                    ? "textSecondary"
                                                    : x.tags!.includes(TestTag) ? "primary" : "textPrimary"}>
                                                {x.title}{getTip(x)}
                                            </Typography>
                                            {x.isDeferred && !x.publicationDateNotSet &&
                                                <Stack direction={"row"} alignItems={"center"} spacing={0.5}
                                                       sx={{mt: 0.25, color: "text.secondary"}}>
                                                    <ScheduleIcon sx={{fontSize: 14, flexShrink: 0}}/>
                                                    <Typography variant={"caption"} sx={{whiteSpace: "nowrap"}}>
                                                        {renderShortDate(x.publicationDate!) + ", " + renderTime(x.publicationDate!)}
                                                    </Typography>
                                                </Stack>}
                                        </Box>
                                    </Stack>
                                    {renderHomeworkCounter(x)}
                                </ListItemButton>
                                {hasTasks
                                    ? <Box>
                                        {x.tasks!.map(t => <ListItemButton
                                            key={t.id}
                                            selected={isRowSelected(false, t.id!)}
                                            onClick={() => setState(prevState => ({
                                                ...prevState,
                                                selectedItem: {isHomework: false, id: t.id},
                                            }))}
                                            sx={{...rowSx, py: 0.875}}
                                        >
                                            <Box sx={taskMarkerSx}>{renderTaskStatus(t)}</Box>
                                            <Typography
                                                className="antiLongWords"
                                                sx={{flexGrow: 1, minWidth: 0, fontSize: "0.9375rem", lineHeight: 1.35}}
                                                color={t.isDeferred ? "textSecondary" : "textPrimary"}>
                                                {t.title}{getTip(t)}
                                            </Typography>
                                            {renderTaskDeadline(t)}
                                        </ListItemButton>)}
                                    </Box>
                                    : x.id! > 0 &&
                                    <Typography
                                        variant={"caption"}
                                        sx={{display: "block", px: 1.25, pb: 0.5, color: "text.secondary"}}>
                                        Без задач
                                    </Typography>}
                                {x.id! < 0 &&
                                    <Button fullWidth
                                            onClick={() => addNewTask(x)}
                                            size={"small"}
                                            startIcon={<AddIcon/>}
                                            sx={{textTransform: "none", borderRadius: "10px", mt: 0.5}}>
                                        Добавить задачу
                                    </Button>}
                            </Box>;
                        })}
                    </Stack>
                </Box>
            </Paper>
        </Box>
        <Box sx={{...columnSx(8), order: {xs: 1, md: 2}}}>
            {isHomework
                ? renderHomework(selectedItem as HomeworkViewModel)
                : renderTask(selectedItem as HomeworkTaskViewModel, selectedItemHomework!)}
            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                {renderGif()}
            </Box>
        </Box>
        <Box sx={{display: {xs: 'flex', md: 'none'}, width: "100%", order: 3}}>
            {renderGif()}
        </Box>

        {/* Кнопка "Наверх" для мобильных устройств */}
        <Zoom in={showScrollButton && isMobile}>
            <Fab
                size="medium"
                color="primary"
                aria-label="up"
                onClick={scrollToTop}
                sx={{
                    position: 'fixed',
                    bottom: 40,
                    right: 40,
                    display: {xs: 'flex', md: 'none'},
                    zIndex: 1000
                }}
            >
                <ArrowUpwardIcon/>
            </Fab>
        </Zoom>
    </Stack>
}
