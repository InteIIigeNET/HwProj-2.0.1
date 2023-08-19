import {AccountDataDto, UnratedSolutionPreviews} from "../../api";
import * as React from "react";
import {NavLink} from "react-router-dom";
import {
    FormControl,
    InputLabel,
    Select,
    Divider,
    Grid,
    ListItem,
    MenuItem,
    Typography,
    Chip
} from "@mui/material";
import {FC, useState} from "react";

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

type FilterTitleName = "coursesFilter" | "homeworksFilter" | "tasksFilter" | "studentsFilter"

const UnratedSolutions: FC<IUnratedSolutionsProps> = (props) => {
    const unratedSolutions = props.unratedSolutionsPreviews.unratedSolutions!
    const renderStudent = (s: AccountDataDto) => `${s.surname} ${s.name}`
    const prepareStrings = (arr: string[]) => [...new Set(arr)].sort()

    const [filtersState, setFiltersState] = useState<IFiltersState>({
        coursesFilter: "",
        homeworksFilter: "",
        tasksFilter: "",
        studentsFilter: "",
        courses: prepareStrings(unratedSolutions.map(s => s.courseTitle!)),
        homeworks: prepareStrings(unratedSolutions.map(s => s.homeworkTitle!)),
        tasks: prepareStrings(unratedSolutions.map(s => s.taskTitle!)),
        students: prepareStrings(unratedSolutions.map(t => renderStudent(t.student!)))
    })

    const filteredUnratedSolutions = unratedSolutions
        .filter(t => !filtersState.coursesFilter || t.courseTitle === filtersState.coursesFilter)
        .filter(t => !filtersState.homeworksFilter || t.homeworkTitle === filtersState.homeworksFilter)
        .filter(t => !filtersState.tasksFilter || t.taskTitle === filtersState.tasksFilter)
        .filter(t => !filtersState.studentsFilter || renderStudent(t.student!) === filtersState.studentsFilter)

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

        const filteredHomeworks = courseFilter == "" ? unratedSolutions : unratedSolutions.filter(t => t.courseTitle === courseFilter)
        const filteredTasks = homeworkFilter == "" ? filteredHomeworks : filteredHomeworks.filter(t => t.homeworkTitle === homeworkFilter)
        const filteredStudents = taskFilter == "" ? filteredTasks : filteredTasks.filter(t => t.taskTitle === taskFilter)

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
        return (<FormControl fullWidth style={{minWidth: 220}}>
            <InputLabel>{name}</InputLabel>
            <Select
                value={value}
                onChange={(event) => handleFilterChange(filterName, event.target.value as string)}
                label="demo-label"
            >
                <MenuItem value={""}>Любое</MenuItem>
                {options.map(t => <MenuItem value={t}>{t}</MenuItem>)}
            </Select>
        </FormControl>)
    }

    const renderFilter = () => {
        return <Grid container xs={"auto"} style={{marginBottom: 15}} spacing={1} direction={"row"}>
            <Grid item>
                {renderSelect("Курс", "coursesFilter", filtersState.coursesFilter, filtersState.courses)}
            </Grid>
            <Grid item>
                {renderSelect("Домашняя работа", "homeworksFilter", filtersState.homeworksFilter, filtersState.homeworks)}
            </Grid>
            <Grid item>
                {renderSelect("Задание", "tasksFilter", filtersState.tasksFilter, filtersState.tasks)}
            </Grid>
            <Grid item>
                {renderSelect("Студент", "studentsFilter", filtersState.studentsFilter, filtersState.students)}
            </Grid>
        </Grid>
    }

    return (
        <div className="container">
            {renderFilter()}
            {filteredUnratedSolutions.length == 0 ? <div>По заданному фильтру все решения проверены.</div> :
                <div>
                    {filteredUnratedSolutions.map((solution, i) => (
                        <Grid item>
                            <ListItem
                                key={i}
                                style={{padding: 0}}
                            >
                                <NavLink
                                    to={`/task/${solution.taskId}/${solution.student!.userId}`}
                                    style={{color: "#212529"}}
                                >
                                    <Typography style={{fontSize: "20px"}}>
                                        {solution.student!.surname} {solution.student!.name} {" • "} {solution.taskTitle}
                                    </Typography>
                                </NavLink>
                                {solution.isFirstTry && solution.sentAfterDeadline &&
                                    <Chip color="error" label="Дедлайн" size={"small"} style={{marginLeft: 10}}/>}
                                {!solution.isFirstTry &&
                                    <Chip color="secondary" label="Повторно" size={"small"} style={{marginLeft: 10}}/>}
                            </ListItem>
                            <Typography style={{fontSize: "18px", color: "GrayText"}}>
                                {solution.courseTitle + " • " + solution.homeworkTitle}
                            </Typography>
                            {new Date(solution.publicationDate!).toLocaleString("ru-RU")}
                            {i < filteredUnratedSolutions.length - 1 ?
                                <Divider style={{marginTop: 10, marginBottom: 10}}/> : null}
                        </Grid>
                    ))}
                </div>
            }
        </div>
    )
}

export default UnratedSolutions;
