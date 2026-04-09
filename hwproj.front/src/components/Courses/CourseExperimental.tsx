import * as React from "react";
import {
    FileInfoDTO,
    Group,
    HomeworkTaskViewModel,
    HomeworkViewModel, SolutionDto, StatisticsCourseMatesModel,
} from "@/api";
import {
    AlertTitle,
    Button,
    Fab,
    Grid,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from "@mui/material";
import {FC, useEffect, useState} from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
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
import Lodash from "lodash";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

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
    groups: Group[];
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

    const clickedItemStyle = {
        backgroundColor: "ghostwhite",
        borderRadius: 9,
        cursor: "pointer",
        border: "1px solid lightgrey"
    }

    const hoveredItemStyle = {...clickedItemStyle, border: "1px solid lightgrey"}

    const warningTimelineDotStyle = {
        borderWidth: 0,
        margin: 0,
        padding: "4px 0px",
    }

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? clickedItemStyle : {borderRadius: 9}

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

    const renderHomeworkStatus = (homework: HomeworkViewModel & { isModified?: boolean, hasErrors?: boolean }) => {
        const hasErrors = homework.id! < 0 && (homework.hasErrors || homework.tasks!.some((t: HomeworkTaskViewModel & {
            hasErrors?: boolean
        }) => t.hasErrors))
        if (hasErrors)
            return <div style={{fontSize: 16}}><ErrorIcon fontSize="small" color={"error"}/><br/></div>
        if (homework.isModified)
            return <div style={{fontSize: 16}}><EditIcon fontSize="small" color={"primary"}/><br/></div>
        return showWarningsForEntity(homework, true) && <div style={{fontSize: 16}}>⚠️<br/></div>
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
                    <Chip style={{backgroundColor: color, marginTop: '11.5px'}}
                          size={"small"}
                          label={lastRatedSolution == null ? "?" : lastRatedSolution.rating}/>
                </Tooltip>
            )
        }
        if (task.hasErrors) return <ErrorIcon fontSize="small" color={"error"}/>
        if (task.isModified) return <EditIcon fontSize="small" color={"primary"}/>
        return showWarningsForEntity(task, false) ? (
            <Typography color={task.isDeferred ? "textSecondary" : "textPrimary"}>
                <TimelineDot variant="outlined" style={warningTimelineDotStyle}>⚠️</TimelineDot>
            </Typography>
        ) : <TimelineDot variant="outlined"/>
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

    return <Grid container direction={{xs: "column", sm: "column", md: "row", lg: "row"}} spacing={1}>
        <Grid item xs={12} sm={12} md={4} lg={4} order={{xs: 2, sm: 2, md: 1, lg: 1}}>
            <Timeline style={{overflow: 'auto', paddingLeft: 0, paddingRight: 8}}
                      sx={{
                          maxHeight: {
                              xs: 'none',
                              md: '75vh'
                          },
                          '&::-webkit-scrollbar': {
                              width: "3px",
                          },
                          '&::-webkit-scrollbar-track': {
                              backgroundColor: "ghostwhite",
                              borderRadius: 9
                          },
                          '&::-webkit-scrollbar-thumb': {
                              backgroundColor: "lightgrey",
                              borderRadius: 9
                          }
                      }}>
                {props.isMentor && filterAdded && <Stack direction={"column"} alignItems={"center"}>
                    <Button
                        fullWidth
                        onClick={() => {
                            setHideDeferred(false)
                            setShowOnlyGroupedTest(undefined)
                        }}
                        style={{borderRadius: 8, marginBottom: 10}} variant={"outlined"} size={"medium"}>
                        Показать все задания
                    </Button>
                    <Typography
                        variant={"caption"}>{hideDeferred
                        ? "только опубликованные задания"
                        : showOnlyGroupedTest
                            ? `контрольные работы '${showOnlyGroupedTest}'`
                            : ""}
                    </Typography>
                </Stack>}
                {props.isMentor && !filterAdded && (homeworks[0]?.id || 1) > 0 && <Button
                    onClick={addNewHomework}
                    style={{borderRadius: 8, marginBottom: 10}} variant={"text"} size={"small"}>
                    + Добавить задание
                </Button>}
                {isMentor && homeworks.length === 0 && renderLecturerWelcomeScreen()}
                <Stack direction={"column"} spacing={0.5}>
                    {homeworks.map((x: HomeworkViewModel & { isModified?: boolean, hasErrors?: boolean }) => {
                        return <div key={x.id} style={selectedItemHomework?.id === x.id ? {
                            border: "1px solid #3f51b5",
                            borderRadius: 9,
                        } : undefined}>
                            <Stack direction={"column"} spacing={0.5}>
                                <Paper
                                    key={x.id}
                                    elevation={0}
                                    component={Stack}
                                    justifyContent="center"
                                    alignContent={"center"}
                                    sx={{":hover": hoveredItemStyle}}
                                    style={{...getStyle(true, x.id!), minHeight: 50}}
                                    onClick={() => {
                                        setState(prevState => ({
                                            ...prevState,
                                            selectedItem: {
                                                data: x,
                                                isHomework: true,
                                                id: x.id,
                                                homeworkFilesInfo: FileInfoConverter.getCourseUnitFilesInfo(courseFilesInfo, CourseUnitType.Homework, x.id!)
                                            }
                                        }))
                                    }}>
                                    <Typography variant="h6" style={{fontSize: 18}} align={"center"}
                                                color={x.isDeferred
                                                    ? "textSecondary"
                                                    : x.tags!.includes(TestTag) ? "primary" : "textPrimary"}>
                                        {isMentor && renderHomeworkStatus(x)}
                                        {x.title}{getTip(x)}
                                    </Typography>
                                    {x.isDeferred && !x.publicationDateNotSet &&
                                        <Typography style={{fontSize: "14px"}} align={"center"}>
                                            {"🕘 " + renderDate(x.publicationDate!) + " " + renderTime(x.publicationDate!)}
                                        </Typography>}
                                    {x.tasks?.length === 0 &&
                                        <TimelineItem style={{minHeight: 30}}>
                                            <TimelineOppositeContent></TimelineOppositeContent>
                                            <TimelineSeparator><TimelineConnector/></TimelineSeparator>
                                            <TimelineContent></TimelineContent>
                                        </TimelineItem>}
                                </Paper>
                                {x.tasks!.map(t => <TimelineItem
                                    key={t.id}
                                    onClick={() => {
                                        setState(prevState => ({
                                            ...prevState,
                                            selectedItem: {
                                                data: t,
                                                isHomework: false,
                                                id: t.id,
                                                homeworkFilesInfo: []
                                            }
                                        }))
                                    }}
                                    style={getStyle(false, t.id!)}
                                    sx={{":hover": hoveredItemStyle}}>
                                    {!t.deadlineDateNotSet &&
                                        <TimelineOppositeContent color="textSecondary">
                                            {t.deadlineDate ? renderDate(t.deadlineDate) : ""}
                                            <br/>
                                            {t.deadlineDate ? renderTime(t.deadlineDate) : ""}
                                        </TimelineOppositeContent>
                                    }
                                    <TimelineSeparator>
                                        {renderTaskStatus(t)}
                                        <TimelineConnector/>
                                    </TimelineSeparator>
                                    <TimelineContent alignItems={"center"}>
                                        <Typography className="antiLongWords"
                                                    color={t.isDeferred ? "textSecondary" : "textPrimary"}>
                                            {t.title}{getTip(t)}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>)}
                            </Stack>
                            {x.id! < 0 &&
                                <Button fullWidth
                                        onClick={() => addNewTask(x)}
                                        style={{borderRadius: 8, marginBottom: 10, marginTop: 5}}
                                        variant={"text"}
                                        size={"small"}>
                                    + Добавить задачу
                                </Button>}
                        </div>;
                    })}
                </Stack>
            </Timeline>
        </Grid>
        <Grid item xs={12} sm={12} md={8} lg={8} order={{xs: 1, sm: 1, md: 2, lg: 2}}>
            {isHomework
                ? renderHomework(selectedItem as HomeworkViewModel)
                : renderTask(selectedItem as HomeworkTaskViewModel, selectedItemHomework!)}
            <Grid item sx={{display: {xs: 'none', md: 'flex'}}}>
                {renderGif()}
            </Grid>
        </Grid>
        <Grid item sx={{display: {xs: 'flex', md: 'none'}}} order={{xs: 3, sm: 3}}>
            {renderGif()}
        </Grid>

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
    </Grid>
}
