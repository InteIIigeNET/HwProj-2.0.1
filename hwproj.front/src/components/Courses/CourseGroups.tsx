import {FC, useEffect, useState} from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Button,
    Typography,
    Alert,
    AlertTitle,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {AccountDataDto, CourseGroupsApi, GroupViewModel, Configuration, Group} from "@/api";
import ApiSingleton from "../../api/ApiSingleton";

interface ICourseGroupsProps {
    courseId: number;
    students: AccountDataDto[];
}

interface ICreateGroupFormState {
    name: string;
    memberIds: string[];
}

const CourseGroups: FC<ICourseGroupsProps> = (props) => {
    const {courseId, students} = props;

    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<ICreateGroupFormState>({
        name: "",
        memberIds: []
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const loadGroups = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const result = await ApiSingleton.courseGroupsApi.courseGroupsGetAllCourseGroupsWithNames(courseId);
            setGroups(result);
        } catch {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, [courseId]);

    const handleOpenDialog = () => {
        setFormState({
            name: "",
            memberIds: []
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (isSubmitting) return;
        setIsDialogOpen(false);
    };

    const handleSubmit = async () => {
        if (!formState.name.trim() || formState.memberIds.length === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await ApiSingleton.courseGroupsApi.courseGroupsCreateCourseGroup(courseId, {
                name: formState.name.trim(),
                groupMatesIds: formState.memberIds,
                courseId: courseId
            });
            setIsDialogOpen(false);
            await loadGroups();
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStudentName = (userId: string) => {
        const student = students.find(s => s.userId === userId);
        if (!student) {
            return userId;
        }
        const nameParts = [student.surname, student.name, student.middleName].filter(Boolean);
        return `${nameParts.join(" ") || student.email}`;
    };

    const namedGroups = groups.filter(g => g.name && g.name.trim().length > 0);

    return (
        <Grid container direction={"column"} spacing={2} sx={{ paddingBottom: 18 }}>
            <Grid item>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                    <Typography variant="h6">
                        Группы курса
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenDialog}
                    >
                        Создать группу
                    </Button>
                </Stack>
            </Grid>

            {isError &&
                <Grid item>
                    <Alert severity="error">
                        <AlertTitle>Не удалось загрузить группы</AlertTitle>
                        Попробуйте обновить страницу позже.
                    </Alert>
                </Grid>
            }

            {!isLoading && namedGroups.length === 0 && !isError &&
                <Grid item>
                    <Alert severity="info">
                        На курсе пока нет групп.
                    </Alert>
                </Grid>
            }

            <Grid item container spacing={2} direction={"column"}>
                {namedGroups.map(group => {
                    const name = group.name!;
                    const studentsIds = group.studentsIds || [];

                    return (
                        <Grid item xs={12} key={group.id}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">
                                        {name}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {studentsIds.length > 0 ? (
                                        <Stack direction={"column"} spacing={0.5} width={"100%"} sx={{ paddingLeft: 2 }}>
                                            {studentsIds.map(id => (
                                                <Typography key={id} variant="body1">
                                                    {getStudentName(id)}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            В группе пока нет участников.
                                        </Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog
                fullWidth
                maxWidth="sm"
                open={isDialogOpen}
                onClose={handleCloseDialog}
            >
                <DialogTitle>
                    Создать новую группу
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{marginTop: 4}}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Название группы"
                                value={formState.name}
                                onChange={(e) => {
                                    e.persist();
                                    setFormState(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }));
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={students}
                                value={students.filter(s => formState.memberIds.includes(s.userId!))}
                                getOptionLabel={(option) =>
                                    `${option.surname ?? ""} ${option.name ?? ""} / ${option.email ?? ""}`.trim()
                                }
                                filterSelectedOptions
                                onChange={(e, values) => {
                                    e.persist();
                                    setFormState(prev => ({
                                        ...prev,
                                        memberIds: values
                                            .map(x => x.userId!)
                                            .filter(Boolean)
                                    }));
                                }}
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
                        onClick={handleCloseDialog}
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        Отменить
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || !formState.name.trim() || formState.memberIds.length === 0}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default CourseGroups;
