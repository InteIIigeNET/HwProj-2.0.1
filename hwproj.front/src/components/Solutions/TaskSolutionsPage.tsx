import * as React from "react";
import Task from "../Tasks/Task";
import Typography from "@material-ui/core/Typography";
import AddSolution from "./AddSolution";
import Button from "@material-ui/core/Button";
import TaskSolutions from "./TaskSolutions";
import {CourseViewModel, HomeworkTaskViewModel, UserTaskSolutions} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid, Link} from "@material-ui/core";
import {Divider} from "@mui/material";
import {useParams} from "react-router-dom";

interface ITaskSolutionsState {
    isLoaded: boolean
    task: HomeworkTaskViewModel
    addSolution: boolean
    course: CourseViewModel
    userSolutions: UserTaskSolutions
}

const TaskSolutionsPage: FC = () => {
    const {taskId} = useParams()

    const userId = ApiSingleton.authService.getUserId()
    const [taskSolutionPage, setTaskSolutionPage] = useState<ITaskSolutionsState>({
        isLoaded: false,
        task: {},
        addSolution: false,
        course: {
            mentors: [],
        },
        userSolutions: {}
    })

    useEffect(() => {
        getTask()
    }, [])

    const getTask = async () => {
        //TODO: fix
        const task = await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)
        const solutions = await ApiSingleton.solutionsApi.apiSolutionsTaskSolutionByTaskIdByStudentIdGet(+taskId!, userId);
        setTaskSolutionPage({
            isLoaded: true,
            addSolution: false,
            task: task,
            course: course,
            userSolutions: solutions
        })
    }

    const {userSolutions} = taskSolutionPage
    const solutions = userSolutions && userSolutions.solutions!
    const lastSolution = solutions && solutions[solutions.length - 1]

    const onCancelAddSolution = () => {
        setTaskSolutionPage((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    if (taskSolutionPage.isLoaded) {
        if (ApiSingleton.authService.isLoggedIn() &&
            (taskSolutionPage.course.acceptedStudents!.some((cm) => cm.userId == userId)
                || taskSolutionPage.course.mentors!.map(x => x.userId)!.includes(userId!))) {
            return (
                <div className={"container"} style={{marginBottom: '50px'}}>
                    <Grid container justify="center" style={{marginTop: '20px'}}>
                        <Grid container justifyContent="space-between" xs={11}>
                            <Grid item>
                                <Link
                                    component="button"
                                    style={{color: '#212529'}}
                                    onClick={() => window.location.assign('/courses/' + taskSolutionPage.course.id)}
                                >
                                    <Typography>
                                        Назад к курсу
                                    </Typography>
                                </Link>
                            </Grid>
                        </Grid>
                        <Grid container xs={11}>
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
                                        task={taskSolutionPage.task}
                                        forMentor={false}
                                        student={userSolutions.user!}
                                        solutions={userSolutions.solutions!}/>
                                </Grid>
                            )}
                            {(!taskSolutionPage.addSolution && taskSolutionPage.task.canSendSolution) && (
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
                                            task={taskSolutionPage.task}
                                            forMentor={false}
                                            student={userSolutions.user!}
                                            solutions={userSolutions.solutions!}/>
                                    </div>
                                    <div style={{marginTop: "10px"}}>
                                        <Divider style={{marginBottom: 15}}/>
                                        <AddSolution
                                            taskId={+taskId!}
                                            onAdd={getTask}
                                            onCancel={onCancelAddSolution}
                                            lastSolutionUrl={lastSolution?.githubUrl}/>
                                    </div>
                                </Grid>
                            )}
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
