import {AccountDataDto, QuestionsSummary, SolutionPreviewView, UnratedSolutionPreviews} from "@/api";
import * as React from "react";
import {NavLink} from "react-router-dom";
import {
    Divider,
    Grid,
    ListItem,
    Typography,
    Chip, Card, CardContent, Autocomplete, Stack,
    Badge
} from "@mui/material";
import {FC, useEffect, useState} from "react";
import Utils from "../../services/Utils";
import {RatingStorage} from "../Storages/RatingStorage";
import TextField from "@mui/material/TextField";
import ApiSingleton from "@/api/ApiSingleton";

interface IUnratedSolutionsProps {
    unratedSolutionsPreviews: UnratedSolutionPreviews
}

interface IFiltersState {
    coursesFilter: string,
    homeworksFilter: string,
    tasksFilter: string,
    studentsFilter: string
    courses: string[],
    homeworks: string[],
    tasks: string[],
    students: string[]
}

const solutionPlurals = ["решение", "решения", "решений"]
const taskPlurals = ["задача", "задачи", "задач"]

type FilterTitleName = "coursesFilter" | "homeworksFilter" | "tasksFilter" | "studentsFilter"

const UnratedSolutionsAndOpenQuestions: FC<IUnratedSolutionsProps> = (props) => {
    const [openQuestions, setOpenQuestions] = useState<QuestionsSummary[]>([])
    useEffect(() => {
        ApiSingleton.tasksApi.tasksGetOpenQuestions().then(res => setOpenQuestions(res))
    }, []);

    const unratedSolutions = props.unratedSolutionsPreviews.unratedSolutions!
    const semiRatedSolutions = unratedSolutions.filter(x => RatingStorage.tryGet({
        solutionId: x.solutionId,
        taskId: x.taskId!,
        studentId: x.student!.userId!
    }) != null)
    const renderStudent = (s: AccountDataDto) => `${s.surname} ${s.name}`
    const prepareStrings = (arr: string[]) => [...new Set(arr)].sort()
    const courses = new Set(unratedSolutions.map(s => s.courseTitle!))
    const homeworks = new Set(unratedSolutions.map(s => s.homeworkTitle!))
    const tasks = new Set(unratedSolutions.map(s => s.taskTitle!))
    const students = new Set(unratedSolutions.map(t => renderStudent(t.student!)))
    const getFilterSetting = (key: FilterTitleName) => {
        const filterValue = localStorage.getItem(key)
        if (!filterValue) {
            return ""
        }
        if (key === "coursesFilter" && !courses.has(filterValue)) {
            localStorage.removeItem("homeworksFilter")
            localStorage.removeItem("tasksFilter")
            localStorage.removeItem("studentsFilter")
        } else if (key === "homeworksFilter" && !homeworks.has(filterValue)) {
            localStorage.removeItem("tasksFilter")
            localStorage.removeItem("studentsFilter")
        } else if (key === "tasksFilter" && !tasks.has(filterValue)) {
            localStorage.removeItem("studentsFilter")
        } else if (key === "studentsFilter" && !students.has(filterValue)) {
        } else {
            return filterValue
        }
        localStorage.removeItem(key)
        return ""
    }

    const coursesFilter = getFilterSetting("coursesFilter")
    const homeworksFilter = getFilterSetting("homeworksFilter")
    const tasksFilter = getFilterSetting("tasksFilter")
    const studentsFilter = getFilterSetting("studentsFilter")

    const filteredHomeworks = coursesFilter === "" ? unratedSolutions : unratedSolutions.filter(t => t.courseTitle === coursesFilter)
    const filteredTasks = homeworksFilter === "" ? filteredHomeworks : filteredHomeworks.filter(t => t.homeworkTitle === homeworksFilter)
    const filteredStudents = tasksFilter === "" ? filteredTasks : filteredTasks.filter(t => t.taskTitle === tasksFilter)

    const [filtersState, setFiltersState] = useState<IFiltersState>({
        coursesFilter: coursesFilter,
        homeworksFilter: homeworksFilter,
        tasksFilter: tasksFilter,
        studentsFilter: studentsFilter,
        courses: [...courses].sort(),
        homeworks: prepareStrings(filteredHomeworks.map(t => t.homeworkTitle!)),
        tasks: prepareStrings(filteredTasks.map(t => t.taskTitle!)),
        students: prepareStrings(filteredStudents.map(t => renderStudent(t.student!)))
    })

    const filteredUnratedSolutions = unratedSolutions
        .filter(t => !filtersState.coursesFilter || t.courseTitle === filtersState.coursesFilter)
        .filter(t => !filtersState.homeworksFilter || t.homeworkTitle === filtersState.homeworksFilter)
        .filter(t => !filtersState.tasksFilter || t.taskTitle === filtersState.tasksFilter)
        .filter(t => !filtersState.studentsFilter || renderStudent(t.student!) === filtersState.studentsFilter)

    const randomSolution = filteredUnratedSolutions.length > 1
        ? filteredUnratedSolutions[Math.floor(Math.random() * filteredUnratedSolutions.length)]
        : undefined

    const handleFilterChange = (filterName: FilterTitleName, value: string) => {
        let courseFilter = filtersState.coursesFilter
        let homeworkFilter = filtersState.homeworksFilter
        let taskFilter = filtersState.tasksFilter
        let studentFilter = filtersState.studentsFilter

        if (filterName === "coursesFilter") {
            courseFilter = value
            homeworkFilter = ""
            taskFilter = ""
            studentFilter = ""
        } else if (filterName === "homeworksFilter") {
            homeworkFilter = value
            taskFilter = ""
            studentFilter = ""
        } else if (filterName === "tasksFilter") {
            taskFilter = value
            studentFilter = ""
        } else if (filterName === "studentsFilter") {
            studentFilter = value
        }

        const filteredHomeworks = courseFilter === "" ? unratedSolutions : unratedSolutions.filter(t => t.courseTitle === courseFilter)
        const filteredTasks = homeworkFilter === "" ? filteredHomeworks : filteredHomeworks.filter(t => t.homeworkTitle === homeworkFilter)
        const filteredStudents = taskFilter === "" ? filteredTasks : filteredTasks.filter(t => t.taskTitle === taskFilter)
        localStorage.setItem("coursesFilter", courseFilter)
        localStorage.setItem("homeworksFilter", homeworkFilter)
        localStorage.setItem("tasksFilter", taskFilter)
        localStorage.setItem("studentsFilter", studentFilter)
        setFiltersState(prevState => ({
            ...prevState,
            coursesFilter: courseFilter,
            homeworksFilter: homeworkFilter,
            tasksFilter: taskFilter,
            studentsFilter: studentFilter,
            homeworks: prepareStrings(filteredHomeworks.map(t => t.homeworkTitle!)),
            tasks: prepareStrings(filteredTasks.map(t => t.taskTitle!)),
            students: prepareStrings(filteredStudents.map(t => renderStudent(t.student!)))
        }))
    }

    const renderSelect = (name: string, filterName: FilterTitleName, value: string, options: string[]) => {
        return (<Autocomplete
            fullWidth
            options={options}
            defaultValue={""}
            value={value}
            renderInput={params => <TextField
                {...params}
                fullWidth
                style={{minWidth: 250, width: 55 + value.length * 10}}
                label={name}
            />}
            key={name}
            onChange={(_, newValue) => handleFilterChange(filterName, newValue || "")}
        />)
    }

    const renderFilter = () => {
        return <div style={{marginBottom: 15}}>
            <Grid container item xs={"auto"} spacing={1} direction={"row"}>
                <Grid item>
                    {renderSelect("Курс", "coursesFilter", filtersState.coursesFilter, filtersState.courses)}
                </Grid>
                <Grid item>
                    {renderSelect("Задание", "homeworksFilter", filtersState.homeworksFilter, filtersState.homeworks)}
                </Grid>
                <Grid item>
                    {renderSelect("Задача", "tasksFilter", filtersState.tasksFilter, filtersState.tasks)}
                </Grid>
                <Grid item>
                    {renderSelect("Студент", "studentsFilter", filtersState.studentsFilter, filtersState.students)}
                </Grid>
            </Grid>
            <Grid container direction={"row"} spacing={1} style={{marginTop: 5}}>
                {filteredUnratedSolutions.length < unratedSolutions.length && <Grid item>
                    <Typography variant={"caption"} color={"GrayText"}>
                        {`${filteredUnratedSolutions.length} ${Utils.pluralizeHelper(solutionPlurals, filteredUnratedSolutions.length)} найдено по заданному фильтру`}
                    </Typography>
                </Grid>}
                {randomSolution && <Grid item>
                    <NavLink
                        style={{color: "#1976d2"}}
                        to={`/task/${randomSolution.taskId}/${randomSolution.student!.userId}`}
                    >
                        <Typography variant={"caption"}>
                            проверить случайное решение
                        </Typography>
                    </NavLink>
                </Grid>}
            </Grid>
        </div>
    }

    const renderSolutions = (solutions: SolutionPreviewView[]) => {
        return solutions.map((solution, i) => (
            <Grid item key={i}>
                <ListItem
                    key={i}
                    style={{padding: 0}}
                >
                    <Grid container alignItems={"center"} spacing={1}>
                        <Grid item style={{marginRight: 2}}>
                            <NavLink
                                to={`/task/${solution.taskId}/${solution.student!.userId}`}
                                style={{color: "#212529"}}
                            >
                                <Typography style={{fontSize: "20px"}}>
                                    {solution.student!.surname} {solution.student!.name} {" • "} {solution.taskTitle}
                                </Typography>
                            </NavLink>
                        </Grid>
                        {solution.isFirstTry && solution.sentAfterDeadline &&
                            <Grid item>
                                <Chip color="error" label="Дедлайн" size={"small"}/></Grid>}
                        {!solution.isFirstTry &&
                            <Grid item>
                                <Chip color="secondary" label="Повторно" size={"small"}/></Grid>}
                        {solution.groupId &&
                            <Grid item>
                                <Chip color="primary" label="Командное" size={"small"}/></Grid>}
                        {solution.isCourseCompleted &&
                            <Grid item>
                                <Chip style={{color: "GrayText"}} label="Курс завершен"
                                      size={"small"}/>
                            </Grid>}
                    </Grid>
                </ListItem>
                <Typography style={{fontSize: "18px", color: "GrayText"}}>
                    {solution.courseTitle + " • " + solution.homeworkTitle}
                </Typography>
                {Utils.renderReadableDate(solution.publicationDate!)}
                {i < solutions.length - 1 ?
                    <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
            </Grid>
        ))
    }

    return (
        <div>
            {openQuestions.length > 0 &&
                <Card variant={"outlined"} style={{marginBottom: 20, borderColor: "#3f51b5"}}>
                    <CardContent>
                        <div style={{marginBottom: 10}}>
                            <Typography variant={"caption"} color={"#3f51b5"} style={{marginBottom: 10}}>
                                {`${openQuestions.length} ${Utils.pluralizeHelper(taskPlurals, openQuestions.length)} содержат вопросы от студентов`}
                            </Typography>
                        </div>
                        <div>{openQuestions.map((taskQuestions, i) => (
                            <Grid item key={"question" + i}>
                                <ListItem>
                                    <Grid container alignItems={"center"} spacing={1}>
                                        <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                            <Badge badgeContent={taskQuestions.count} variant="standard"
                                                   color={"primary"}/>
                                            <Grid item>
                                                <NavLink
                                                    to={`/task/${taskQuestions.taskId}/undefined`}
                                                    style={{color: "#212529"}}
                                                >
                                                    <Typography style={{fontSize: "15px"}}>
                                                        {taskQuestions.taskTitle}
                                                    </Typography>
                                                </NavLink>
                                            </Grid>
                                        </Stack>
                                    </Grid>
                                </ListItem>
                            </Grid>
                        ))}</div>
                    </CardContent>
                </Card>
            }
            {semiRatedSolutions.length > 0 &&
                <Card variant={"outlined"} style={{marginBottom: 20, borderColor: "#3f51b5"}}>
                    <CardContent>
                        <div style={{marginBottom: 10}}>
                            <Typography variant={"caption"} color={"#3f51b5"} style={{marginBottom: 10}}>
                                {`${semiRatedSolutions.length} ${Utils.pluralizeHelper(solutionPlurals, semiRatedSolutions.length)} с незаконченной проверкой`}
                            </Typography>
                        </div>
                        <div>{renderSolutions(semiRatedSolutions)}</div>
                    </CardContent>
                </Card>
            }
            {renderFilter()}
            {unratedSolutions.length === 0 ?
                <div>
                    <Typography variant={"body1"} color={"GrayText"}>Все решения проверены.</Typography>
                </div> :
                <div>
                    {renderSolutions(filteredUnratedSolutions)}
                </div>
            }
        </div>
    )
}

export default UnratedSolutionsAndOpenQuestions;
