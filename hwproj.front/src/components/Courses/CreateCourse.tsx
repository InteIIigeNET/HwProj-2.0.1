import React, {FC, FormEvent, useState, useEffect} from "react";
import {
    Box,
    Step,
    StepButton,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import ApiSingleton from "../../api/ApiSingleton";
import {CoursePreviewView} from "api";
import "./Styles/CreateCourse.css";
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
import {Container} from "@mui/material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

// theme.spacing(n) в v4 возвращал число 8n, поэтому подставляем итоговые отступы
const pageSx = {
    mt: 7,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

    useEffect(() => {
        const loadBaseCourses = async () => {
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
        };

        loadBaseCourses()
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

    useEffect(() => {
        const loadData = async () => {
            try {
                const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses();
                if (!userCourses.length) skipCurrentStep();
                setBaseCourses(userCourses);

                const programResponse = await ApiSingleton.coursesApi.coursesGetProgramNames();
                const programNames = programResponse
                    .map(model => model.programName)
                    .filter((name): name is string => name !== undefined);
                setState(prev => ({...prev, programNames}));
            } catch (e) {
                console.error("Error loading data:", e);
                setBaseCourses([]);
                enqueueSnackbar(
                    "Не удалось загрузить данные",
                    {variant: "warning", autoHideDuration: 4000},
                );
            }
        };

        loadData();
    }, []);

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
            <Typography component="h1" variant="h5">
                Страница не доступна
            </Typography>
        )
    }

    return baseCourses ? (
        <Container component="main" maxWidth="sm">
            <Box sx={pageSx}>
                <Typography component="h1" sx={{fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25}}>
                    Создать курс
                </Typography>
                <form onSubmit={handleSubmit} style={{marginTop: 24, width: "100%"}}>
                    <Stepper alternativeLabel activeStep={activeStep}>
                        {stepLabels.map((label, step) => {
                            const optionalLabel = stepIsOptional(step) ? (
                                <Typography variant="caption">
                                    Необязательно
                                </Typography>
                            ) : undefined
                            return (
                                <Step
                                    key={step}
                                    completed={stepIsCompleted(step)}
                                    disabled={stepIsDisabled(step)}
                                    style={{textAlign: "center"}}
                                >
                                    <StepButton optional={optionalLabel} onClick={() => goToStep(step)}>
                                        <StepLabel>{label}</StepLabel>
                                    </StepButton>
                                </Step>
                            )
                        })}
                    </Stepper>
                    {handleStep(activeStep)}
                </form>
            </Box>
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