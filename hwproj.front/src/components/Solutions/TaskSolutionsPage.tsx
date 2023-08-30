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
import {Chip, Divider, Stack, Tooltip} from "@mui/material";
import {useParams, Link} from "react-router-dom";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StudentStatsUtils from "../../services/StudentStatsUtils";

interface ITaskSolutionsState {
    isLoaded: boolean
    task: HomeworkTaskViewModel
    addSolution: boolean
    courseId: number
    taskSolutions: UserTaskSolutions2[]
    courseMates: AccountDataDto[]
}

const TaskSolutionsPage: FC = () => {
    const {taskId} = useParams()

    const userId = ApiSingleton.authService.getUserId()
    const [taskSolutionPage, setTaskSolutionPage] = useState<ITaskSolutionsState>({
        isLoaded: false,
        task: {},
        courseId: 0,
        addSolution: false,
        taskSolutions: [],
        courseMates: []
    })

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
            taskSolutions: pageData.taskSolutions!,
            courseMates: pageData.courseMates!,
        })
    }

    const {taskSolutions, courseId, task, courseMates} = taskSolutionPage
    const student = courseMates.find(x => x.userId === userId)!
    const currentTaskSolutions = taskSolutions.find(x => x.taskId === taskId)?.solutions || []
    const lastSolution = currentTaskSolutions[currentTaskSolutions.length - 1]

    const onCancelAddSolution = () => {
        setTaskSolutionPage((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    if (taskSolutionPage.isLoaded) {
        if (ApiSingleton.authService.isLoggedIn()) {
            return (
                <div className={"container"} style={{marginBottom: '50px'}}>
                    <Grid container justify="center" style={{marginTop: '20px'}}>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <Stack direction={"row"} spacing={1}
                                       style={{overflowY: "hidden", overflowX: "auto", minHeight: 80}}>
                                    {taskSolutions.map((t, index) => {
                                        const isCurrent = taskId === String(t.taskId)
                                        const {
                                            color,
                                            lastRatedSolution,
                                            solutionsDescription
                                        } = StudentStatsUtils.calculateLastRatedSolutionInfo(t.solutions!, task.maxRating!)
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
                                <Grid item xs={6}>
                                    <TaskSolutions
                                        task={task}
                                        forMentor={false}
                                        student={student}
                                        solutions={currentTaskSolutions}/>
                                </Grid>
                            )}
                            {(!taskSolutionPage.addSolution && task.canSendSolution) && (
                                <Grid item xs={12} style={{marginTop: "10px"}}>
                                    <Divider style={{marginBottom: 15}}/>
                                    <Button
                                        size="small"
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
                                    </Button>
                                </Grid>
                            )}
                            {taskSolutionPage.addSolution && (
                                <Grid item xs={6}>
                                    <div>
                                        <TaskSolutions
                                            task={task}
                                            forMentor={false}
                                            student={student!}
                                            solutions={currentTaskSolutions}/>
                                    </div>
                                    <div style={{marginTop: "10px"}}>
                                        <Divider style={{marginBottom: 15}}/>
                                        <AddSolution
                                            userId={userId}
                                            taskId={+taskId!}
                                            onAdd={getTask}
                                            onCancel={onCancelAddSolution}
                                            lastSolutionUrl={lastSolution?.githubUrl}
                                            students={courseMates}
                                            lastGroup={lastSolution?.groupMates?.map(s => s.userId!) || []}/>
                                    </div>
                                </Grid>
                            )}
                        </Grid>
                        <Grid item>
                            <Link
                                style={{color: '#212529'}}
                                to={`/courses/${courseId}`}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            )
        } else {
            return (
                <Typography variant="h6">
                    Страница не найдена
                </Typography>
            )
        }
    }
    return (
        <div>

        </div>
    )
}

export default TaskSolutionsPage
