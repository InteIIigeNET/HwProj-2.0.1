import * as React from "react";
import Task from "../Tasks/Task";
import Typography from "@material-ui/core/Typography";
import AddOrEditSolution from "./AddOrEditSolution";
import Button from "@material-ui/core/Button";
import TaskSolutions from "./TaskSolutions";
import {
    AccountDataDto, FileInfoDTO,
    HomeworksGroupUserTaskSolutions,
    HomeworkTaskViewModel, ScopeDTO,
    Solution,
    SolutionState
} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";
import { FC, useEffect, useState } from "react";
import { Grid, Tab, Tabs } from "@material-ui/core";
import {
    Checkbox,
    Chip,
    SelectChangeEvent,
    Stack,
    Tooltip
} from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import { getTip } from "../Common/HomeworkTags";
import Lodash from "lodash";
import { appBarStateManager } from "../AppBar";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {enqueueSnackbar} from "notistack";
import {FileStatus} from "@/components/Files/FileStatus";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {ICourseFilesState} from "@/components/Courses/Course";

interface ITaskSolutionsState {
    isLoaded: boolean
    addSolution: boolean
    courseId: number
    homeworkGroupedSolutions: HomeworksGroupUserTaskSolutions[]
    courseMates: AccountDataDto[]
}

type Filter = "Только нерешенные"
const FilterStorageKey = "TaskSolutionsPage"

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const FilterProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        },
    },
}

