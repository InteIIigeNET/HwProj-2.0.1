import React, {FC, useEffect, useState} from 'react';
import {HomeworkViewModel, AccountDataDto, MentorToAssignedStudentsDTO} from '../../api';
import Grid from "@material-ui/core/Grid";
import {Autocomplete, Chip, Stack, Typography} from "@mui/material";
import TextField from "@material-ui/core/TextField";
import ApiSingleton from "../../api/ApiSingleton";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {DotLottieReact} from '@lottiefiles/dotlottie-react';
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
    mentors: AccountDataDto[];
    assignedStudents: MentorToAssignedStudentsDTO[]
}

// Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
const CourseFilter: FC<ICourseFilterProps> = (props) => {
    const [state, setState] = useState<ICourseFilterState>({
        courseHomeworks: [],
        courseStudents: [],
        selectedHomeworks: [],
        selectedStudents: [],
        assignedStudents: [],
        mentors: []
    });

    // Состояние для отображения элемента загрузки
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Состояние для отображения поля выбора студентов
    const [isStudentsSelectionHidden, setIsStudentsSelectionHidden] = useState<boolean>(props.isStudentsSelectionHidden);

    useEffect(() => {
        const fetchCourseDataForMentor = async () => {
            try {
                const {
                    course,
                    assignedStudents
                } = await ApiSingleton.coursesApi.coursesGetAllCourseData(props.courseId);
                if (course === undefined || assignedStudents === undefined) return

                const mentorWorkspace =
                    await ApiSingleton.coursesApi.coursesGetMentorWorkspace(props.courseId, props.mentorId);

                props.onSelectedStudentsChange(mentorWorkspace.students ?? [])
                props.onSelectedHomeworksChange(mentorWorkspace.homeworks ?? [])

                // Для корректного отображения "Все" при инцициализации (получении данных с бэкенда)
                const allCourseStudentsCount = (course.acceptedStudents?.length ?? 0) + (course.newStudents?.length ?? 0);
                const initSelectedStudentsView = mentorWorkspace.students?.length === allCourseStudentsCount ?
                    [] : (mentorWorkspace.students) ?? [];
                const initSelectedHomeworksView = mentorWorkspace.homeworks?.length === course.homeworks?.length ?
                    [] : (mentorWorkspace.homeworks ?? []);

                setState(prevState => ({
                    ...prevState,
                    courseHomeworks: course.homeworks ?? [],
                    courseStudents: course.acceptedStudents ?? [],
                    selectedStudents: initSelectedStudentsView,
                    selectedHomeworks: initSelectedHomeworksView,
                    mentors: course.mentors!,
                    assignedStudents: assignedStudents.filter(x => x.mentorId !== props.mentorId)
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

    //TODO: memoize?
    const getAssignedMentors = (studentId: string) =>
        state.assignedStudents
            .filter(x => x.selectedStudentsIds!.includes(studentId))
            .map(x => state.mentors.find(m => m.userId === x.mentorId))
            .filter(x => x !== undefined)
            .map(x => x.name + ' ' + x.surname)

    const studentsWithMultipleReviewers = new Set(
        state.selectedStudents
            .map(x => x.userId!)
            .filter(x => getAssignedMentors(x).length > 0)
    )

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
                                        label={state.selectedHomeworks.length === 0 ? "" : "Задания"}
                                        placeholder={state.selectedHomeworks.length === 0 ? "Все задания" : ""}
                                    />
                                )}
                                noOptionsText={'Больше нет заданий для выбора'}
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
                                <Stack direction={"column"}>
                                    <Autocomplete
                                        multiple
                                        fullWidth
                                        options={state.courseStudents}
                                        getOptionLabel={(option: AccountDataDto) => {
                                            const assignedMentors = getAssignedMentors(option.userId!)
                                            const suffix = assignedMentors.length > 0 ? " — преподаватель " + assignedMentors[0] + "" : ""
                                            return option.surname + ' ' + option.name + suffix;
                                        }}
                                        getOptionKey={(option: AccountDataDto) => option.userId ?? ""}
                                        filterSelectedOptions
                                        isOptionEqualToValue={(option, value) => option.userId === value.userId}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label={state.selectedStudents.length === 0 ? "" : `Студенты (${state.selectedStudents.length})`}
                                                placeholder={state.selectedStudents.length === 0 ? "Все студенты" : ""}
                                            />)}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) =>
                                                <Chip
                                                    label={option.surname + ' ' + option.name}
                                                    {...getTagProps({index})}
                                                    style={studentsWithMultipleReviewers.has(option.userId!) ? {color: "#3f51b5"} : undefined}
                                                />)
                                        }
                                        noOptionsText={'Больше нет студентов для выбора'}
                                        value={state.selectedStudents}
                                        onChange={(_, values) => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                selectedStudents: values
                                            }));
                                        }}
                                    />
                                    {studentsWithMultipleReviewers.size > 0 &&
                                        <Typography align="center" variant={"caption"} color={"#3f51b5"}>
                                            Синим выделены студенты, закрепленные за несколькими преподавателями
                                        </Typography>}
                                </Stack>
                            </Grid>
                        </Grid>

                    )}
                </Grid>
            )}
        </div>
    )
}

export default CourseFilter;