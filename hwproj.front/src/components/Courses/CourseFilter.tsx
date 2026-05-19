import React, {FC, useEffect, useState} from 'react';
import {HomeworkViewModel, AccountDataDto, MentorToAssignedStudentsDTO, GroupViewModel } from '../../api';
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
    onSelectedGroupsChange: (groups: GroupViewModel[]) => void;
    onWorkspaceInitialize: (success: boolean, errors?: string[]) => void;
    isStudentsSelectionHidden: boolean;
}

interface ICourseFilterState {
    courseHomeworks: HomeworkViewModel[];
    courseStudents: AccountDataDto[];
    courseGroups: GroupViewModel[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    selectedGroups: GroupViewModel[];
    mentors: AccountDataDto[];
    assignedStudents: MentorToAssignedStudentsDTO[]
}

// Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
const CourseFilter: FC<ICourseFilterProps> = (props) => {
    const [state, setState] = useState<ICourseFilterState>({
        courseHomeworks: [],
        courseStudents: [],
        courseGroups: [],
        selectedHomeworks: [],
        selectedStudents: [],
        selectedGroups: [],
        assignedStudents: [],
        mentors: []
    });

    // Состояние для отображения элемента загрузки
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Состояние для отображения поля выбора студентов
    const [isStudentsSelectionHidden, setIsStudentsSelectionHidden] = useState<boolean>(props.isStudentsSelectionHidden);

    const isAccountDataDto = (obj: any): obj is AccountDataDto => 'userId' in obj;
    const isGroupViewModel = (obj: any): obj is GroupViewModel => 'id' in obj && 'name' in obj;

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

                setState(prevState => ({
                    ...prevState,
                    courseHomeworks: course.homeworks ?? [],
                    courseStudents: course.acceptedStudents ?? [],
                    courseGroups: course.groups?.filter(g => g.name?.trim()) ?? [],
                    selectedHomeworks: mentorWorkspace.homeworks ?? [],
                    selectedStudents: mentorWorkspace.students ?? [],
                    selectedGroups: mentorWorkspace.groups ?? [],
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

    useEffect(() => {
        props.onSelectedGroupsChange(state.selectedGroups)
    }, [state.selectedGroups]);

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
                                options={state.courseHomeworks.filter(h =>
                                    !h.groupId
                                    || state.selectedGroups.length === 0
                                    || state.selectedGroups.some(g => g.id === h.groupId)
                                )}
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
                                        options={(() => {
                                            const availableStudents = state.courseStudents.filter(
                                                s => !state.selectedGroups.some(g => g.studentsIds?.includes(s.userId!))
                                            );
                                            return [...state.courseGroups, ...availableStudents];
                                        })()}
                                        getOptionKey={(option) => {
                                            if (isAccountDataDto(option)) return option.userId ?? '';
                                            return option.id?.toString() ?? '';
                                        }}
                                        filterSelectedOptions
                                        isOptionEqualToValue={(option, value) => {
                                            if (isAccountDataDto(option) && isAccountDataDto(value)) {
                                                return option.userId === value.userId;
                                            }
                                            if (isGroupViewModel(option) && isGroupViewModel(value)) {
                                                return option.id === value.id;
                                            }
                                            return false;
                                        }}
                                        renderInput={(params) => {
                                            const totalSelectedStudents =
                                                state.selectedStudents.length +
                                                [...new Set(state.selectedGroups.flatMap(g => g.studentsIds))].length;

                                            return (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    label={totalSelectedStudents === 0 ? '' : `Студенты (${totalSelectedStudents})`}
                                                    placeholder={totalSelectedStudents === 0 ? 'Все студенты' : ''}
                                                />
                                            );
                                        }}
                                        renderTags={(value, getTagProps) => (
                                            <>
                                                {value.map((option, index) => {
                                                    // Исключаем поле key из пропсов, если оно там есть
                                                    const { key: _key, ...chipProps } = getTagProps({ index });

                                                    if (isAccountDataDto(option)) {
                                                        return (
                                                            <Chip
                                                                key={option.userId}
                                                                {...chipProps}
                                                                label={`${option.surname} ${option.name}`}
                                                                style={studentsWithMultipleReviewers.has(option.userId!) ? {color: "#3f51b5"} : undefined}
                                                            />
                                                        );
                                                    } else {
                                                        return (
                                                            <Chip
                                                                key={option.id}
                                                                {...chipProps}
                                                                label={option.name}
                                                                color="primary"
                                                            />
                                                        );
                                                    }
                                                })}
                                            </>
                                        )}
                                        renderOption={(props, option) => {
                                            if(isGroupViewModel(option)) {
                                                return (
                                                    <li {...props} style={{ color: "#3f51b5" }} key={option.id}>
                                                        {option.name}
                                                    </li>
                                                );
                                            } else {
                                                const assignedMentors = getAssignedMentors(option.userId!);
                                                const suffix = assignedMentors.length > 0 ? ` — преподаватель ${assignedMentors[0]}` : '';
                                                return (
                                                    <li {...props} key={option.userId}>
                                                        {option.surname} {option.name}{suffix}
                                                    </li>
                                                );
                                            }
                                        }}
                                        noOptionsText="Больше нет студентов для выбора"
                                        value={[...state.selectedStudents, ...state.selectedGroups]}
                                        onChange={(_, values) => {
                                            const newGroups = new Set<GroupViewModel>();
                                            const groupStudentIds = new Set<string>();

                                            // Сначала собираем все группы и id их студентов
                                            for (const item of values) {
                                                if (isGroupViewModel(item) && item.studentsIds) {
                                                    item.studentsIds?.forEach(sid => groupStudentIds.add(sid));
                                                    newGroups.add(item);
                                                }
                                            }

                                            // Добавляем только студентов, не входящих ни в одну из выбранных групп
                                            const newStudents = new Array<AccountDataDto>();
                                            for (const item of values) {
                                                if (isAccountDataDto(item) && item.userId && !groupStudentIds.has(item.userId)) {
                                                    newStudents.push(item);
                                                }
                                            }

                                            const selectedGroups = [...newGroups];
                                            setState((prev) => ({
                                                ...prev,
                                                selectedStudents: newStudents,
                                                selectedGroups,
                                                selectedHomeworks: prev.selectedHomeworks
                                                    .filter(h =>
                                                        !h.groupId
                                                        || selectedGroups.length === 0
                                                        || selectedGroups.some(g => g.id === h.groupId)),
                                            }))
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
