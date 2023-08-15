import {AccountDataDto, SolutionPreviewView, UnratedSolutionPreviews} from "../../api";
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

interface ICommonState {

    courseTitleFilter: string,
    homeworkTitleFilter: string,
    taskTitleFilter: string,
    studentNameFilter: string
    courses: JSX.Element[],
    homeworks: JSX.Element[],
    tasks: JSX.Element[],
    students: JSX.Element[]
}

const UnratedSolutions: FC<IUnratedSolutionsProps> = (props) => {

    const {unratedSolutions} = props.unratedSolutionsPreviews
    const unratedSolutionsArray = [...unratedSolutions!]

    const renderStudent = (s: AccountDataDto) => `${s.surname} ${s.name}`

    const [commonState, setCommonState] = useState<ICommonState> ({

        courseTitleFilter: "",
        homeworkTitleFilter: "",
        taskTitleFilter: "",
        studentNameFilter: "",
        courses: [...new Set(unratedSolutionsArray.map(s => s.courseTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>),
        homeworks: [...new Set(unratedSolutionsArray.map(s => s.homeworkTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>),
        tasks: [...new Set(unratedSolutionsArray.map(s => s.taskTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>),
        students: [... new Set(unratedSolutionsArray.map(t => renderStudent(t.student!)))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
    })

    const filteredUnratedSolutions = unratedSolutions!
        .filter(t => commonState.courseTitleFilter ? t.courseTitle === commonState.courseTitleFilter : true)
        .filter(t => commonState.homeworkTitleFilter ? t.homeworkTitle === commonState.homeworkTitleFilter : true)
        .filter(t => commonState.taskTitleFilter ? t.taskTitle === commonState.taskTitleFilter : true)
        .filter(t => commonState.studentNameFilter ? renderStudent(t.student!) === commonState.studentNameFilter : true)

    const handleFilterChange = (filterName: string, value: string) => {
        
        var courseFilter = commonState.courseTitleFilter
        var homeworkFilter = commonState.homeworkTitleFilter
        var taskFilter = commonState.taskTitleFilter
        var studentFilter = commonState.studentNameFilter
        
        switch (filterName){
            case "courseTitleFilter":
                courseFilter = value
                homeworkFilter = ""
                taskFilter = ""
                studentFilter = ""
                break;
            case "homeworkTitleFilter":
                homeworkFilter = value
                taskFilter = ""
                studentFilter = ""
                break;
            case "taskTitleFilter":
                taskFilter = value
                studentFilter = ""
                break;
            case "studentNameFilter":
                studentFilter = value
                break;
        }

        const filteredHomeworks = courseFilter != "" ? unratedSolutionsArray.filter(t => t.courseTitle === courseFilter) : unratedSolutionsArray
        const filteredTasks = homeworkFilter != "" ? filteredHomeworks.filter(t => t.homeworkTitle === homeworkFilter) : filteredHomeworks
        const filteredStudents = taskFilter != "" ? filteredTasks.filter(t => t.taskTitle === taskFilter) : filteredTasks

        setCommonState(prevState => ({
            ...prevState,
            courseTitleFilter: courseFilter,
            homeworkTitleFilter: homeworkFilter,
            taskTitleFilter: taskFilter,
            studentNameFilter: studentFilter,
            homeworks: [... new Set(filteredHomeworks.map(t => t.homeworkTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>),
            tasks: [... new Set(filteredTasks.map(t => t.taskTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>),
            students: [... new Set(filteredStudents.map(t => renderStudent(t.student!)))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
        }))
    }

    const renderSelect = (name: string, filterName: string, value: string, options: JSX.Element[]) => {
        return (<FormControl fullWidth style={{minWidth: 220}}>
            <InputLabel>{name}</InputLabel>
            <Select
                value={value}
                onChange={(event, value) => {
                    handleFilterChange(filterName, event.target.value as string)
                }}
                label="demo-label"
            >
                <MenuItem value={""}>Любое</MenuItem>
                {options}
            </Select>
        </FormControl>)
    }

    const renderFilter = () => {
        return <Grid container xs={"auto"} style={{marginBottom: 15}} spacing={1} direction={"row"}>
            <Grid item>
                {renderSelect("Курс", "courseTitleFilter", commonState.courseTitleFilter, commonState.courses)}
            </Grid>
            <Grid item>
                {renderSelect("Домашняя работа", "homeworkTitleFilter", commonState.homeworkTitleFilter, commonState.homeworks)}
            </Grid>
            <Grid item>
                {renderSelect("Задание", "taskTitleFilter", commonState.taskTitleFilter, commonState.tasks)}
            </Grid>
            <Grid item>
                {renderSelect("Студент", "studentNameFilter", commonState.studentNameFilter, commonState.students)}
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
