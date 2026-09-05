import {FC, useEffect, useMemo, useState} from "react";
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Box,
    Chip,
    createFilterOptions,
    Divider,
    IconButton,
    Link,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ApiSingleton from "../../api/ApiSingleton";
import {GroupViewModel, AccountDataDto} from "@/api";
import {UserInitialsAvatar} from "./UserInitialsAvatar";
import Utils from "../../services/Utils";

interface GroupSelectorProps {
    courseId: number,
    courseStudents: AccountDataDto[],
    groups: GroupViewModel[],
    onGroupIdChange: (groupId?: number) => void,
    onGroupsUpdate: () => void,
    selectedGroupId?: number,
    choiceDisabled?: boolean,
    onCreateNewGroup?: () => void,
}

// Служебный id варианта «добавить новую группу»: настоящих групп с таким id не бывает
const newGroupId = -1

const memberPlurals = ["участник", "участника", "участников"]
const groupPlurals = ["группе", "группах", "группах"]

const getFullName = (student: AccountDataDto) =>
    `${student.surname ?? ""} ${student.name ?? ""} ${student.middleName ?? ""}`.replace(/\s+/g, " ").trim()

// В инпуте выбранные имена не остаются (состав перечислен списком ниже),
// поэтому искать нужно и по почте тоже
const studentFilterOptions = createFilterOptions<AccountDataDto>({
    stringify: option => `${getFullName(option)} ${option.email ?? ""}`,
})

// Подпись группы полей: мелкие капсы читаются как служебный текст и не спорят
// с названиями — та же подпись, что у материалов на странице задания
const sectionLabelSx = {
    color: "text.secondary",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
}

// Состав — не ещё одна карточка внутри карточки задания: вместо рамки с шапкой
// мягкая подложка, а строки внутри плоские (приём взят у материалов задания).
// Поля ввода остаются снаружи, поэтому у них ровно один уровень обводки
const membersBoxSx = {
    borderRadius: "12px",
    backgroundColor: "#f7f8fd",
    overflow: "hidden",
}

const memberDividerSx = {borderColor: "#e4e7f2"}

