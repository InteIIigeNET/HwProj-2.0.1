import * as React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import ApiSingleton from "../../api/ApiSingleton";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {FC, useEffect, useState} from "react";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import Lecturers from "./Lecturers";
import {CourseTile} from "../Common/CourseTile";
import {AccountDataDto} from "../../api";
import {appBarStateManager} from "../AppBar";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface IEditCourseState {
    isLoaded: boolean,
    // Название на момент загрузки: шапка страницы не должна дёргаться, пока правят поле
    title: string,
    name: string,
    groupName?: string,
    isCompleted: boolean,
    mentors: AccountDataDto[],
    edited: boolean,
    deleted: boolean,
    lecturerEmail: string;
}

// Оформление панелей согласовано с редизайном страницы курса и списка курсов
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const panelHeaderSx = {
    px: 1.5,
    py: 1,
    backgroundColor: "#f3f4fb",
    color: "#3f51b5",
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

// Колонки раскладки: Grid container со spacing нельзя вкладывать в Stack со spacing —
// Stack ставит детям margin: 0 и стирает отрицательные отступы Grid, из-за чего появляется лишний сдвиг
const columnSx = (share: number) => ({
    width: "100%",
    minWidth: 0,
    flex: {md: `${share} 1 0`},
})

const optionRowSx = {
    px: 1.5,
    py: 1,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
}

const EditCourse: FC = () => {
    const {courseId} = useParams()

    const [courseState, setCourseState] = useState<IEditCourseState>({
        isLoaded: false,
        title: "",
        name: "",
        groupName: "",
        isCompleted: false,
        mentors: [],
        edited: false,
        deleted: false,
        lecturerEmail: "",
    })

    useEffect(() => {
        getCourse()
        appBarStateManager.setContextAction({actionName: "К курсу", link: `/courses/${courseId}`})
        return () => appBarStateManager.reset()
    }, [])

    const getCourse = async () => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(+courseId!)
        setCourseState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: course.name!,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isCompleted: course.isCompleted!,
            mentors: course.mentors!,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const courseViewModel = {
            name: courseState.name,
            groupName: courseState.groupName,
            isOpen: true,
            isCompleted: courseState.isCompleted
        };

        await ApiSingleton.coursesApi.coursesUpdateCourse(+courseId!, courseViewModel)
        setCourseState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    if (courseState.isLoaded) {
        if (courseState.edited) {
            return <Navigate to={'/courses/' + courseId}/>
        }

        if (courseState.deleted) {
            return <Navigate to='/'/>
        }

        if (!courseState.mentors.filter((mentor) =>
            mentor.email === ApiSingleton.authService.getUserEmail())) {
            return (
                <div className="container">
                    <Alert severity="warning" sx={{mt: 2, borderRadius: "12px"}}>
                        Только преподаватель может редактировать курс
                    </Alert>
                </div>
            )
        }

        return (
            <div className="container">
                <Stack spacing={2} sx={{mt: 2, mb: 2}}>
                    <Paper variant={"outlined"} sx={{...panelSx, p: {xs: 2, sm: 2.5}}}>
                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                            <CourseTile
                                name={courseState.title}
                                size={52}
                                fontSize={"1.15rem"}
                                borderRadius={"14px"}/>
                            <Box sx={{minWidth: 0}}>
                                <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                    Редактирование курса
                                </Typography>
                                <Typography
                                    component={"h1"}
                                    sx={{fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25, m: 0}}
                                >
                                    {courseState.title}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        spacing={2}
                        alignItems={"flex-start"}
                    >
                        <Box sx={columnSx(7)}>
                            <Paper variant={"outlined"} sx={panelSx}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1} sx={panelHeaderSx}>
                                    <TuneOutlinedIcon fontSize={"small"}/>
                                    <Typography variant={"body2"} sx={{fontWeight: 500}}>Основное</Typography>
                                </Stack>
                                <Divider/>
                                <Box component={"form"} onSubmit={handleSubmit} sx={{p: {xs: 2, sm: 2.5}}}>
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            required
                                            size={"small"}
                                            label="Название курса"
                                            variant="outlined"
                                            sx={inputSx}
                                            value={courseState.name}
                                            onChange={(e) => setCourseState((prevState) => ({
                                                ...prevState,
                                                name: e.target.value
                                            }))}
                                        />
                                        <TextField
                                            fullWidth
                                            size={"small"}
                                            label="Номер группы"
                                            variant="outlined"
                                            sx={inputSx}
                                            value={courseState.groupName}
                                            onChange={(e) => setCourseState((prevState) => ({
                                                ...prevState,
                                                groupName: e.target.value
                                            }))}
                                        />
                                        <Box sx={optionRowSx}>
                                            <FormControlLabel
                                                sx={{m: 0}}
                                                control={
                                                    <Checkbox
                                                        color="primary"
                                                        checked={courseState.isCompleted}
                                                        onChange={(e) => setCourseState((prevState) => ({
                                                            ...prevState,
                                                            isCompleted: e.target.checked
                                                        }))}
                                                    />
                                                }
                                                label="Завершённый курс"
                                            />
                                            <Typography variant={"caption"}
                                                        sx={{display: "block", pl: 4, color: "text.secondary"}}>
                                                Курс получит плашку «Завершён» в списке курсов
                                            </Typography>
                                        </Box>
                                        <Button
                                            fullWidth
                                            color="primary"
                                            variant="contained"
                                            disableElevation
                                            type="submit"
                                            disabled={!courseState.name.trim()}
                                            sx={{textTransform: "none", borderRadius: "10px", py: 1}}
                                        >
                                            Сохранить изменения
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                        <Box sx={columnSx(5)}>
                            <Lecturers
                                update={getCourse}
                                mentors={courseState.mentors}
                                courseId={courseId!}
                                isEditCourse={true}
                            />
                        </Box>
                    </Stack>
                </Stack>
            </div>
        );
    }

    return (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}

export default EditCourse
