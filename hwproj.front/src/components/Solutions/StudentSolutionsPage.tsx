import * as React from "react";
import {CourseViewModel, HomeworkTaskViewModel, SolutionPreviewView} from "../../api/";
import Typography from "@material-ui/core/Typography";
import Task from "../Tasks/Task";
import TaskSolutions from "./TaskSolutions";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid, Link} from "@material-ui/core";
import {useNavigate, useParams} from "react-router-dom";

interface IStudentSolutionsPageState {
    task: HomeworkTaskViewModel;
    isLoaded: boolean;
    course: CourseViewModel;
}

const StudentSolutionsPage: FC = (props) => {
    const { taskId, studentId } = useParams()
    const navigate = useNavigate()

    const [studentSolutions, setStudentSolutions] = useState<IStudentSolutionsPageState>({
        task: {},
        isLoaded: false,
        course: {},
    })

    const [nextUnratedSolution, setNextUnratedSolution] = useState<{
        nexUnratedSolution?: SolutionPreviewView,
        state: "initial" | "loaded"
    }>({
        state: "initial"
    })

    const {isLoaded} = studentSolutions
    const userId = ApiSingleton.authService.isLoggedIn()
        ? ApiSingleton.authService.getUserId()
        : undefined

    useEffect(() => {
        getTaskData()
    }, [])

    const getTaskData = async () => {
        const task = await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+taskId!)
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)

        setStudentSolutions({
            task: task,
            isLoaded: true,
            course: course,
        })
    }

    const getNextUnratedSolution = async () => {
        const unratedSolutions = await ApiSingleton.solutionsApi.apiSolutionsUnratedSolutionsGet(+taskId!)
        const nextUnratedSolution = unratedSolutions.unratedSolutions!
            .filter(t => t.student!.userId !== studentId)
            .sort((s1, s2) => {
                const cm1 = `${s1.student!.surname} ${s1.student!.name}`
                const cm2 = `${s2.student!.surname} ${s2.student!.name}`
                return cm1.localeCompare(cm2)
            })[0]

        if (nextUnratedSolution) {
            navigate(`/task/${nextUnratedSolution.taskId}/${nextUnratedSolution.student!.userId}`)
        } else
            setNextUnratedSolution({
                state: "loaded",
                nexUnratedSolution: nextUnratedSolution
            })
    }

    const renderNextUnratedSolutionLink = () => {
        return nextUnratedSolution.state === "initial"
            ? <Link
                component="button"
                style={{color: '#212529'}}
                onClick={() => getNextUnratedSolution()}
            >
                <Typography>
                    Следующее непроверенное решение задачи
                </Typography>
            </Link>
            : <Typography>
                ✅ Все решения задачи проверены!
            </Typography>
    }

    if (isLoaded) {
        if (
            !ApiSingleton.authService.isLoggedIn() ||
            !studentSolutions.course.mentors!.map(x => x.userId).includes(userId!)
        ) {
            return (
                <Typography variant="h6">
                    Страница не найдена
                </Typography>
            )
        }
        return (
            <div className={"container"} style={{marginBottom: '50px', marginTop: '15px'}}>
                <Grid container justify="center" style={{marginTop: '20px'}}>
                    <Grid container justifyContent="space-between" xs={11}>
                        <Grid item>
                            <Link
                                component="button"
                                style={{color: '#212529'}}
                                onClick={() => navigate(`/courses/${studentSolutions.course.id!}/stats`)}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                        <Grid item>
                            {renderNextUnratedSolutionLink()}
                        </Grid>
                    </Grid>
                    <Grid container xs={11}>
                        <Task
                            task={studentSolutions.task}
                            forStudent={false}
                            forMentor={true}
                            isReadingMode={true}
                            onDeleteClick={() => 0}
                            isExpanded={false}
                            showForCourse={false}
                        />
                    </Grid>
                    <Grid container xs={11}>
                        <TaskSolutions
                            forMentor={true}
                            task={studentSolutions.task}
                            studentId={studentId!}
                        />
                    </Grid>
                </Grid>
            </div>
        )
    }

    return (
        <div>

        </div>
    )
}

export default StudentSolutionsPage
