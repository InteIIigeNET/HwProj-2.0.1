import * as React from "react";
import {FC, useEffect, useState} from "react";
import {AccountDataDto, GetSolutionModel, HomeworkTaskViewModel} from "@/api";
import {Box, Typography} from "@mui/material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import ApiSingleton from "../../api/ApiSingleton";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {FilesUploadWaiter} from "@/components/Files/FilesUploadWaiter";
import TaskSolutions from "./TaskSolutions";
import AddOrEditSolution from "./AddOrEditSolution";

// Экран загрузки решений: стандартная лотти-гифка проекта + поясняющая подпись
const loaderSx = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 1.5,
    py: 6,
}

interface ICourseTaskSolutionsProps {
    task: HomeworkTaskViewModel
    courseId: number
    userId: string
    courseMates: AccountDataDto[]
    addSolutionOpen: boolean
    onCloseAddSolution: () => void
    // Решение отправляется/меняется прямо здесь, но баллы за задачу в шапке и в превью слева
    // считаются из статистики курса на уровне Course — просим её перечитать данные.
    onSolutionsChanged: () => void
}

const CourseTaskSolutions: FC<ICourseTaskSolutionsProps> = (props) => {
    const {task, courseId, userId, courseMates, addSolutionOpen} = props
    const student = courseMates.find(x => x.userId === userId)

    const [solutions, setSolutions] = useState<GetSolutionModel[]>([])
    const [solutionsLoaded, setSolutionsLoaded] = useState(false)

    const {
        courseFilesState,
        updateCourseUnitFiles,
    } = FilesUploadWaiter(courseId, CourseUnitType.Solution, false)

    const getSolutions = async () => {
        try {
            const pageData = await ApiSingleton.solutionsApi.solutionsGetStudentSolution(task.id!, userId)
            const taskSolutions = (pageData.taskSolutions ?? [])
                .flatMap(x => x.homeworkSolutions ?? [])
                .flatMap(x => x?.studentSolutions ?? [])
                .filter(x => Number(x?.taskId) === task.id)
                .flatMap(x => x?.solutions ?? [])
            setSolutions(taskSolutions)
        } finally {
            setSolutionsLoaded(true)
        }
    }

    // Вызывается после успешной отправки/изменения решения: обновляем локальный список, данные
    // курса (перерисуются баллы за задачу в шапке и в превью слева) и закрываем форму.
    const handleSolutionSaved = async () => {
        await getSolutions()
        props.onSolutionsChanged()
        props.onCloseAddSolution()
    }

    useEffect(() => {
        setSolutionsLoaded(false)
        getSolutions()
    }, [task.id])

    const lastSolution = solutions[solutions.length - 1]

    return <>
        {/* Пока решения по задаче не загрузились, показываем загрузку с подписью, а не пустой
            список: иначе на медленном ответе бэкенда UI ошибочно сообщает, что решений нет. */}
        {!solutionsLoaded
            ? <Box sx={loaderSx}>
                <DotLottieReact
                    style={{width: 375, maxWidth: "100%"}}
                    src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                    loop
                    autoplay
                />
                <Typography variant={"h6"} sx={{fontWeight: 400, color: "text.secondary"}}>
                    Решения загружаются...
                </Typography>
            </Box>
            : <TaskSolutions
                courseId={courseId}
                task={task}
                solutions={solutions}
                student={student}
                courseStudents={courseMates}
                forMentor={false}
                courseFiles={courseFilesState.courseFiles}
                processingFiles={courseFilesState.processingFilesState}
            />}

        {addSolutionOpen && <AddOrEditSolution
            courseId={courseId}
            userId={userId}
            task={task}
            onAdd={handleSolutionSaved}
            onCancel={props.onCloseAddSolution}
            lastSolution={lastSolution}
            students={courseMates}
            supportsGroup={task.isGroupWork!}
            courseFilesInfo={courseFilesState.courseFiles}
            onStartProcessing={updateCourseUnitFiles}
        />}
    </>
}

export default CourseTaskSolutions
