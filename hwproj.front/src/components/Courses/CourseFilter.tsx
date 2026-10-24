import React, {FC, useEffect, useMemo, useState} from 'react';
import {HomeworkViewModel, AccountDataDto, MentorToAssignedStudentsDTO, GroupViewModel} from '../../api';
import Grid from "@mui/material/Grid";
import {Autocomplete, Box, Chip, Stack, Tooltip, Typography} from "@mui/material";
import TextField from "@mui/material/TextField";
import ApiSingleton from "../../api/ApiSingleton";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {DotLottieReact} from '@lottiefiles/dotlottie-react';
import Button from "@mui/material/Button";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";
import GroupsIcon from "@mui/icons-material/Groups";
import Utils from "../../services/Utils";

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
    courseGroups: GroupViewModel[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    mentors: AccountDataDto[];
    assignedStudents: MentorToAssignedStudentsDTO[]
}

// Оформление согласовано с приглашением преподавателя: скруглённый инпут и строки с аватарами
const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const getStudentName = (student: AccountDataDto) =>
    `${student.surname ?? ""} ${student.name ?? ""}`.trim()

// Курс отдаёт студентов в порядке записи, поэтому в списке сортируем по алфавиту сами
const compareStudents = (left: AccountDataDto, right: AccountDataDto) =>
    getStudentName(left).localeCompare(getStudentName(right), "ru")

const optionNameSx = {
    fontSize: "0.9375rem",
    fontWeight: 500,
    lineHeight: 1.3,
}

// Аватар вложен в label, а не передан в avatar: так у него сохраняются цвета из UserInitialsAvatar
const studentChipSx = {
    height: 28,
    borderRadius: "14px",
    "& .MuiChip-label": {pl: 0.5, pr: 1},
}

// Группа, за которой закреплены задание или студент, — справочная пометка, а не выбор:
// поэтому плашка нейтрально-серая. Синим здесь помечены студенты с несколькими преподавателями
const groupChipSx = {
    height: 22,
    maxWidth: 190,
    flexShrink: 0,
    backgroundColor: "#eef0f5",
    color: "text.secondary",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.625, mr: -0.25, fontSize: 14, color: "inherit"},
}

// В выбранных плашках группа приписана к названию мелким серым и обрезается,
// чтобы длинное имя группы не растягивало поле
const groupSuffixSx = {
    color: "text.secondary",
    fontSize: "0.75rem",
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
}

const groupPlurals = ["группе", "группах", "группах"]

// Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
const CourseFilter: FC<ICourseFilterProps> = (props) => {
    const [state, setState] = useState<ICourseFilterState>({
        courseHomeworks: [],
        courseStudents: [],
        courseGroups: [],
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
                    courseGroups: course.groups ?? [],
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

    // Безымянные группы не показываем: назвать такую группу в плашке всё равно нечем
    const namedGroups = useMemo(
        () => state.courseGroups.filter(group => group.name?.trim()),
        [state.courseGroups])

    // У задания группа лежит id-шником, а у студента — его id внутри самих групп,
    // поэтому раскладываем группы и по id, и по студентам
    const groupNameById = useMemo(
        () => new Map(namedGroups.map(group => [group.id!, group.name!.trim()])),
        [namedGroups])

    const groupNamesByStudent = useMemo(() => {
        const map = new Map<string, string[]>()
        namedGroups.forEach(group => group.studentsIds?.forEach(studentId => {
            if (!map.has(studentId)) map.set(studentId, [])
            map.get(studentId)!.push(group.name!.trim())
        }))
        return map
    }, [namedGroups])

    const getHomeworkGroup = (homework: HomeworkViewModel) =>
        homework.groupId == undefined ? undefined : groupNameById.get(homework.groupId)

    const getStudentGroups = (studentId: string) => groupNamesByStudent.get(studentId) ?? []

    // Студент может числиться сразу в нескольких группах: одну называем по имени,
    // для нескольких — считаем, полный список остаётся в подсказке
    const groupsLabel = (groupNames: string[]) => groupNames.length === 1
        ? groupNames[0]
        : `в ${groupNames.length} ${Utils.pluralizeHelper(groupPlurals, groupNames.length)}`

    const groupsTitle = (groupNames: string[]) => groupNames.length === 1
        ? `Группа: ${groupNames[0]}`
        : `Группы: ${groupNames.join(", ")}`

    const studentOptions = useMemo(
        () => [...state.courseStudents].sort(compareStudents),
        [state.courseStudents])

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
                                renderOption={(optionProps, option) => {
                                    const groupName = getHomeworkGroup(option)
                                    return <Box component={"li"} {...optionProps} key={option.id}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1.5}
                                               sx={{width: "100%", minWidth: 0}}>
                                            <Typography noWrap sx={{...optionNameSx, flexGrow: 1}}>
                                                {option.title ?? "Без названия"}
                                            </Typography>
                                            {groupName &&
                                                <Chip size={"small"} icon={<GroupsIcon/>} label={groupName}
                                                      sx={groupChipSx}/>}
                                        </Stack>
                                    </Box>
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const groupName = getHomeworkGroup(option)
                                        return <Chip
                                            {...getTagProps({index})}
                                            key={option.id}
                                            label={
                                                <Stack direction={"row"} alignItems={"center"} spacing={0.75}>
                                                    <span>{option.title ?? "Без названия"}</span>
                                                    {groupName &&
                                                        <Box component={"span"} sx={groupSuffixSx}>
                                                            {`· ${groupName}`}
                                                        </Box>}
                                                </Stack>
                                            }
                                        />
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        sx={inputSx}
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
                                        options={studentOptions}
                                        getOptionLabel={(option: AccountDataDto) => {
                                            const assignedMentors = getAssignedMentors(option.userId!)
                                            const suffix = assignedMentors.length > 0 ? " — преподаватель " + assignedMentors[0] + "" : ""
                                            return getStudentName(option) + suffix;
                                        }}
                                        getOptionKey={(option: AccountDataDto) => option.userId ?? ""}
                                        filterSelectedOptions
                                        isOptionEqualToValue={(option, value) => option.userId === value.userId}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                sx={inputSx}
                                                label={state.selectedStudents.length === 0 ? "" : `Студенты (${state.selectedStudents.length})`}
                                                placeholder={state.selectedStudents.length === 0 ? "Все студенты" : ""}
                                            />)}
                                        renderOption={(optionProps, option) => {
                                            const assignedMentors = getAssignedMentors(option.userId!)
                                            const studentGroups = getStudentGroups(option.userId!)
                                            return <Box component={"li"} {...optionProps} key={option.userId}>
                                                <Stack direction={"row"} alignItems={"center"} spacing={1.5}
                                                       sx={{width: "100%", minWidth: 0}}>
                                                    <UserInitialsAvatar user={option} size={32} fontSize={"0.7rem"}/>
                                                    <Box sx={{minWidth: 0, flexGrow: 1}}>
                                                        <Typography sx={optionNameSx}>
                                                            {getStudentName(option)}
                                                        </Typography>
                                                        <Typography variant={"caption"} noWrap
                                                                    sx={{display: "block", color: "text.secondary"}}>
                                                            {assignedMentors.length > 0
                                                                ? "Преподаватель " + assignedMentors[0]
                                                                : option.email}
                                                        </Typography>
                                                    </Box>
                                                    {studentGroups.length > 0 &&
                                                        <Tooltip arrow title={groupsTitle(studentGroups)}>
                                                            <Chip size={"small"} icon={<GroupsIcon/>}
                                                                  label={groupsLabel(studentGroups)}
                                                                  sx={groupChipSx}/>
                                                        </Tooltip>}
                                                </Stack>
                                            </Box>
                                        }}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => {
                                                const studentGroups = getStudentGroups(option.userId!)
                                                const chip = <Chip
                                                    {...getTagProps({index})}
                                                    key={option.userId}
                                                    sx={studentsWithMultipleReviewers.has(option.userId!)
                                                        ? {...studentChipSx, color: "#3f51b5"}
                                                        : studentChipSx}
                                                    label={
                                                        <Stack direction={"row"} alignItems={"center"} spacing={0.75}>
                                                            <UserInitialsAvatar user={option} size={20}
                                                                                fontSize={"0.5625rem"}/>
                                                            <span>{getStudentName(option)}</span>
                                                            {studentGroups.length > 0 &&
                                                                <Box component={"span"} sx={groupSuffixSx}>
                                                                    {`· ${groupsLabel(studentGroups)}`}
                                                                </Box>}
                                                        </Stack>
                                                    }
                                                />
                                                return studentGroups.length === 0
                                                    ? chip
                                                    : <Tooltip arrow key={option.userId}
                                                               title={groupsTitle(studentGroups)}>
                                                        {chip}
                                                    </Tooltip>
                                            })
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