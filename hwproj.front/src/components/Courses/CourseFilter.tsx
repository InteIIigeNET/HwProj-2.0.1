﻿import React, {FC, useEffect, useState} from 'react';
import {HomeworkViewModel, AccountDataDto} from '../../api';
import Grid from "@material-ui/core/Grid";
import {Autocomplete} from "@mui/material";
import TextField from "@material-ui/core/TextField";
import ApiSingleton from "../../api/ApiSingleton";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {CircularProgress} from "@material-ui/core";
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

    // Если у преподавателя в workspace все студенты, отображаем "Все" в компоненте.
    // Функция, необходимые для корректного отображения и передачи данных родителю
    function processSelectedItems<T>(selected: T[], all: T[]): T[] {
        return selected.length === 0 ? all : selected;
    }

    useEffect(() => {
        const fetchCourseDataForMentor = async () => {
            try {
                const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(props.courseId);
                const mentorWorkspace =
                    await ApiSingleton.coursesApi.apiCoursesGetMentorWorkspaceByCourseIdByMentorIdGet(props.courseId, props.mentorId);

                props.onSelectedStudentsChange(mentorWorkspace.students ?? [])
                props.onSelectedHomeworksChange(mentorWorkspace.homeworks ?? [])

                // Для корректного отображения "Все" при инцициализации (получении данных с бэкенда)
                const initSelectedStudentsView = mentorWorkspace.students?.length === courseViewModel.acceptedStudents?.length ?
                    [] : (mentorWorkspace.students) ?? [];
                const initSelectedHomeworksView = mentorWorkspace.homeworks?.length === courseViewModel.homeworks?.length ?
                    [] : (mentorWorkspace.homeworks ?? []);

                setState(prevState => ({
                    ...prevState,
                    courseHomeworks: courseViewModel.homeworks ?? [],
                    courseStudents: courseViewModel.acceptedStudents ?? [],
                    selectedStudents: initSelectedStudentsView,
                    selectedHomeworks: initSelectedHomeworksView
                }))

                setIsLoading(false);
                props.onWorkspaceInitialize(true);
            } catch (e) {
                const errors = await ErrorsHandler.getErrorMessages(e);
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

    return (
        <div>
            {isLoading ? (
                <div className="container">
                    <p>Загружаем данные...</p>
                    <CircularProgress/>
                </div>
            ) : (
                <Grid container style={{marginTop: '10px'}}>
                    <Grid container spacing={2} style={{marginTop: '2px'}}>
                        <Grid item xs={12} sm={12}>
                            <Autocomplete
                                multiple
                                fullWidth
                                options={state.courseHomeworks}
                                getOptionLabel={(option: HomeworkViewModel) => option.title ?? "Без названия"}
                                filterSelectedOptions
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={state.selectedHomeworks.length === 0 ? "" : "Домашние работы"}
                                        placeholder={state.selectedHomeworks.length === 0 ? "Все домашние работы" : ""}
                                    />
                                )}
                                noOptionsText={'На курсе больше нет домашних работ'}
                                value={state.selectedHomeworks}
                                onChange={(_, values) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        selectedHomeworks: values,
                                    }))

                                    const processedValues = processSelectedItems(
                                        values, state.courseHomeworks)
                                    props.onSelectedHomeworksChange(processedValues)
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

                                        const processedValues = processSelectedItems(
                                            values, state.courseStudents);
                                        props.onSelectedStudentsChange(processedValues);
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