const countChipSx = {
    height: 20,
    flexShrink: 0,
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const rowSx = {
    px: 1.25,
    py: 1,
    alignItems: "center",
    transition: "background-color .15s",
    "&:hover": {backgroundColor: "rgba(63, 81, 181, 0.06)"},
}

const optionRowSx = {width: "100%", minWidth: 0}

// Круглая плашка в начале каждой строки списка групп: варианты выстраиваются по одной
// сетке, поэтому названия читаются столбиком независимо от вида варианта
const optionIconSx = {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#eef0fa",
    color: "#3f51b5",
}

const nameSx = {fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.3}

const captionSx = {display: "block", color: "text.secondary"}

// Студент в нескольких группах — не ошибка, но повод перепроверить состав,
// поэтому плашка тёплая и заметная, а не красная
const otherGroupsChipSx = {
    height: 22,
    maxWidth: 180,
    flexShrink: 0,
    backgroundColor: "#fff4d6",
    color: "#8a6d00",
    "& .MuiChip-label": {px: 0.75, fontSize: "0.75rem", fontWeight: 500},
    "& .MuiChip-icon": {ml: 0.625, mr: -0.25, fontSize: 14, color: "inherit"},
}

// Убрать студента и отменить выбор группы — действия одного рода: нейтральные,
// пока на них не наведёшься
const dismissButtonSx = {
    flexShrink: 0,
    color: "#9aa1ad",
    "&:hover": {color: "#c62828", backgroundColor: "#fdecec"},
}

const saveButtonSx = {
    textTransform: "none" as const,
    borderRadius: "10px",
    px: 2.5,
    fontWeight: 500,
    flexShrink: 0,
}

const alertSx = {borderRadius: "12px"}

const avatarRingSx = {
    borderRadius: "50%",
    border: "2px solid #fff",
    backgroundColor: "#fff",
    display: "flex",
    flexShrink: 0,
}

// Превью состава: аватарки идут внахлёст, поэтому строка группы в списке
// остаётся одной высоты при любом размере группы
const AvatarStack: FC<{ students: AccountDataDto[], size?: number, max?: number }> =
    ({students, size = 26, max = 4}) => {
        const shown = students.slice(0, max)
        const restCount = students.length - shown.length
        const overlap = `-${Math.round(size / 3)}px`

        return (
            <Stack direction={"row"} sx={{flexShrink: 0}}>
                {shown.map((student, index) => (
                    <Box
                        key={student.userId}
                        // Левые аватарки лежат поверх правых — так первая читается целиком
                        sx={{...avatarRingSx, ml: index === 0 ? 0 : overlap, zIndex: shown.length - index}}
                    >
                        <UserInitialsAvatar user={student} size={size} fontSize={"0.625rem"}/>
                    </Box>
                ))}
                {restCount > 0 &&
                    <Box sx={{
                        ...avatarRingSx,
                        ml: overlap,
                        width: size + 4,
                        height: size + 4,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#eef0f5",
                        color: "text.secondary",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                    }}>
                        {`+${restCount}`}
                    </Box>}
            </Stack>
        )
    }

const GroupSelector: FC<GroupSelectorProps> = (props) => {
    const groupOptions: GroupViewModel[] = [
        {id: newGroupId, name: ""},
        {id: undefined, name: "Все студенты"},
        ...(props.groups || []).filter(x => x.name)
    ]
    const selectedGroup = groupOptions.find(g => g.id == props.selectedGroupId)
    const [formState, setFormState] = useState<{
        name: string,
        memberIds: string[]
    }>({
        name: selectedGroup?.name || "",
        memberIds: selectedGroup?.studentsIds || []
    });

    useEffect(() => {
        // Сразу после создания группы её id уже выбран, а список групп ещё не перезагружен:
        // сбрасывать форму в этот момент нельзя, иначе состав мигнёт пустым
        if (props.selectedGroupId != undefined && !selectedGroup) return
        setFormState({
            name: selectedGroup?.name || "",
            memberIds: selectedGroup?.studentsIds || []
        })
    }, [props.selectedGroupId, props.groups])

    const [isSubmitting, setIsSubmitting] = useState(false);

    const studentsById = useMemo(
        () => new Map((props.courseStudents || []).map(student => [student.userId!, student])),
        [props.courseStudents]);

    // Студент может числиться сразу в нескольких группах — это разрешено, но о таком составе
    // стоит предупредить, поэтому для каждого держим список его остальных групп.
    // Безымянных групп нет и в самом списке групп, поэтому и рядом со студентом
    // о них не сообщаем: назвать такую группу в плашке всё равно нечем
    const otherGroupsByStudent = useMemo(() => {
        const map = new Map<string, string[]>();
        const otherGroups = (props.groups || [])
            .filter(group => group.id !== props.selectedGroupId && group.name?.trim())
        otherGroups.forEach(group => group.studentsIds?.forEach(studentId => {
            if (!map.has(studentId)) map.set(studentId, []);
            map.get(studentId)!.push(group.name!.trim());
        }));
        return map;
    }, [props.groups, props.selectedGroupId]);

    const members = useMemo(
        () => formState.memberIds
            .map(studentId => studentsById.get(studentId))
            .filter((student): student is AccountDataDto => student != undefined),
        [formState.memberIds, studentsById]);

    const getGroupStudents = (group: GroupViewModel) => (group.studentsIds || [])
        .map(studentId => studentsById.get(studentId))
        .filter((student): student is AccountDataDto => student != undefined)

    const handleSubmitEdit = async () => {
        setIsSubmitting(true);
        try {
            if (selectedGroup && selectedGroup.id! > 0) {
                await ApiSingleton.courseGroupsApi.courseGroupsUpdateCourseGroup(
                    props.courseId,
                    selectedGroup.id!,
                    {
                        name: formState.name,
                        groupMates: formState.memberIds.map(studentId => ({studentId})),
                    }
                );
                props.onGroupsUpdate();
            } else {
                const groupId = await ApiSingleton.courseGroupsApi.courseGroupsCreateCourseGroup(props.courseId, {
                    name: formState.name.trim(),
                    groupMatesIds: formState.memberIds,
                    courseId: props.courseId,
                });
                props.onGroupsUpdate();
                props.onGroupIdChange(groupId);
            }
        } catch (error) {
            console.error('Failed to update group:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const removeMember = (studentId: string) => setFormState(prevState => ({
        ...prevState,
        memberIds: prevState.memberIds.filter(id => id !== studentId)
    }))

    // Где ещё состоит студент: одну группу называем по имени, для нескольких — считаем
    const otherGroupsLabel = (groupNames: string[]) => groupNames.length === 1
        ? groupNames[0]
        : `в ${groupNames.length} ${Utils.pluralizeHelper(groupPlurals, groupNames.length)}`

    const otherGroupsTitle = (groupNames: string[]) =>
        `Также в ${Utils.pluralizeHelper(groupPlurals, groupNames.length)}: ${groupNames.join(", ")}`

    // Группа выбрана или создаётся: дальше редактируем её название и состав
    const isEditing = props.selectedGroupId != undefined
    const isNewGroup = props.selectedGroupId === newGroupId
    const canSave = formState.name.trim() !== "" && formState.memberIds.length > 0

    // Форма заполняется автоматически, поэтому без сравнения с исходной группой
    // непонятно, есть ли что сохранять. Пока группа не подгрузилась, сравнивать не с чем
    const initialMemberIds = new Set(selectedGroup?.studentsIds || [])
    const hasChanges = selectedGroup != undefined
        && ((selectedGroup.name || "") !== formState.name
            || initialMemberIds.size !== formState.memberIds.length
            || formState.memberIds.some(studentId => !initialMemberIds.has(studentId)))

    return (
        <Stack spacing={2}>
            {isEditing
                ? <TextField
                    fullWidth
                    size={"small"}
                    label={"Название группы"}
                    placeholder={"Введите название группы"}
                    value={formState.name}
                    disabled={props.choiceDisabled || isSubmitting}
                    onChange={event => setFormState(prevState => ({...prevState, name: event.target.value}))}
                    sx={inputSx}
                    InputProps={{
                        endAdornment: props.choiceDisabled ? undefined : (
                            <Tooltip arrow title={isNewGroup ? "Отменить создание группы" : "Выбрать другую группу"}>
                                <IconButton
                                    size={"small"}
                                    onClick={() => props.onGroupIdChange(undefined)}
                                    disabled={isSubmitting}
                                    sx={dismissButtonSx}
                                >
                                    <CloseIcon fontSize={"small"}/>
                                </IconButton>
                            </Tooltip>
                        ),
                    }}
                />
                : <Autocomplete
                    fullWidth
                    size={"small"}
                    disableClearable
                    options={groupOptions}
                    disabled={props.choiceDisabled}
                    // Без выбранной группы активен вариант «Все студенты», он же всегда есть в списке
                    value={selectedGroup!}
                    getOptionLabel={option => option?.name ?? ""}
                    onChange={(_, newGroup) => {
                        if (props.selectedGroupId !== newGroup?.id) props.onGroupIdChange(newGroup?.id)
                    }}
                    renderOption={(optionProps, option) => {
                        if (option.id === newGroupId)
                            return (
                                <Box component={"li"} {...optionProps} key={option.id}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={1.5}
                                           sx={{...optionRowSx, color: "#3f51b5"}}>
                                        <Box sx={optionIconSx}><AddIcon fontSize={"small"}/></Box>
                                        <Typography sx={nameSx}>Добавить новую группу</Typography>
                                    </Stack>
                                </Box>)
                        if (option.id == undefined)
                            return (
                                <Box component={"li"} {...optionProps} key={"all-students"}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={optionRowSx}>
                                        <Box sx={optionIconSx}><GroupsIcon fontSize={"small"}/></Box>
                                        <Box sx={{minWidth: 0}}>
                                            <Typography sx={{...nameSx, fontWeight: 600}}>{option.name}</Typography>
                                            <Typography variant={"caption"} noWrap sx={captionSx}>
                                                Задание получат все студенты курса
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>)
                        const groupStudents = getGroupStudents(option)
                        return (
                            <Box component={"li"} {...optionProps} key={option.id}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={optionRowSx}>
                                    <Box sx={optionIconSx}>
                                        <Typography sx={{fontSize: "0.8125rem", fontWeight: 600}}>
                                            {option.name?.trim()[0]?.toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{minWidth: 0, flexGrow: 1}}>
                                        <Typography noWrap sx={nameSx}>{option.name}</Typography>
                                        <Typography variant={"caption"} noWrap sx={captionSx}>
                                            {`${groupStudents.length} ${Utils.pluralizeHelper(memberPlurals, groupStudents.length)}`}
                                        </Typography>
                                    </Box>
                                    <AvatarStack students={groupStudents}/>
                                </Stack>
                            </Box>)
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={"Группа"}
                            placeholder={"Выберите группу"}
                            variant={"outlined"}
                            sx={inputSx}
                        />
                    )}
                />}
            {isEditing && <Stack spacing={1.25}>
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <Typography sx={sectionLabelSx}>Участники группы</Typography>
                    {members.length > 0 && <Chip size={"small"} label={members.length} sx={countChipSx}/>}
                </Stack>
                <Autocomplete
                    multiple
                    fullWidth
                    size={"small"}
                    options={props.courseStudents || []}
                    value={members}
                    filterOptions={studentFilterOptions}
                    filterSelectedOptions
                    disableCloseOnSelect
                    disabled={isSubmitting}
                    getOptionLabel={option => getFullName(option)}
                    getOptionKey={option => option.userId!}
                    isOptionEqualToValue={(option, value) => option.userId === value.userId}
                    onChange={(_, value) => {
                        setFormState(prevState => ({
                            ...prevState,
                            memberIds: value
                                .map(x => x.userId!)
                                .filter(Boolean)
                        }))
                    }}
                    // Выбранных не держим плашками в инпуте: они перечислены списком ниже,
                    // а поле остаётся поиском и не растёт вместе с группой
                    renderTags={() => null}
                    renderOption={(optionProps, option) => {
                        const otherGroups = otherGroupsByStudent.get(option.userId!) || []
                        return (
                            <Box component={"li"} {...optionProps} key={option.userId}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={optionRowSx}>
                                    <UserInitialsAvatar user={option} size={32} fontSize={"0.7rem"}/>
                                    <Box sx={{minWidth: 0, flexGrow: 1}}>
                                        <Typography noWrap sx={nameSx}>{getFullName(option)}</Typography>
                                        {option.email &&
                                            <Typography variant={"caption"} noWrap sx={captionSx}>
                                                {option.email}
                                            </Typography>}
                                    </Box>
                                    {otherGroups.length > 0 &&
                                        <Chip
                                            size={"small"}
                                            icon={<GroupsIcon/>}
                                            label={otherGroupsLabel(otherGroups)}
                                            sx={otherGroupsChipSx}
                                        />}
                                </Stack>
                            </Box>
                        )
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={"Добавить студента"}
                            variant={"outlined"}
                            sx={inputSx}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: <PersonAddIcon
                                    fontSize={"small"}
                                    sx={{ml: 0.5, mr: 1, color: "GrayText"}}/>,
                            }}
                        />
                    )}
                    noOptionsText={'Больше нет студентов для выбора'}
                />
                {members.length === 0
                    ? <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                        В группе пока никого нет — добавьте студентов через поиск выше,
                        задание будет доступно только им
                    </Typography>
                    : <Stack sx={membersBoxSx} divider={<Divider sx={memberDividerSx}/>}>
                        {members.map(student => {
                            const otherGroups = otherGroupsByStudent.get(student.userId!) || []
                            return (
                                <Stack key={student.userId} direction={"row"} spacing={1.5} sx={rowSx}>
                                    <UserInitialsAvatar user={student} size={38}/>
                                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                                        <Typography noWrap sx={nameSx}>
                                            <Box component={"span"} sx={{fontWeight: 600}}>{student.surname}</Box>
                                            {` ${student.name ?? ""}`}
                                        </Typography>
                                        {student.email &&
                                            <Link
                                                href={`mailto:${student.email}`}
                                                underline={"hover"}
                                                variant={"caption"}
                                                noWrap
                                                sx={captionSx}
                                            >
                                                {student.email}
                                            </Link>}
                                    </Box>
                                    {otherGroups.length > 0 &&
                                        <Tooltip arrow title={otherGroupsTitle(otherGroups)}>
                                            <Chip
                                                size={"small"}
                                                icon={<GroupsIcon/>}
                                                label={otherGroupsLabel(otherGroups)}
                                                sx={otherGroupsChipSx}
                                            />
                                        </Tooltip>}
                                    <Tooltip arrow title={"Убрать из группы"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={() => removeMember(student.userId!)}
                                            disabled={isSubmitting}
                                            sx={dismissButtonSx}
                                        >
                                            <CloseIcon fontSize={"small"}/>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )
                        })}
                    </Stack>}
            </Stack>}
            {isEditing &&
                <Stack direction={"row"} alignItems={"center"} justifyContent={"flex-end"} spacing={1.5}>
                    {canSave && hasChanges &&
                        <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                            Изменения не сохранены
                        </Typography>}
                    <LoadingButton
                        onClick={handleSubmitEdit}
                        color="primary"
                        variant="contained"
                        disableElevation
                        loading={isSubmitting}
                        loadingPosition={"start"}
                        startIcon={isNewGroup ? <AddIcon fontSize={"small"}/> : <CheckIcon fontSize={"small"}/>}
                        disabled={!canSave || !hasChanges}
                        sx={saveButtonSx}
                    >
                        {isNewGroup ? "Создать группу" : "Сохранить группу"}
                    </LoadingButton>
                </Stack>}
            {!isEditing && !props.choiceDisabled &&
                <Alert severity="info" sx={alertSx}>
                    <AlertTitle>Создайте или выберите группу</AlertTitle>
                    • Задание будет доступно только студентам из группы
                    <br/>
                    • Вы можете изменить состав группы в любое время
                </Alert>}
        </Stack>)
}

export default GroupSelector
