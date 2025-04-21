import {
    Stepper,
    Step,
    StepLabel,
    StepButton,
    Typography,
} from "@material-ui/core";
import React, {FC, FormEvent, useState, useEffect} from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {CoursePreviewView} from "api";
import "./Styles/CreateCourse.css";
import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
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
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(7),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
    },
}))

const CreateCourse: FC = () => {
    const [state, setState] = useState<ICreateCourseState>({
        activeStep: CreateCourseStep.SelectBaseCourseStep,
        completedSteps: new Set(),
        courseName: "",
        groupName: "",
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
            groupName: state.groupName,
            isOpen: true,
            baseCourseId: selectedBaseCourse?.id,
        }
        try {
            setCourseIsLoading(true)
            const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel)
            navigate(`/courses/${courseId}/editHomeWorks`)
        } catch (e) {
            console.error("Ошибка при создании курса:", e)
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "error"})
        }

        setCourseIsLoading(false)
    }

    const classes = useStyles()

    if (!ApiSingleton.authService.isLecturer()) {
        return (
            <Typography component="h1" variant="h5">
                Страница не доступна
            </Typography>
        )
    }
    return baseCourses ? (
        <Container component="main" maxWidth="sm">
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Создать курс
                </Typography>
                <form onSubmit={handleSubmit} className={classes.form}>
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
            </div>
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

export default CreateCourse
