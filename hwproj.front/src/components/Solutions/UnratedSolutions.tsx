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

    //TODO: make filter smarter
    const {unratedSolutions} = props.unratedSolutionsPreviews
    const filteredUnratedSolutions = unratedSolutions!
        .filter(t => courseTitleFilter ? t.courseTitle === courseTitleFilter : true)
        .filter(t => homeworkTitleFilter ? t.homeworkTitle === homeworkTitleFilter : true)
        .filter(t => taskTitleFilter ? t.taskTitle === taskTitleFilter : true)
        .filter(t => studentNameFilter ? renderStudent(t.student!) === studentNameFilter : true)

    console.log(taskTitleFilter)

    const renderSelect = (name: string,
                          value: string | undefined,
                          renderTitle: (t: SolutionPreviewView) => string,
                          onChange: React.Dispatch<React.SetStateAction<string | undefined>>) => {
        const values = [...new Set(unratedSolutions!.map(renderTitle))]
        return <FormControl fullWidth style={{minWidth: 220}}>
            <InputLabel>{name}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value || ""}
                onChange={event => onChange(event.target.value as string)}
                label="Course"
            >
                <MenuItem value={0}>Любое</MenuItem>
                {values.map(t => <MenuItem value={t}>{t}</MenuItem>)}
            </Select>
        </FormControl>
    }

    const renderFilter = () => {
        return <Grid container xs={"auto"} style={{marginBottom: 15}} spacing={1} direction={"row"}>
            <Grid item>
                {renderSelect("Курс", courseTitleFilter, s => s.courseTitle!, setCourseTitleFilter)}
            </Grid>
            <Grid item>
                {renderSelect("Домашняя работа", homeworkTitleFilter, s => s.homeworkTitle!, setHomeworkTitleFilter)}
            </Grid>
            <Grid item>
                {renderSelect("Задание", taskTitleFilter, s => s.taskTitle!, setTaskTitleFilter)}
            </Grid>
            <Grid item>
                {renderSelect("Студент", studentNameFilter, s => renderStudent(s.student!), setStudentNameFilter)}
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
                                    to={`courses/${solution.courseId}/task/${solution.taskId}/${solution.student!.userId}`}
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
