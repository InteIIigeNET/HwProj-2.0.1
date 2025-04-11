import * as React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Container
} from "@material-ui/core";
import {FC, FormEvent, useState, useEffect} from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {CoursePreviewView} from "api";
import "./Styles/CreateCourse.css";
import {makeStyles} from "@material-ui/core/styles";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import SelectBaseCourse from "./SelectBaseCourse";
import AddCourseInfo from "./AddCourseInfo";
import GroupIcon from '@material-ui/icons/Group';
import Autocomplete from "@material-ui/lab/Autocomplete";


enum CreateCourseStep {
    SelectBaseCourseStep = 0,
    AddCourseInfoStep = 1,
    SelectProgramAndGroupStep = 2,
}

const stepLabels = ["Выбор базового курса", "Информация о курсе", "Программа и группа"];
const stepIsOptional = (step: number) => step === CreateCourseStep.SelectBaseCourseStep;

interface ICreateCourseState {
    activeStep: CreateCourseStep;
    skippedSteps: Set<CreateCourseStep>;
    courseName: string;
    groupName: string;
    programName: string;
    courseIsLoading: boolean;
    baseCourses?: CoursePreviewView[];
    baseCourseIndex?: number;
    fetchStudents: boolean;
    isGroupFromList: boolean;
    programNames: string[];
    groupNames: string[];
    fetchingGroups: boolean;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(7),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
    },
}));

