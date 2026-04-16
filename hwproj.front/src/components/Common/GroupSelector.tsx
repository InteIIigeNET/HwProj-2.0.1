import {FC, useEffect, useMemo, useState} from "react";
import {
    Grid,
    TextField,
    Autocomplete,
    Button,
    Stack,
    CircularProgress,
    Chip,
    Alert,
    AlertTitle,
    Typography
} from "@mui/material";
import ApiSingleton from "../../api/ApiSingleton";
import {GroupViewModel, AccountDataDto} from "@/api";


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

const GroupSelector: FC<GroupSelectorProps> = (props) => {
    const groups = [{id: -1, name: ""}, {
        id: undefined,
        name: "Все студенты"
    }, ...(props.groups || []).filter(x => x.name)]
    const selectedGroup = groups.find(g => g.id == props.selectedGroupId)
    const [formState, setFormState] = useState<{
        name: string,
        memberIds: string[]
    }>({
        name: selectedGroup?.name || "",
        memberIds: selectedGroup?.studentsIds || []
    });

    useEffect(() => {
        setFormState({
            name: selectedGroup?.name || "",
            memberIds: selectedGroup?.studentsIds || []
        })
    }, [props.selectedGroupId, props.groups])

    const [isSubmitting, setIsSubmitting] = useState(false);

    const studentToGroups = useMemo(() => {
        const map = new Map<string, string[]>();
        (props.groups || []).concat(formState).forEach(g => {
            g.studentsIds?.forEach(stId => {
                if (!map.has(stId)) map.set(stId, []);
                map.get(stId)!.push(g.name!);
            });
        });
        return map;
    }, [props.groups, props.selectedGroupId, formState.memberIds]);

    const studentsInMultipleGroups = useMemo(() => {
        const set = new Set<string>();
        studentToGroups.forEach((groups, studentId) => {
            if (groups.length > 1) set.add(studentId);
        });
        return set;
    }, [studentToGroups]);

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

    return (
        <Grid container xs={12} spacing={1}>
            <Grid item xs={12}>
                <Autocomplete
                    freeSolo={props.selectedGroupId != undefined}
                    disableClearable={props.selectedGroupId == undefined}
                    fullWidth
                    options={props.selectedGroupId == undefined ? groups : []}
                    disabled={props.choiceDisabled}
                    renderOption={(props, option) => {
                        if (option.id === -1)
                            return <li {...props} style={{color: "#2979ff"}} key={option.id}>+ Добавить новую
                                группу</li>
                        if (option.id == undefined)
                            return <li {...props} key={option.id}><b>{option.name}</b></li>
                        return <li {...props} key={option.id}>{option.name}</li>
                    }}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option?.name!}
                    value={formState.name}
                    onChange={(_, newGroup) => {
                        if (typeof newGroup === 'string') return
                        if (props.selectedGroupId !== newGroup?.id) props.onGroupIdChange(newGroup?.id)
                    }}
                    onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'input' && props.selectedGroupId != undefined) {
                            setFormState(prevState => ({...prevState, name: newInputValue}))
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Группа"
                            placeholder="Введите название группы"
                            variant="outlined"
                        />
                    )}
                />
            </Grid>
            {props.selectedGroupId && selectedGroup && <Grid item xs={12}>
                <Stack direction={"column"}>
                    <Autocomplete
                        multiple
                        fullWidth
                        options={props.courseStudents}
                        value={props.courseStudents?.filter(s => formState.memberIds.includes(s.userId!)) || []}
                        getOptionLabel={(option) => {
                            const groups = studentToGroups.get(option.userId!);
                            const groupSuffix = groups && groups.length > 0
                                ? ' — в группе: ' + groups[0]
                                : '';
                            return `${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}${groupSuffix}`.trim();
                        }}
                        filterSelectedOptions
                        onChange={(_, value) => {
                            setFormState(prev => ({
                                ...prev,
                                memberIds: value
                                    .map(x => x.userId!)
                                    .filter(Boolean)
                            }))
                        }}
                        disabled={isSubmitting}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    {...getTagProps({index})}
                                    label={`${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}`.trim()}
                                    key={option.userId}
                                    style={studentsInMultipleGroups.has(option.userId!) ? {color: "#3f51b5"} : undefined}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Участники группы"
                                placeholder="Выберите студентов"
                            />
                        )}
                        noOptionsText={'Больше нет студентов для выбора'}
                    />
                    <Button
                        onClick={handleSubmitEdit}
                        color="primary"
                        size="small"
                        variant="contained"
                        disabled={isSubmitting || !formState.name.trim() || formState.memberIds.length === 0}
                    >
                        {isSubmitting ? <CircularProgress size={24}/> : "Сохранить группу"}
                    </Button>
                    {studentsInMultipleGroups.size > 0 && formState.memberIds.some(id => studentsInMultipleGroups.has(id)) &&
                        <Typography align="center" variant={"caption"} color={"#3f51b5"}>
                            Синим выделены студенты, состоящие в нескольких группах
                        </Typography>}
                </Stack>
            </Grid>}
            {props.selectedGroupId == undefined && <Grid item xs={12}>
                <Alert severity="info" variant={"outlined"}>
                    <AlertTitle>Создайте или выберите группу</AlertTitle>
                    • Задание будет доступно только студентам из группы
                    <br/>
                    • Вы можете изменить состав группы в любое время
                </Alert>
            </Grid>}
        </Grid>)
}

export default GroupSelector
