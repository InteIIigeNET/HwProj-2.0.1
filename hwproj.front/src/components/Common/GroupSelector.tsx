import {FC, useEffect, useState} from "react";
import {
    Grid,
    TextField,
    Autocomplete,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Stack,
    Typography,
    Tooltip,
    Alert,
    AlertTitle,
    CircularProgress,
    Chip
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ApiSingleton from "../../api/ApiSingleton";
import { Group, AccountDataDto } from "@/api";


interface GroupSelectorProps {
    courseId: number,
    courseStudents: AccountDataDto[],
    onGroupIdChange: (groupId?: number) => void,
    onGroupsUpdate: () => void,
    selectedGroupId?: number,
    choiceDisabled?: boolean,
    onCreateNewGroup?: () => void,
}

const GroupSelector:  FC<GroupSelectorProps> = (props) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formState, setFormState] = useState<{
        name: string,
        memberIds: string[]
    }>({
        name: "",
        memberIds: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);

    const loadGroups = async () => {
        setGroupsLoading(true)
        try {
            const courseGroups = await ApiSingleton.courseGroupsApi.courseGroupsGetAllCourseGroupsWithNames(props.courseId);
            setGroups(courseGroups);
        } catch (error) {
            console.error('Failed to load groups:', error);
            setIsError(true);
        } finally {
            setGroupsLoading(false);
        }
    }
    useEffect(() => {
        loadGroups();
    }, [props.courseId]);

    const handleOpenEditDialog = () => {
        const selectedGroup = groups.find(g => g.id === props.selectedGroupId);
        setFormState({
            name: selectedGroup?.name || "",
            memberIds: selectedGroup?.studentsIds || []
        })
        setIsDialogOpen(true)
    }

    const handleCloseEditDialog = () => {
        if (isSubmitting) return;
        setIsDialogOpen(false);
        setIsError(false);
    }

    const handleSubmitEdit = async () => {
        setIsSubmitting(true);
        try {
            const selectedGroup = groups.find(g => g.id === props.selectedGroupId);

            if (selectedGroup) {
                await ApiSingleton.courseGroupsApi.courseGroupsUpdateCourseGroup(
                    props.courseId,
                    selectedGroup.id!,
                    {
                        name: formState.name,
                        groupMates: formState.memberIds.map(studentId => ({ studentId })),
                    }
                );
                await loadGroups();
                props.onGroupsUpdate();
            } else {
                if (!formState.name.trim() || formState.memberIds.length === 0) {
                    return;
                }

                const groupId = await ApiSingleton.courseGroupsApi.courseGroupsCreateCourseGroup(props.courseId, {
                    name: formState.name.trim(),
                    groupMatesIds: formState.memberIds,
                    courseId: props.courseId,
                });
                await loadGroups();
                props.onGroupsUpdate();
                props.onGroupIdChange(groupId);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to update group:', error);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isStudentInGroup = (userId: string, currentGroupId?: number): boolean => {
        return groups.some(group => group.id !== currentGroupId && group.studentsIds?.includes(userId));
    }

    const getSortedStudents = (): AccountDataDto[] => {
        if (!props.courseStudents) return [];
        const currentGroupId = props.selectedGroupId;
        const studentsInOtherGroups = props.courseStudents.filter(s => 
            isStudentInGroup(s.userId!, currentGroupId)
        );
        const studentsInCurrentGroup = props.courseStudents.filter(s =>
            formState.memberIds.includes(s.userId!)
        );
        const studentsNotInAnyGroup = props.courseStudents.filter(s =>
            !isStudentInGroup(s.userId!, currentGroupId) && 
            !studentsInCurrentGroup.includes(s)
        );
        return [...studentsNotInAnyGroup, ...studentsInCurrentGroup, ...studentsInOtherGroups];
    }

    const selectedGroup = groups.find(g => g.id === props.selectedGroupId);

    return (
        <Grid item xs={12} style={{marginBottom: "15px", marginTop: 1}}>
            {props.choiceDisabled ? (
                <Stack spacing={1}>
                    <TextField
                        label="Группа"
                        value={selectedGroup?.name || "Все студенты"}
                        variant="outlined"
                        fullWidth
                        disabled
                    />
                    {selectedGroup && (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleOpenEditDialog}
                            fullWidth
                        >
                            Изменить состав группы
                        </Button>
                    )}
                </Stack>
            ) : (
                <Stack spacing={1}>
                    <Autocomplete
                        options={[{ id: undefined, name: "Все студенты" }, ...groups]}
                        getOptionLabel={(option) => option.name || ""}
                        value={props.selectedGroupId !== undefined
                            ? groups.find(g => g.id === props.selectedGroupId) || null
                            : { id: undefined, name: "Все студенты" }}
                        onChange={(_, newGroup) => {
                            props.onGroupIdChange(newGroup?.id)
                        }}
                        loading={groupsLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Группа (не обязательно)"
                                placeholder="Выберите группу"
                                variant="outlined"
                            />
                        )}
                    />
                    {selectedGroup && (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleOpenEditDialog}
                            fullWidth
                        >
                            Изменить состав группы
                        </Button>
                    )}
                    {!selectedGroup && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleOpenEditDialog}
                            fullWidth
                        >
                            Создать группу
                        </Button>
                    )}
                </Stack>
            )}

            <Dialog
                fullWidth
                maxWidth="sm"
                open={isDialogOpen}
                onClose={handleCloseEditDialog}
            >
                <DialogTitle>
                    {selectedGroup ? "Редактировать группу" : "Создать группу"}
                </DialogTitle>
                <DialogContent>
                    {isError && (
                        <Alert severity="error" style={{marginBottom: 16}}>
                            <AlertTitle>Ошибка</AlertTitle>
                            Не удалось {selectedGroup ? "создать" : "обновить"} группу. Попробуйте позже.
                        </Alert>
                    )}
                    <Grid container spacing={2} style={{marginTop: 4}}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Название группы"
                                value={formState.name}
                                onChange={(e) => {
                                    setFormState(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }}
                                disabled={isSubmitting || props.choiceDisabled}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={getSortedStudents()}
                                value={props.courseStudents?.filter(s => formState.memberIds.includes(s.userId!)) || []}
                                getOptionLabel={(option) =>
                                    `${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}`.trim()
                                }
                                renderOption={(materialUIProps, option) => {
                                    const isInOtherGroup = isStudentInGroup(option.userId!, props.choiceDisabled ? props.selectedGroupId : undefined)
                                    return (
                                        <Box component="li" {...materialUIProps}>
                                            <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    {`${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}`.trim()}
                                                </Typography>
                                                {isInOtherGroup && (
                                                    <Tooltip title="Студент уже в группе">
                                                        <CheckIcon
                                                            sx={{
                                                                fontSize: "1.2rem",
                                                                color: "warning.main",
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </Box>
                                    )
                                }}
                                filterSelectedOptions
                                onChange={(_, values) => {
                                    if (selectedGroup) {
                                        // При редактировании выбранной группы можно только добавлять студентов
                                        setFormState(prev => ({
                                            ...prev,
                                            memberIds: [...formState.memberIds, 
                                                ...values.map(x => !formState.memberIds.includes(x.userId!) ? x.userId! : "").filter(Boolean)]
                                        }))
                                    } else {
                                        setFormState(prev => ({
                                            ...prev,
                                            memberIds: values
                                                .map(x => x.userId!)
                                                .filter(Boolean)
                                        }))
                                    }
                                }}
                                disabled={isSubmitting}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            label={`${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}`.trim()}
                                            onDelete={selectedGroup ? undefined : getTagProps({ index }).onDelete}
                                            key={option.userId}
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseEditDialog}
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        Отменить
                    </Button>
                    <Button
                        onClick={handleSubmitEdit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || !formState.name.trim() || formState.memberIds.length === 0}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : selectedGroup ? "Сохранить" : "Создать"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default GroupSelector