const CreateCourse: FC = () => {
    const [state, setState] = useState<ICreateCourseState>({
        activeStep: CreateCourseStep.SelectBaseCourseStep,
        skippedSteps: new Set(),
        courseName: "",
        groupName: "",
        programName: "",
        courseIsLoading: false,
        fetchStudents: false,
        isGroupFromList: false,
        programNames: [],
        groupNames: [],
        fetchingGroups: false,
    });

    const baseCourse =
        state.baseCourses && state.baseCourseIndex !== undefined
            ? state.baseCourses[state.baseCourseIndex]
            : undefined;

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();

    const skipCurrentStep = () =>
        setState((prevState) => ({
            ...prevState,
            activeStep: prevState.activeStep + 1,
            skippedSteps: prevState.skippedSteps.add(prevState.activeStep),
        }));

    const setBaseCourses = (courses?: CoursePreviewView[]) =>
        setState((prevState) => ({
            ...prevState,
            baseCourses: courses,
        }));

    const setCourseIsLoading = (isLoading: boolean) =>
        setState((prevState) => ({
            ...prevState,
            courseIsLoading: isLoading,
        }));

    // Load base courses and program names on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load base courses
                const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses();
                if (!userCourses.length) skipCurrentStep();
                setBaseCourses(userCourses);

                // Load program names
                const programResponse = await ApiSingleton.coursesApi.coursesGetProgramNames();
                const programNames = programResponse
                    .map(model => model.programName)
                    .filter((name): name is string => name !== undefined);
                setState(prev => ({ ...prev, programNames }));
            } catch (e) {
                console.error("Error loading data:", e);
                setBaseCourses([]);
                enqueueSnackbar(
                    "Не удалось загрузить данные",
                    { variant: "warning", autoHideDuration: 4000 },
                );
            }
        };

        loadData();
    }, []);

    // Load groups when program name changes
    useEffect(() => {
        const fetchGroups = async (program: string) => {
            if (!program) {
                setState(prev => ({ ...prev, groupNames: [] }));
                return;
            }

            setState(prev => ({ ...prev, fetchingGroups: true }));
            try {
                const response = await ApiSingleton.coursesApi.coursesGetGroups(program);
                const data = response
                    .map(model => model.groupName)
                    .filter((name): name is string => name !== undefined);
                setState(prev => ({ ...prev, groupNames: data }));
            } catch (e) {
                console.error("Error loading group names:", e);
                setState(prev => ({ ...prev, groupNames: [] }));
            } finally {
                setState(prev => ({ ...prev, fetchingGroups: false }));
            }
        };

        if (state.programName) {
            fetchGroups(state.programName);
        }
    }, [state.programName]);

    const handleNext = () => {
        setState(prev => ({
            ...prev,
            activeStep: prev.activeStep + 1,
        }));
    };

    const handleBack = () => {
        setState(prev => ({
            ...prev,
            activeStep: prev.activeStep - 1,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCourseIsLoading(true);

        const courseViewModel = {
            name: state.courseName,
            groupName: state.groupName,
            isOpen: true,
            baseCourseId: baseCourse?.id,
            fetchStudents: state.isGroupFromList ? state.fetchStudents : false,
        };

        try {
            const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel);
            navigate(`/courses/${courseId}/editHomeWorks`);
        } catch (e) {
            console.error("Ошибка при создании курса:", e);
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response);
            enqueueSnackbar(responseErrors[0], { variant: "error" });
        } finally {
            setCourseIsLoading(false);
        }
    };

    const stepIsCompleted = (step: CreateCourseStep) =>
        step < state.activeStep && !state.skippedSteps.has(step);

    const handleStep = (step: CreateCourseStep) => {
        switch (step) {
            case CreateCourseStep.SelectBaseCourseStep:
                return (
                    <div style={{ marginTop: 20 }}>
                        <Typography variant="h6" gutterBottom>
                            Выберите базовый курс (необязательно)
                        </Typography>
                        <Autocomplete
                            options={state.baseCourses || []}
                            getOptionLabel={(option) => option.name || ""}
                            onChange={(_, newValue) => {
                                const index = newValue ? state.baseCourses?.indexOf(newValue) : undefined;
                                setState(prev => ({ ...prev, baseCourseIndex: index }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Базовый курс"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                disabled={state.courseIsLoading}
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                );

            case CreateCourseStep.AddCourseInfoStep:
                return (
                    <div style={{ marginTop: 20 }}>
                        <Typography variant="h6" gutterBottom>
                            Основная информация о курсе
                        </Typography>
                        <TextField
                            required
                            label="Название курса"
                            variant="outlined"
                            fullWidth
                            value={state.courseName}
                            onChange={(e) =>
                                setState(prev => ({ ...prev, courseName: e.target.value }))
                            }
                            style={{ marginBottom: 20 }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                            <Button onClick={handleBack}>Назад</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                disabled={!state.courseName || state.courseIsLoading}
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                );

            case CreateCourseStep.SelectProgramAndGroupStep:
                return (
                    <div style={{ marginTop: 20 }}>
                        <Typography variant="h6" gutterBottom>
                            Программа и группа
                        </Typography>

                        <Autocomplete
                            freeSolo
                            value={state.programName}
                            onChange={(_, newValue) => {
                                setState(prev => ({
                                    ...prev,
                                    programName: newValue || '',
                                    groupName: '',
                                    isGroupFromList: false,
                                }));
                            }}
                            options={state.programNames}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Название программы"
                                    variant="outlined"
                                    fullWidth
                                    style={{ marginBottom: 20 }}
                                />
                            )}
                            fullWidth
                        />

                        {state.programName ? (
                            <Autocomplete
                                freeSolo
                                value={state.groupName}
                                onChange={(_, newValue) => {
                                    const isFromList = state.groupNames.includes(newValue || '');
                                    setState(prev => ({
                                        ...prev,
                                        groupName: newValue || '',
                                        isGroupFromList: isFromList,
                                        fetchStudents: isFromList ? prev.fetchStudents : false,
                                    }));
                                }}
                                options={state.groupNames}
                                loading={state.fetchingGroups}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Название группы"
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: 20 }}
                                    />
                                )}
                                fullWidth
                            />
                        ) : (
                            <TextField
                                label="Название группы"
                                variant="outlined"
                                fullWidth
                                value={state.groupName}
                                onChange={(e) => {
                                    setState(prev => ({
                                        ...prev,
                                        groupName: e.target.value,
                                        isGroupFromList: false,
                                        fetchStudents: false,
                                    }));
                                }}
                                style={{ marginBottom: 20 }}
                            />
                        )}

                        {state.isGroupFromList && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.fetchStudents}
                                        onChange={(e, checked) => {
                                            setState(prev => ({ ...prev, fetchStudents: checked }));
                                        }}
                                        color="primary"
                                    />
                                }
                                label="Добавить всех студентов из группы"
                                style={{ marginBottom: 20 }}
                            />
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                            <Button onClick={handleBack}>Назад</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={state.courseIsLoading || !state.groupName}
                            >
                                {state.courseIsLoading ? 'Создание...' : 'Создать курс'}
                            </Button>
                        </div>
                    </div>
                );

            default:
                console.error(`Шаг создания курса неопределён: ${step}`);
                return null;
        }
    };

    if (!ApiSingleton.authService.isLecturer()) {
        return (
            <Typography component="h1" variant="h5">
                Страница не доступна
            </Typography>
        );
    }

    return (
        <Container component="main" maxWidth="sm">
            <div className={classes.paper}>
                <GroupIcon
                    fontSize="large"
                    style={{ color: 'white', backgroundColor: '#ecb50d' }}
                    className={classes.avatar}
                />
                <Typography component="h1" variant="h5">
                    Создать курс
                </Typography>

                <form onSubmit={handleSubmit} className={classes.form}>
                    <Stepper alternativeLabel activeStep={state.activeStep}>
                        {stepLabels.map((label, step) => {
                            const optionalLabel = stepIsOptional(step) ? (
                                <Typography variant="caption">Необязательно</Typography>
                            ) : undefined;
                            return (
                                <Step
                                    key={label}
                                    completed={stepIsCompleted(step)}
                                    style={{ textAlign: "center" }}
                                >
                                    <StepLabel optional={optionalLabel}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>

                    {handleStep(state.activeStep)}
                </form>
            </div>
        </Container>
    );
};

export default CreateCourse;