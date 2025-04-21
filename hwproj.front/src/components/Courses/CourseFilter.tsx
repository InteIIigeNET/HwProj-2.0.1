import React, {FC, useEffect, useState} from 'react';
import {HomeworkViewModel, AccountDataDto} from '../../api';
import Grid from "@material-ui/core/Grid";
import {Autocomplete} from "@mui/material";
import TextField from "@material-ui/core/TextField";
import ApiSingleton from "../../api/ApiSingleton";
import ErrorsHandler from "../Utils/ErrorsHandler";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from "@material-ui/core/Button";

interface ICourseFilterProps {
    courseId: number;
    mentorId: string;
    onSelectedHomeworksChange: (homeworks: HomeworkViewModel[]) => void;
    onSelectedStudentsChange: (students: AccountDataDto[]) => void;
    onWorkspaceInitialize: (success: boolean, errors?: string[]) => void;
    isStudentsSelectionHidden: boolean;
}

interface ICourseFilterState {
    courseHomeworks: HomeworkViewModel[];
    courseStudents: AccountDataDto[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
}

// Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
const CourseFilter: FC<ICourseFilterProps> = (props) => {
    const [state, setState] = useState<ICourseFilterState>({
        courseHomeworks: [],
        courseStudents: [],
        selectedHomeworks: [],
        selectedStudents: []
    });

    // Состояние для отображения элемента загрузки
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Состояние для отображения поля выбора студентов
    const [isStudentsSelectionHidden, setIsStudentsSelectionHidden] = useState<boolean>(props.isStudentsSelectionHidden);

    // Если у преподавателя в workspace все студенты, отображаем "Все" в компоненте, значений при этом не выбрано.
    // Функция, необходимые для корректного отображения выбранных элементов.
    function getItemsView<T>(selected: T[], all: T[]): T[] {
        return selected.length === all.length ? [] : selected;
    }

    useEffect(() => {
        const fetchCourseDataForMentor = async () => {
            try {
                const courseViewModel = await ApiSingleton.coursesApi.coursesGetAllCourseData(props.courseId);
                const mentorWorkspace =
                    await ApiSingleton.coursesApi.coursesGetMentorWorkspace(props.courseId, props.mentorId);

                props.onSelectedStudentsChange(mentorWorkspace.students ?? [])
                props.onSelectedHomeworksChange(mentorWorkspace.homeworks ?? [])

                // Для корректного отображения "Все" при инцициализации (получении данных с бэкенда)
                const allCourseStudentsCount = (courseViewModel.acceptedStudents?.length ?? 0) + (courseViewModel.newStudents?.length ?? 0);
                const initSelectedStudentsView = mentorWorkspace.students?.length === allCourseStudentsCount ?
                    [] : (mentorWorkspace.students) ?? [];
                const initSelectedHomeworksView = mentorWorkspace.homeworks?.length === courseViewModel.homeworks?.length ?
                    [] : (mentorWorkspace.homeworks ?? []);

                setState(prevState => ({
                    ...prevState,
                    courseHomeworks: courseViewModel.homeworks ?? [],
                    courseStudents: courseViewModel.acceptedStudents ?? [],
                    selectedStudents: initSelectedStudentsView,
                    selectedHomeworks: initSelectedHomeworksView,
                }))

                setIsLoading(false);
                props.onWorkspaceInitialize(true);
            } catch (e) {
                const errors = await ErrorsHandler.getErrorMessages(e as Response);
                setState((prevState) => ({
                    ...prevState,
                    errors: errors
                }))
                setIsLoading(false);
                props.onWorkspaceInitialize(false, errors);
            }
        }

        fetchCourseDataForMentor();
    }, [])

    useEffect(() => {
        props.onSelectedStudentsChange(state.selectedStudents)
    }, [state.selectedStudents]);

    useEffect(() => {
        props.onSelectedHomeworksChange(state.selectedHomeworks)
    }, [state.selectedHomeworks]);

    return (
        <div>
            {isLoading ? (
                <div className="container">
                    <DotLottieReact
                        src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                        loop
                        autoplay
                    />
                </div>
            ) : (
                //TODO: унифицировать
                <Grid container style={{marginTop: '10px'}}>
                    <Grid container spacing={2} style={{marginTop: '2px'}}>
                        <Grid item xs={12} sm={12}>
                            <Autocomplete
                                multiple
                                fullWidth
                                options={state.courseHomeworks}
                                getOptionLabel={(option: HomeworkViewModel) => option.title ?? "Без названия"}
                                getOptionKey={(option: HomeworkViewModel) => option.id ?? 0}
                                filterSelectedOptions
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={state.selectedHomeworks.length === 0 ? "" : "Работы"}
                                        placeholder={state.selectedHomeworks.length === 0 ? "Все работы" : ""}
                                    />
                                )}
                                noOptionsText={'На курсе больше нет работ'}
                                value={state.selectedHomeworks}
                                onChange={(_, values) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        selectedHomeworks: values,
                                    }))
                                }}
                            />
                        </Grid>
                    </Grid>
                    {isStudentsSelectionHidden ? (
                        <div style={{marginTop: '15px'}}>
                            <Button size={"small"} color="primary"
                                    onClick={() => setIsStudentsSelectionHidden(false)}>
                                Выбрать студентов
                            </Button>
                        </div>
                    ) : (
                        <Grid container spacing={2} style={{marginTop: '12px'}}>
                            <Grid item xs={12} sm={12}>
                                <Autocomplete
                                    multiple
                                    fullWidth
                                    options={state.courseStudents}
                                    getOptionLabel={(option: AccountDataDto) => option.name + ' ' + option.surname}
                                    getOptionKey={(option: AccountDataDto) => option.userId ?? ""}
                                    filterSelectedOptions
                                    isOptionEqualToValue={(option, value) => option.userId === value.userId}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label={state.selectedStudents.length === 0 ? "" : "Студенты"}
                                            placeholder={state.selectedStudents.length === 0 ? "Все студенты" : ""}
                                        />)}
                                    noOptionsText={'На курсе больше нет студентов'}
                                    value={state.selectedStudents}
                                    onChange={(_, values) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            selectedStudents: values
                                        }));
                                    }}
                                />
                            </Grid>
                        </Grid>

                    )}
                </Grid>
            )}
        </div>
    )
}

export default CourseFilter;