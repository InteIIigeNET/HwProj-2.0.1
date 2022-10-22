import React, {useEffect, useState} from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel, ResultString} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import StudentStatsCell from "../Tasks/StudentStatsCell";
import {Alert, Button, Grid, MenuItem, Select, TextField} from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";

interface IStudentStatsProps {
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface IStudentStatsState {
    searched: string
    googleDocUrl: string
    sheetTitles: ResultString | undefined
}

const StudentStats:  React.FC<IStudentStatsProps> = (props) => {
    const [state, setState] = useState<IStudentStatsState>({
        searched: "",
        googleDocUrl: "",
        sheetTitles: undefined
    });

    const {searched, googleDocUrl, sheetTitles} = state

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey) return
            if (searched && event.key === "Escape") {
                setState({...state, searched: ""});
            } else if (searched && event.key === "Backspace") {
                setState({...state, searched: searched.slice(0, -1)})
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Zа-яА-Я\s]/i)
            ) {
                setState({...state, searched: searched + event.key})
            }
        };

        document.addEventListener('keydown', keyDownHandler);
        return () => document.removeEventListener('keydown', keyDownHandler);
    }, [searched]);

    const homeworks = props.homeworks.filter(h => h.tasks && h.tasks.length > 0)
    const solutions = searched
        ? props.solutions.filter(cm => (cm.surname + " " + cm.name).toLowerCase().includes(searched.toLowerCase()))
        : props.solutions
    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black"
    }

    const handleGoogleDocUrlChange = async (value: string) => {
        const titles = await apiSingleton.statisticsApi.apiStatisticsGetSheetTitlesGet(value) //Post/get?
        setState({...state, googleDocUrl: value, sheetTitles: titles});
    }


    return (
        <div>
            {searched &&
                <Alert style={{marginBottom: 5}} severity="info"><b>Поиск: </b>
                    {searched.replaceAll(" ", "·")}
                </Alert>}
            <TableContainer style={{maxHeight: "100vh"}}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{...fixedColumnStyles, zIndex: -4, color: ""}} align="center"
                                       padding="none"
                                       component="td">
                            </TableCell>
                            {homeworks.map((homework) => (
                                <TableCell
                                    padding="checkbox"
                                    component="td"
                                    align="center"
                                    style={{zIndex: -5}}
                                    colSpan={homework.tasks!.length}
                                >
                                    {homework.title}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...fixedColumnStyles, zIndex: 10}}
                                       component="td"></TableCell>
                            {homeworks.map((homework) =>
                                homework.tasks!.map((task) => (
                                    <TableCell padding="checkbox" component="td" align="center">
                                        {task.title}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.map((cm, index) => (
                            <TableRow key={index} hover style={{height: 35}}>
                                <TableCell
                                    style={fixedColumnStyles}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row"
                                >
                                    {cm.surname} {cm.name}
                                </TableCell>
                                {homeworks.map((homework) =>
                                    homework.tasks!.map((task) => (
                                        <StudentStatsCell
                                            solutions={solutions
                                                .find(s => s.id == cm.id)!.homeworks!
                                                .find(h => h.id == homework.id)!.tasks!
                                                .find(t => t.id == task.id)!.solution!}
                                            userId={props.userId}
                                            forMentor={props.isMentor}
                                            studentId={String(cm.id)}
                                            taskId={task.id!}
                                            taskMaxRating={task.maxRating!}/>
                                    ))
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Grid container spacing={1} style={{marginTop: 15}}>
                <Grid item>
                    <Alert severity="info" variant={"standard"}>
                        Для загрузки таблицы необходимо разрешить доступ на редактирование по ссылке для Google Docs
                        страницы
                    </Alert>
                </Grid>
                <Grid container item spacing={1} alignItems={"center"}>
                    <Grid item>
                        <TextField size={"small"} fullWidth label={"Ссылка на Google Docs"} value={googleDocUrl}
                                   onChange={event => {
                                       event.persist()
                                       handleGoogleDocUrlChange(event.target.value)
                                   }}/>
                    </Grid>
                    {sheetTitles && !sheetTitles.succeeded && <Grid item>
                        <Alert severity="error">
                            {sheetTitles!.errors![0]}
                        </Alert>
                    </Grid>}
                    {sheetTitles && sheetTitles.value && sheetTitles.value.length > 0 && <Grid item>
                        <Select
                            size={"small"}
                            id="demo-simple-select"
                            label="Sheet"
                            value={0}
                        >
                            {sheetTitles.value.map((title, i) => <MenuItem value={i}>{title}</MenuItem>)}
                        </Select>
                    </Grid>}
                    {sheetTitles && sheetTitles.succeeded && <Grid item>
                        <Button fullWidth
                                variant="text"
                                color="primary"
                                type="button">
                            Загрузить
                        </Button>
                    </Grid>}
                </Grid>
            </Grid>
        </div>
    );
}

export default StudentStats;
