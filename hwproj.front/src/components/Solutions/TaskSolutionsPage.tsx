import * as React from "react";
import {RouteComponentProps} from "react-router-dom";
import Task from "../Tasks/Task";
import Typography from "@material-ui/core/Typography";
import AddSolution from "./AddSolution";
import Button from "@material-ui/core/Button";
import TaskSolutions from "./TaskSolutions";
import {CourseViewModel, HomeworkTaskViewModel} from "../../api/";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid, Link} from "@material-ui/core";
import {Divider} from "@mui/material";

interface ITaskSolutionsProps {
    taskId: string;
}

interface ITaskSolutionsState {
    isLoaded: boolean;
    task: HomeworkTaskViewModel;
    addSolution: boolean;
    course: CourseViewModel;
}

const TaskSolutionsPage: FC<RouteComponentProps<ITaskSolutionsProps>> = (props) => {
    const [taskSolution, setTaskSolution] = useState<ITaskSolutionsState>({
        isLoaded: false,
        task: {},
        addSolution: false,
        course: {
            mentors: [],
        },
    })

    useEffect(() => {
        getTask()
    }, [])

    const getTask = async () => {
        //TODO: fix
        const task = await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+props.match.params.taskId)
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)
        setTaskSolution({
            isLoaded: true,
            addSolution: false,
            task: task,
            course: course,
        })
    }

    const onCancelAddSolution = () => {
        setTaskSolution((prevState) => ({
            ...prevState,
            addSolution: false,
        }))
    }

    const userId = ApiSingleton.authService.isLoggedIn()
        ? ApiSingleton.authService.getUserId()
        : undefined

    if (taskSolution.isLoaded) {
        if (ApiSingleton.authService.isLoggedIn() &&
            (taskSolution.course.acceptedStudents!.some((cm) => cm.userId == userId)
                || taskSolution.course.mentors!.map(x => x.userId)!.includes(userId!))) {
            return (
                <div className={"container"} style={{marginBottom: '50px'}}>
                    <Grid container justify="center" style={{marginTop: '20px'}}>
                        <Grid container justifyContent="space-between" xs={11}>
                            <Grid item>
                                <Link
                                    component="button"
                                    style={{color: '#212529'}}
                                    onClick={() => window.location.assign('/courses/' + taskSolution.course.id)}
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
                                    task={taskSolution.task}
                                    forStudent={true}
                                    forMentor={false}
                                    isReadingMode={true}
                                    onDeleteClick={() => 3}
                                    isExpanded={true}
                                    showForCourse={false}
                                />
                            </Grid>
                            {!taskSolution.addSolution && (
                                <Grid item xs={6}>
                                    <TaskSolutions
                                        forMentor={false}
                                        taskId={+props.match.params.taskId}
                                        studentId={userId as string}
                                        maxRating={taskSolution.task!.maxRating!}
                                    />
                                </Grid>
                            )}
                            {(!taskSolution.addSolution && taskSolution.task.canSendSolution) && (
                                <Grid item xs={12} style={{marginTop: "10px"}}>
                                    <Divider style={{marginBottom: 15}}/>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        onClick={(e) => {
                                            e.persist()
                                            setTaskSolution((prevState) => ({
                                                ...prevState,
                                                addSolution: true,
                                            }))
                                        }}
                                    >
                                        Добавить решение
                                    </Button>
                                </Grid>
                            )}
                            {taskSolution.addSolution && (
                                <Grid item xs={6}>
                                    <div>
                                        <TaskSolutions
                                            forMentor={false}
                                            taskId={+props.match.params.taskId}
                                            studentId={userId as string}
                                            maxRating={taskSolution.task!.maxRating!}
                                        />
                                    </div>
                                    <div style={{marginTop: "10px"}}>
                                        <Divider style={{marginBottom: 15}}/>
                                        <AddSolution
                                            taskId={+props.match.params.taskId}
                                            onAdd={getTask}
                                            onCancel={onCancelAddSolution}
                                        />
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