const TaskSolutionsPage: FC = () => {
    const { taskId } = useParams()
    const navigate = useNavigate()

    const userId = ApiSingleton.authService.getUserId()
    const [task, setTask] = useState<HomeworkTaskViewModel>({})
    const [taskSolutionPage, setTaskSolutionPage] = useState<ITaskSolutionsState>({
        isLoaded: false,
        courseId: 0,
        addSolution: false,
        homeworkGroupedSolutions: [],
        courseMates: []
    })

    const [filterState, setFilterState] = React.useState<Filter[]>(
        localStorage.getItem(FilterStorageKey)?.split(", ").filter(x => x !== "").map(x => x as Filter) || []
    )
    const handleFilterChange = (event: SelectChangeEvent<typeof filterState>) => {
        const filters = filterState.length > 0 ? [] : ["Только нерешенные" as Filter]
        localStorage.setItem(FilterStorageKey, filters.join(", "))
        setFilterState(filters)
    }

    const showOnlyNotSolved = filterState.some(x => x === "Только нерешенные")

    useEffect(() => {
        getSolutions()
    }, [])

    useEffect(() => {
        getTask()
    }, [taskId])

    const getTask = async () => {
        const task = await ApiSingleton.tasksApi.tasksGetTask(+taskId!)
        setTask(task)
    }

    const getSolutions = async () => {
        const pageData = await ApiSingleton.solutionsApi.solutionsGetStudentSolution(+taskId!, userId);
        setTaskSolutionPage({
            isLoaded: true,
            addSolution: false,
            courseId: pageData.courseId!,
            homeworkGroupedSolutions: pageData.taskSolutions!,
            courseMates: pageData.courseMates!,
        })
    }

    const { homeworkGroupedSolutions, courseId, courseMates } = taskSolutionPage
    const student = courseMates.find(x => x.userId === userId)!

    useEffect(() => {
        appBarStateManager.setContextAction({ actionName: "К курсу", link: `/courses/${courseId}` })
        return () => appBarStateManager.reset()
    }, [courseId])

    //TODO: unify
    const taskSolutionsWithPreview = homeworkGroupedSolutions
        .map(x => ({
            ...x,
            homeworkSolutions: x.homeworkSolutions!.map(t =>
            ({
                homeworkTitle: t.homeworkTitle,
                previews: t.studentSolutions!.map(y =>
                    ({ ...y, ...StudentStatsUtils.calculateLastRatedSolutionInfo(y.solutions!, y.maxRating!) }))
            }))
        }))

    const taskSolutionsPreview = taskSolutionsWithPreview.flatMap(x => {
        if (!x.homeworkSolutions) return []
        const firstHomeworkTasks = x.homeworkSolutions[0]?.previews || []
        return firstHomeworkTasks.map((t, i) => {
            const solutions = Lodash(x.homeworkSolutions).maxBy(h => h.previews![i].lastRatedSolution?.rating || -1)
            const preview = solutions!.previews[i]
            return ({
                lastRatedSolution: preview.lastRatedSolution,
                color: preview.color,
                taskId: preview.taskId,
                lastSolution: preview.lastSolution,
                solutionsDescription: preview.solutionsDescription,
                tags: preview.tags,
                title: x.homeworkSolutions.length === 1 ? preview.title : "(" + x.groupTitle! + ") " + `Задача ${i + 1}`,
            });
        });
    })

    const [courseFilesState, setCourseFilesState] = useState<ICourseFilesState>({
        processingFilesState: {},
        courseFiles: []
    })

    const intervalsRef = React.useRef<Record<number, { interval: NodeJS.Timeout, timeout: NodeJS.Timeout }>>({});

    const unsetCommonLoading = (solutionId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            processingFilesState: {
                ...prev.processingFilesState,
                [solutionId]: {isLoading: false}
            }
        }));
    }

    const stopProcessing = (homeworkId: number) => {
        if (intervalsRef.current[homeworkId]) {
            const {interval, timeout} = intervalsRef.current[homeworkId];
            clearInterval(interval);
            clearTimeout(timeout);
            delete intervalsRef.current[homeworkId];
        }
    };

    const setCommonLoading = (solutionId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            processingFilesState: {
                ...prev.processingFilesState,
                [solutionId]: {isLoading: true}
            }
        }));
    }

    const updateCourseFiles = (files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            courseFiles: [
                ...prev.courseFiles.filter(
                    f => !(f.courseUnitType === unitType && f.courseUnitId === unitId)),
                ...files
            ]
        }));
    };

    // Запускает получение информации о файлах элемента курса с интервалом в 1 секунду и 5 попытками
    //TODO: вынести в отдельную функцию?
    const getFilesByInterval = (solutionId: number, previouslyExistingFilesCount: number, waitingNewFilesCount: number, deletingFilesIds: number[]) => {
        // Очищаем предыдущие таймеры
        stopProcessing(solutionId);

        let attempt = 0;
        const maxAttempts = 10;
        let delay = 1000; // Начальная задержка 1 сек

        const scopeDto: ScopeDTO = {
            courseId: +courseId!,
            courseUnitType: CourseUnitType.Solution,
            courseUnitId: solutionId
        }

        const fetchFiles = async () => {
            if (attempt >= maxAttempts) {
                stopProcessing(solutionId);
                enqueueSnackbar("Превышено допустимое количество попыток получения информации о файлах", {
                    variant: "warning",
                    autoHideDuration: 2000
                });
                return;
            }

            attempt++;
            try {
                const files = await ApiSingleton.filesApi.filesGetStatuses(scopeDto);
                console.log(`Попытка ${attempt}:`, files);

                // Первый вариант для явного отображения всех файлов
                if (waitingNewFilesCount === 0
                    && files.filter(f => f.status === FileStatus.ReadyToUse).length === previouslyExistingFilesCount - deletingFilesIds.length) {
                    updateCourseFiles(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                    unsetCommonLoading(solutionId)
                }

                // Второй вариант для явного отображения всех файлов
                if (waitingNewFilesCount > 0
                    && files.filter(f => !deletingFilesIds.some(dfi => dfi === f.id)).length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount) {
                    updateCourseFiles(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                    unsetCommonLoading(solutionId)
                }

                // Условие прекращения отправки запросов на получения записей файлов
                if (files.length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount
                    && files.every(f => f.status !== FileStatus.Uploading && f.status !== FileStatus.Deleting)) {
                    stopProcessing(solutionId);
                    unsetCommonLoading(solutionId)
                }

            } catch (error) {
                console.error(`Ошибка (попытка ${attempt}):`, error);
            }
        }
        // Создаем интервал с задержкой
        const interval = setInterval(fetchFiles, delay);

        // Создаем таймаут для автоматической остановки
        const timeout = setTimeout(() => {
            stopProcessing(solutionId);
            unsetCommonLoading(solutionId);
        }, 10000);

        // Сохраняем интервал и таймаут в ref
        intervalsRef.current[solutionId] = {interval, timeout};

        // Сигнализируем о начале загрузки через состояние
        setCommonLoading(solutionId)
    }

    // Останавливаем все активные интервалы при размонтировании
    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach(({interval, timeout}) => {
                clearInterval(interval);
                clearTimeout(timeout);
            });
            intervalsRef.current = {};
        };
    }, []);

    const getCourseFilesInfo = async () => {
        let courseFilesInfo = [] as FileInfoDTO[]
        try {
            courseFilesInfo = await ApiSingleton.filesApi.filesGetFilesInfo(+courseId!)
        } catch (e) {
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 1990});
        }
        setCourseFilesState(prevState => ({
            ...prevState,
            courseFiles: courseFilesInfo
        }))
    }
    useEffect(() => {
        getCourseFilesInfo()
    })

    const currentHomeworksGroup = taskSolutionsWithPreview
        .find(x => x.homeworkSolutions!
            .some(h => h.previews!
                .some(t => t.taskId === taskId)))

    const homeworkSolutions = currentHomeworksGroup?.homeworkSolutions || []

    const versionOfTask = homeworkSolutions.findIndex(x => x.previews!.some(t => t.taskId === taskId))

    const taskIndexInHomework = versionOfTask === -1
        ? -1
        : homeworkSolutions[versionOfTask].previews!.findIndex(t => t.taskId === taskId)

    const versionsOfCurrentTask = taskIndexInHomework === -1
        ? []
        : homeworkSolutions.map(h => h.previews![taskIndexInHomework].taskId!)

    const currentTaskSolutions = taskIndexInHomework === -1 ? [] : homeworkSolutions[versionOfTask].previews[taskIndexInHomework].solutions!
    const lastSolution = currentTaskSolutions[currentTaskSolutions.length - 1]

    const taskSolutionsPreviewFiltered = showOnlyNotSolved
        ? taskSolutionsPreview.filter(x => x.lastSolution === undefined)
        : taskSolutionsPreview

    const onCancelAddSolution = () => {
        setTaskSolutionPage((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    const renderRatingChip = (solutionsDescription: string, color: string, lastRatedSolution: Solution) => {
        return <Tooltip arrow disableInteractive enterDelay={1000} title={<span
            style={{ whiteSpace: 'pre-line' }}>{solutionsDescription}</span>}>
            <Chip style={{ backgroundColor: color }}
                size={"small"}
                label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating} />
        </Tooltip>
    }

    return taskSolutionPage.isLoaded ? <div className={"container"} style={{ marginBottom: '50px' }}>
        <Grid container justify="center" style={{ marginTop: '20px' }}>
            <Grid container spacing={2} xs={12}>
                <Grid item xs={12}>
                    <Stack direction={"row"} spacing={1}
                        style={{ overflowY: "hidden", overflowX: "auto", minHeight: 80 }}>
                        {taskSolutionsPreviewFiltered.map((t, index) => {
                            const isCurrent = versionsOfCurrentTask.includes(t.taskId!.toString())
                            const {
                                color,
                                lastRatedSolution,
                                solutionsDescription
                            } = t
                            return <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                {index > 0 && <hr style={{ width: 100 }} />}
                                <Step active={isCurrent}>
                                    <Link to={`/task/${t.taskId}`}
                                        style={{ color: "black", textDecoration: "none" }}>
                                        <StepButton
                                            ref={ref => {
                                                if (isCurrent) ref?.scrollIntoView({ inline: "nearest" })
                                            }}
                                            color={color}
                                            icon={renderRatingChip(solutionsDescription, color, lastRatedSolution)}>
                                            {t.title}{getTip(t)}
                                        </StepButton>
                                    </Link>
                                </Step>
                            </Stack>
                        })}
                    </Stack>
                </Grid>
                <Grid container item direction={"row"} spacing={2}>
                    <Grid container item lg={3} spacing={1} direction={"column"}>
                        <Grid item>
                            <Stack direction={"row"} alignItems={"center"}>
                                <Checkbox
                                    onChange={handleFilterChange}
                                    checked={filterState.includes("Только нерешенные")} />
                                <Typography>Только нерешенные</Typography>
                            </Stack>
                        </Grid>
                        {task.canSendSolution && <Grid item><Button
                            fullWidth
                            size="large"
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                                e.persist()
                                setTaskSolutionPage((prevState) => ({
                                    ...prevState,
                                    addSolution: true,
                                }))
                            }}
                        >
                            {lastSolution?.state === SolutionState.NUMBER_0 ? "Изменить решение" : "Добавить решение"}
                        </Button></Grid>}
                    </Grid>
                    <Grid container item lg={9}>
                        <Grid item xs={12}>
                            {currentHomeworksGroup && taskIndexInHomework !== -1 && currentHomeworksGroup.homeworkSolutions!.length > 1 &&
                                <Tabs
                                    onChange={(_, value) => navigate(`/task/${currentHomeworksGroup!.homeworkSolutions![value].previews[taskIndexInHomework]!.taskId!}`)}
                                    variant="scrollable"
                                    scrollButtons={"auto"}
                                    value={versionOfTask}
                                    indicatorColor="primary"
                                >
                                    {currentHomeworksGroup.homeworkSolutions?.map(h => {
                                        const {
                                            color,
                                            lastRatedSolution,
                                            solutionsDescription
                                        } = h.previews[taskIndexInHomework]!
                                        return <Tab
                                            style={{ textTransform: "none" }}
                                            label={<Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                {renderRatingChip(color, solutionsDescription, lastRatedSolution)}
                                                <div>{h.homeworkTitle}</div>
                                            </Stack>} />;
                                    })}
                                </Tabs>
                            }
                        </Grid>
                        <Grid item xs={12}>
                            <Task
                                task={task}
                                forStudent={true}
                                forMentor={false}
                                isReadingMode={true}
                                onDeleteClick={() => 3}
                                isExpanded={false}
                                showForCourse={false}
                            />
                        </Grid>
                        {!taskSolutionPage.addSolution && (
                            <Grid item xs={12}>
                                <TaskSolutions
                                    courseId={courseId}
                                    task={task}
                                    forMentor={false}
                                    student={student}
                                    courseStudents={[student]}
                                    solutions={currentTaskSolutions}
                                    courseFiles={courseFilesState.courseFiles}
                                    processingFiles={courseFilesState.processingFilesState}/>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            {taskSolutionPage.addSolution && <AddOrEditSolution
                courseId={courseId}
                userId={userId}
                task={task}
                onAdd={getSolutions}
                onCancel={onCancelAddSolution}
                lastSolution={lastSolution}
                students={courseMates}
                supportsGroup={task.isGroupWork!}
                courseFilesInfo={courseFilesState.courseFiles}
                onStartProcessing={getFilesByInterval}/>}
        </Grid>
    </div> : (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    );
}

export default TaskSolutionsPage
