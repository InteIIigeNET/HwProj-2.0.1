import React, {FC, FormEvent, useState, useEffect} from "react";
import {
    Alert,
    Box,
    Container,
    Divider,
    Paper,
    Step,
    StepButton,
    Stepper,
    Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ApiSingleton from "../../api/ApiSingleton";
import {CoursePreviewView} from "api";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {
    ICreateCourseState,
    CreateCourseStep,
    stepLabels,
    stepIsOptional,
} from "./ICreateCourseState";
import SelectBaseCourse from "./SelectBaseCourse";
import AddCourseInfo from "./AddCourseInfo";
import {CourseTile} from "../Common/CourseTile";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

// Оформление панелей согласовано с редизайном страницы курса и её редактирования
const panelSx = {
    borderRadius: "14px",
    borderColor: "#c4cad2",
    overflow: "hidden",
}

const iconBadgeSx = {
    width: 52,
    height: 52,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "#e8ebfa",
    color: "#3f51b5",
}

const stepperBarSx = {
    px: {xs: 1, sm: 2},
    pt: 2,
    pb: 1.5,
    backgroundColor: "#fafbfe",
}

const stepperSx = {
    "& .MuiStepLabel-label": {
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: 500,
    },
    "& .MuiStepLabel-label.Mui-active": {color: "#3f51b5", fontWeight: 600},
    "& .MuiStepIcon-root": {fontSize: 28, color: "#dfe3f2"},
    "& .MuiStepIcon-root.Mui-active": {color: "#3f51b5"},
    "& .MuiStepIcon-root.Mui-completed": {color: "#2e9e5b"},
    "& .MuiStepConnector-line": {borderColor: "#e3e6ee", borderTopWidth: 2},
}

export const CreateCourse: FC = () => {
    const [state, setState] = useState<ICreateCourseState>({
        activeStep: CreateCourseStep.SelectBaseCourseStep,
        completedSteps: new Set(),
        courseName: "",
        fetchStudents: false,
        isGroupFromList: false,
        programNames: [],
        programName: "",
        groupNames: [],
        selectedGroups: [],
        fetchingGroups: false,
        courseIsLoading: false,
    })

    const {activeStep, completedSteps, baseCourses, selectedBaseCourse} = state

    const navigate = useNavigate()
    const {enqueueSnackbar} = useSnackbar()

    const setBaseCourses = (courses?: CoursePreviewView[]) =>
        setState((prevState) => ({
            ...prevState,
            baseCourses: courses,
        }))

    const setCourseIsLoading = (isLoading: boolean) =>
        setState((prevState) => ({
            ...prevState,
            courseIsLoading: isLoading,
        }))

    const goToStep = (step: CreateCourseStep) =>
        setState((prevState) => ({
            ...prevState,
            activeStep: step,
            completedSteps: new Set(Array.from(prevState.completedSteps).filter(s => s < step)),
        }))

    const skipCurrentStep = () => goToStep(activeStep + 1)

    const stepIsCompleted = (step: CreateCourseStep) => completedSteps.has(step)

    const stepIsDisabled = (step: CreateCourseStep) =>
        step > activeStep || step === CreateCourseStep.SelectBaseCourseStep && !baseCourses?.length

    // Курсы лектора и названия программ грузим одним проходом: раньше список курсов запрашивался дважды
    useEffect(() => {
        const loadData = async () => {
            try {
                const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses()
                if (!userCourses.length) skipCurrentStep()
                setBaseCourses(userCourses)
            } catch (e) {
                skipCurrentStep()
                setBaseCourses([])
                console.error("Ошибка при загрузке курсов лектора:", e)
                enqueueSnackbar(
                    "Не удалось загрузить существующие курсы",
                    {variant: "warning", autoHideDuration: 4000},
                )
            }

            try {
                const programResponse = await ApiSingleton.coursesApi.coursesGetProgramNames()
                const programNames = programResponse
                    .map(model => model.programName)
                    .filter((name): name is string => name !== undefined)
                setState(prev => ({...prev, programNames}))
            } catch (e) {
                console.error("Ошибка при загрузке названий программ:", e)
                enqueueSnackbar(
                    "Не удалось загрузить список программ",
                    {variant: "warning", autoHideDuration: 4000},
                )
            }
        }

        loadData()
    }, [])

    const handleStep = (step: CreateCourseStep) => {
        switch (step) {
            case CreateCourseStep.SelectBaseCourseStep:
                return <SelectBaseCourse
                    state={state}
                    setState={setState}
                />
            case CreateCourseStep.AddCourseInfoStep:
                return <AddCourseInfo
                    state={state}
                    setState={setState}
                />
            default:
                console.error(`Шаг создания курса неопределён: ${step}`)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const courseViewModel = {
            name: state.courseName,
            groupNames: state.selectedGroups,
            isOpen: true,
            baseCourseId: selectedBaseCourse?.id,
            fetchStudents: state.isGroupFromList ? state.fetchStudents : false,
        }
        try {
            setCourseIsLoading(true)
            const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel)
            navigate(`/courses/${courseId}`)
        } catch (e) {
            console.error("Ошибка при создании курса:", e)
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "error"})
        } finally {
            setCourseIsLoading(false)
        }
    }

    const fetchGroups = async (program: string) => {
        if (!program) {
            setState(prev => ({...prev, groupNames: []}));
            return;
        }

        setState(prev => ({...prev, fetchingGroups: true}));
        try {
            const response = await ApiSingleton.coursesApi.coursesGetGroups(program);
            const data = response
                .map(model => model.groupName)
                .filter((name): name is string => name !== undefined);
            setState(prev => ({...prev, groupNames: data}));
        } catch (e) {
            console.error("Error loading group names:", e);
            setState(prev => ({...prev, groupNames: []}));
        } finally {
            setState(prev => ({...prev, fetchingGroups: false}));
        }
    };

    useEffect(() => {
        if (state.programName) {
            fetchGroups(state.programName);
        }
    }, [state.programName]);


    if (!ApiSingleton.authService.isLecturer()) {
        return (
            <Container component="main" maxWidth="sm" sx={{mt: 4}}>
                <Alert severity="warning" sx={{borderRadius: "12px"}}>
                    Страница доступна только преподавателям
                </Alert>
            </Container>
        )
    }

    const courseName = state.courseName.trim()

    return baseCourses ? (
        <Container component="main" maxWidth="sm" sx={{mt: {xs: 2, sm: 3}, mb: 6}}>
            {/* Шапка: пока название не введено — иконка, дальше показываем будущую плитку курса */}
            <Paper variant={"outlined"} sx={{...panelSx, p: {xs: 2, sm: 2.5}, mb: 2}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                    {courseName
                        ? <CourseTile
                            name={courseName}
                            size={52}
                            fontSize={"1.15rem"}
                            borderRadius={"14px"}
                        />
                        : <Box sx={iconBadgeSx}>
                            <AddCircleOutlineIcon sx={{fontSize: 26}}/>
                        </Box>}
                    <Box sx={{minWidth: 0}}>
                        <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                            Новый курс
                        </Typography>
                        <Typography
                            component={"h1"}
                            sx={{
                                fontSize: "1.5rem",
                                fontWeight: 500,
                                lineHeight: 1.25,
                                m: 0,
                                wordBreak: "break-word",
                            }}
                        >
                            {courseName || "Создать курс"}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
            <Paper variant={"outlined"} sx={panelSx}>
                <Box sx={stepperBarSx}>
                    <Stepper alternativeLabel activeStep={activeStep} sx={stepperSx}>
                        {stepLabels.map((label, step) => {
                            const optionalLabel = stepIsOptional(step) ? (
                                <Typography variant="caption" sx={{color: "text.secondary"}}>
                                    Необязательно
                                </Typography>
                            ) : undefined
                            return (
                                <Step
                                    key={step}
                                    completed={stepIsCompleted(step)}
                                    disabled={stepIsDisabled(step)}
                                >
                                    <StepButton optional={optionalLabel} onClick={() => goToStep(step)}>
                                        {label}
                                    </StepButton>
                                </Step>
                            )
                        })}
                    </Stepper>
                </Box>
                <Divider/>
                <Box component={"form"} onSubmit={handleSubmit} sx={{p: {xs: 2, sm: 2.5}}}>
                    {handleStep(activeStep)}
                </Box>
            </Paper>
        </Container>
    ) : (
        <div className="container">
            <DotLottieReact
                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                loop
                autoplay
            />
        </div>
    )
}
