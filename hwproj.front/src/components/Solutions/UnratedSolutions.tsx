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

const UnratedSolutions: FC<IUnratedSolutionsProps> = (props) => {

    const [courseTitleFilter, setCourseTitleFilter] = useState<string | undefined>(undefined)
    const [homeworkTitleFilter, setHomeworkTitleFilter] = useState<string | undefined>(undefined)
    const [taskTitleFilter, setTaskTitleFilter] = useState<string | undefined>(undefined)
    const [studentNameFilter, setStudentNameFilter] = useState<string | undefined>(undefined)

    const renderStudent = (s: AccountDataDto) => `${s.surname} ${s.name}`

    const {unratedSolutions} = props.unratedSolutionsPreviews
    const filteredUnratedSolutions = unratedSolutions!
        .filter(t => courseTitleFilter ? t.courseTitle === courseTitleFilter : true)
        .filter(t => homeworkTitleFilter ? t.homeworkTitle === homeworkTitleFilter : true)
        .filter(t => taskTitleFilter ? t.taskTitle === taskTitleFilter : true)
        .filter(t => studentNameFilter ? renderStudent(t.student!) === studentNameFilter : true)

    const renderCourses = () => {
        return [...new Set(unratedSolutions!.map(s => s.courseTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
    }

    const renderHomeworks = () => {
        var values = [...unratedSolutions!]
        values = (courseTitleFilter !== undefined && courseTitleFilter !== "") ? values.filter(t => t.courseTitle === courseTitleFilter) : values
        return [... new Set(values.map(t => t.homeworkTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
    }

    const renderTasks = () => {
        var values = [...unratedSolutions!]
        values = (courseTitleFilter !== undefined && courseTitleFilter !== "") ? values.filter(t => t.courseTitle === courseTitleFilter) : values
        values = (homeworkTitleFilter !== undefined && homeworkTitleFilter !== "") ? values.filter(t => t.homeworkTitle === homeworkTitleFilter) : values
        return [... new Set(values.map(t => t.taskTitle!))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
    }

    const renderStudents = () => {
        var values = [...unratedSolutions!]
        values = (courseTitleFilter !== undefined && courseTitleFilter !== "") ? values.filter(t => t.courseTitle === courseTitleFilter) : values
        values = (homeworkTitleFilter !== undefined && homeworkTitleFilter !== "") ? values.filter(t => t.homeworkTitle === homeworkTitleFilter) : values
        values = (taskTitleFilter !== undefined && taskTitleFilter !== "") ? values.filter(t => t.taskTitle === taskTitleFilter) : values
        return [... new Set(values.map(t => renderStudent(t.student!)))].sort().map(t => <MenuItem value={t}>{t}</MenuItem>)
    }

    return (
        <div className="container">
            <Grid container xs={"auto"} style={{marginBottom: 15}} spacing={1} direction={"row"}>
                <Grid item>
                    <FormControl fullWidth style={{minWidth: 220}}>
                        <InputLabel>{"Курс"}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={courseTitleFilter || ""}
                            onChange={(event, value) => {
                                setCourseTitleFilter(event.target.value as string)
                                setHomeworkTitleFilter(undefined)
                                setTaskTitleFilter(undefined)
                                setStudentNameFilter(undefined)
                            }}
                            label="Course"
                        >
                            <MenuItem value={""}>Любое</MenuItem>
                            {renderCourses()}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth style={{minWidth: 220}}>
                        <InputLabel>{"Домашняя работа"}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={homeworkTitleFilter || ""}
                            onChange={(event, value) => {
                                setHomeworkTitleFilter(event.target.value as string)
                                setTaskTitleFilter(undefined)
                                setStudentNameFilter(undefined)
                            }}
                            label="Course"
                        >
                            <MenuItem value={""}>Любое</MenuItem>
                            {renderHomeworks()}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth style={{minWidth: 220}}>
                        <InputLabel>{"Задание"}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={taskTitleFilter || ""}
                            onChange={(event, value) => {
                                setTaskTitleFilter(event.target.value as string)
                                setStudentNameFilter(undefined)
                            }}
                            label="Course"
                        >
                            <MenuItem value={""}>Любое</MenuItem>
                            {renderTasks()}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth style={{minWidth: 220}}>
                        <InputLabel>{"Студент"}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={studentNameFilter || ""}
                            onChange={(event, value) => setStudentNameFilter(event.target.value as string)}
                            label="Course"
                        >
                            <MenuItem value={""}>Любое</MenuItem>
                            {renderStudents()}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
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
