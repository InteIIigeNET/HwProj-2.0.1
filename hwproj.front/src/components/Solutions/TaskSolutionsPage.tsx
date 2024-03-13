import * as React from "react";
import Task from "../Tasks/Task";
import Typography from "@material-ui/core/Typography";
import AddSolution from "./AddSolution";
import Button from "@material-ui/core/Button";
import TaskSolutions from "./TaskSolutions";
import {AccountDataDto, HomeworkTaskViewModel, UserTaskSolutions2} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import {
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip,
    Box
} from "@mui/material";
import {useParams, Link} from "react-router-dom";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StudentStatsUtils from "../../services/StudentStatsUtils";

interface ITaskSolutionsState {
    isLoaded: boolean
    task: HomeworkTaskViewModel
    addSolution: boolean
    courseId: number
    allTaskSolutions: UserTaskSolutions2[]
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
    const {taskId} = useParams()

    const userId = ApiSingleton.authService.getUserId()
    const [taskSolutionPage, setTaskSolutionPage] = useState<ITaskSolutionsState>({
        isLoaded: false,
        task: {},
        courseId: 0,
        addSolution: false,
        allTaskSolutions: [],
        courseMates: []
    })

    const [filterState, setFilterState] = React.useState<Filter[]>(
        localStorage.getItem(FilterStorageKey)?.split(", ").filter(x => x != "").map(x => x as Filter) || []
    )
    const handleFilterChange = (event: SelectChangeEvent<typeof filterState>) => {
        const {target: {value}} = event
        const filters = filterState.length > 0 ? [] : ["Только нерешенные" as Filter]
        localStorage.setItem(FilterStorageKey, filters.join(", "))
        setFilterState(filters)
    }

    const showOnlyNotSolved = filterState.some(x => x === "Только нерешенные")

    useEffect(() => {
        getTask()
    }, [taskId])

    const getTask = async () => {
        const pageData = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(+taskId!, userId);
        setTaskSolutionPage({
            isLoaded: true,
            addSolution: false,
            courseId: pageData.courseId!,
            task: pageData.task!,
            allTaskSolutions: pageData.taskSolutions!,
            courseMates: pageData.courseMates!,
        })
    }

    const {allTaskSolutions, courseId, task, courseMates} = taskSolutionPage
    const student = courseMates.find(x => x.userId === userId)!
    const currentTaskSolutions = allTaskSolutions.find(x => x.taskId === taskId)?.solutions || []
    const lastSolution = currentTaskSolutions[currentTaskSolutions.length - 1]
    const taskSolutions = showOnlyNotSolved
        ? allTaskSolutions.filter(x => x.solutions?.length == 0)
        : allTaskSolutions

    const onCancelAddSolution = () => {
        setTaskSolutionPage((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    const renderGoBackToCoursesStatsLink = () => {
        return <Link
            to={`/courses/${courseId}`}
            style={{color: '#212529'}}
        >
            <Typography>
                Назад к курсу
            </Typography>
        </Link>
    }

    return taskSolutionPage.isLoaded ? <div className={"container"} style={{marginBottom: '50px'}}>
        <Grid container justify="center" style={{marginTop: '20px'}}>
            <Grid container spacing={2} xs={12}>
                <Grid item xs={12}>
                    <Stack direction={"row"} spacing={1}
                           style={{overflowY: "hidden", overflowX: "auto", minHeight: 80}}>
                        {taskSolutions.map((t, index) => {
                            const isCurrent = taskId === String(t.taskId)
                            const {
                                color,
                                lastRatedSolution,
                                solutionsDescription
                            } = StudentStatsUtils.calculateLastRatedSolutionInfo(t.solutions!, t.maxRating!)
                            return <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                {index > 0 && <hr style={{width: 100}}/>}
                                <Step active={isCurrent}>
                                    <Link to={`/task/${t.taskId}`}
                                          style={{color: "black", textDecoration: "none"}}>
                                        <StepButton
                                            ref={ref => {
                                                if (isCurrent) ref?.scrollIntoView({inline: "nearest"})
                                            }}
                                            color={color}
                                            icon={<Tooltip arrow disableInteractive enterDelay={1000} title={<span
                                                style={{whiteSpace: 'pre-line'}}>{solutionsDescription}</span>}>
                                                <Chip style={{backgroundColor: color}}
                                                      size={"small"}
                                                      label={lastRatedSolution == undefined ? "?" : lastRatedSolution.rating}/>
                                            </Tooltip>}>
                                            {t.title}
                                        </StepButton>
                                    </Link>
                                </Step>
                            </Stack>
                        })}
                    </Stack>
                </Grid>
                <Grid container item direction={"row"} spacing={2}>
                    <Grid container item lg={3} spacing={1} direction={"column"}>
                        <Box 
                            style={{width: '100%', height: '60px', marginTop: '10px'}}
                            display="flex" 
                            alignItems="center"
                            justifyContent="center">
                                {renderGoBackToCoursesStatsLink()}
                        </Box>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel>Фильтр</InputLabel>
                                <Select
                                    size={"medium"}
                                    value={filterState}
                                    onChange={handleFilterChange}
                                    input={<OutlinedInput label="Фильтр"/>}
                                    MenuProps={FilterProps}
                                >
                                    <MenuItem key="Только нерешенные" value={"Только нерешенные" as Filter}>
                                        Только нерешенные
                                    </MenuItem>
                                </Select>
                            </FormControl>
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
                            Добавить решение
                        </Button></Grid>}
                    </Grid>
                    <Grid container item lg={9}>
                        <Grid item xs={12}>
                            <Task
                                task={taskSolutionPage.task}
                                forStudent={true}
                                forMentor={false}
                                isReadingMode={true}
                                onDeleteClick={() => 3}
                                isExpanded={true}
                                showForCourse={false}
                            />
                        </Grid>
                        {!taskSolutionPage.addSolution && (
                            <Grid item xs={12}>
                                <TaskSolutions
                                    task={task}
                                    forMentor={false}
                                    student={student}
                                    solutions={currentTaskSolutions}/>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            {taskSolutionPage.addSolution && <AddSolution
                userId={userId}
                taskId={+taskId!}
                onAdd={getTask}
                onCancel={onCancelAddSolution}
                lastSolutionUrl={lastSolution?.githubUrl}
                students={courseMates}
                lastGroup={lastSolution?.groupMates?.map(s => s.userId!) || []}
                supportsGroup={task.isGroupWork!}/>}
        </Grid>
    </div> : (
        <div>

        </div>
    );
}

export default TaskSolutionsPage
