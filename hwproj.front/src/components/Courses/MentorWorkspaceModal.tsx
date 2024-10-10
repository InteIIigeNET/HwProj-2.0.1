import React, {FC, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ApiSingleton from "../../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import {HomeworkViewModel, AccountDataDto, WorkspaceDTO} from "../../api";
import {Autocomplete, Alert} from "@mui/material";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {CircularProgress, Snackbar} from "@material-ui/core";

interface MentorWorkspaceProps {
    isOpen: boolean;
    onClose: any;
    mentorId: string;
    courseId: number;
    mentorName: string;
    mentorSurname: string;
}

interface MentorWorkspaceState {
    courseHomeworks: HomeworkViewModel[];
    courseStudents: AccountDataDto[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    errors: string[];
}

const MentorWorkspaceModal: FC<MentorWorkspaceProps> = (props) => {
    const [state, setState] = useState<MentorWorkspaceState>({
        courseHomeworks: [],
        courseStudents: [],
        selectedHomeworks: [],
        selectedStudents: [],
        errors: []
    });

    // Состояние для отображения элемента загрузки
    const [isWorkspaceLoading, setIsWorkspaceLoading]
        = useState<boolean>(true);

    // Состояние для отображения сообщения об успешном обновлении воркспейса ментора
    const [isWorkspaceUpdated, setIsWorkspaceUpdated]
        = useState<boolean>(false);

    useEffect(() => {
        // Получаем назначенных ментору студентов и домашние работы.
        const fetchMentorWorkspace = async () => {
            try {
                const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(props.courseId);

                const workspace =
                    await ApiSingleton.coursesApi.apiCoursesGetMentorWorkspaceByCourseIdByMentorIdGet(props.courseId, props.mentorId);

                const studentIdsSet = new Set(workspace.studentIds)
                const homeworkIdsSet = new Set(workspace.homeworkIds)

                // Формируем модели назначенных домашних работ и студентов. Если количество назначенных объектов
                // совпадает с количеством объектов курса, то передаем пустой массив (эквивалентно "Все")
                const students = studentIdsSet.size === courseViewModel.acceptedStudents?.length ?
                    [] : courseViewModel.acceptedStudents!.filter(studentData => studentIdsSet.has(studentData.userId!));
                const homeworks = homeworkIdsSet.size === courseViewModel.homeworks?.length ?
                    [] : courseViewModel.homeworks!.filter(homeworkData => homeworkIdsSet.has(homeworkData.id!));

                setState(prevState => ({
                    ...prevState,
                    courseHomeworks: courseViewModel.homeworks ?? [],
                    courseStudents: courseViewModel.acceptedStudents ?? [],
                    selectedStudents: students,
                    selectedHomeworks: homeworks
                }))
                setIsWorkspaceLoading(false);
            } catch (e) {
                const errors = await ErrorsHandler.getErrorMessages(e);
                setState((prevState) => ({
                    ...prevState,
                    errors: errors
                }))
            }
        }

        fetchMentorWorkspace();
    }, [])

    // Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
    const handleWorkspaceChanges = async () => {
        try {
            // TODO: уметь обрабатывать ситуации "никого" и "все"
            const workspaceViewModel: WorkspaceDTO = {
                homeworkIds: state.selectedHomeworks.length === 0 ?
                    state.courseHomeworks.map(homeworkViewModel => homeworkViewModel.id!)
                    : state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.length === 0 ?
                    state.courseStudents.map(accountData => accountData.userId!)
                    : state.selectedStudents.map(accountData => accountData.userId!)
            }
            await ApiSingleton.coursesApi.apiCoursesEditMentorWorkspaceByCourseIdByMentorIdPost(
                props.courseId, props.mentorId, workspaceViewModel
            );

            setIsWorkspaceUpdated(true);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e);
            setState((prevState) => ({
                ...prevState,
                errors: errors
            }))
        }
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.onClose} aria-labelledby="dialog-title" fullWidth>
                <DialogTitle id="dialog-title">
                    <Typography align="center" variant="h6">
                        {props.mentorName}&nbsp;{props.mentorSurname}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {isWorkspaceLoading ? (
                        <div className="container" style={{paddingLeft: "40px"}}>
                            <p>Загружаем данные...</p>
                            <CircularProgress/>
                        </div>
                    ) : (
                        <div>
                            <Grid item container direction={"row"} justifyContent={"center"}>
                                {state.errors.length > 0 && (
                                    <p style={{color: "red", marginBottom: "5px"}}>{state.errors}</p>
                                )}
                            </Grid>
                            <Typography>
                                Здесь Вы можете изменить область работы преподавателя
                            </Typography>
                            <Grid container style={{marginTop: '10px'}}>
                                <Grid container spacing={2} style={{marginTop: '2px'}}>
                                    <Grid item xs={12} sm={12}>
                                        <Autocomplete
                                            multiple
                                            fullWidth
                                            options={state.courseHomeworks}
                                            getOptionLabel={(option: HomeworkViewModel) => option.title ?? "Без названия"}
                                            filterSelectedOptions
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
                                                setState(prevState => ({
                                                    ...prevState,
                                                    selectedHomeworks: values
                                                }));
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} style={{marginTop: '12px'}}>
                                    <Grid item xs={12} sm={12}>
                                        <Autocomplete
                                            multiple
                                            fullWidth
                                            options={state.courseStudents}
                                            getOptionLabel={(option: AccountDataDto) => option.name + ' ' + option.surname}
                                            filterSelectedOptions
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
                                                setState(prevState => ({
                                                    ...prevState,
                                                    selectedStudents: values
                                                }));
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                container
                                style={{marginTop: '15px'}}
                            >
                                <Grid item>
                                    <Button
                                        onClick={props.onClose}
                                        color="primary"
                                        variant="contained"
                                        style={{marginRight: '10px'}}
                                    >
                                        Закрыть
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleWorkspaceChanges}
                                    >
                                        Изменить
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>)}
                </DialogContent>
                <DialogActions>
                </DialogActions>
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    open={isWorkspaceUpdated}
                    onClose={() => setIsWorkspaceUpdated(false)}
                    key={'top center'}
                    autoHideDuration={5000}
                >
                    <Alert severity="success">Успешно обновлено</Alert>
                </Snackbar>
            </Dialog>
        </div>
    )
}

export default MentorWorkspaceModal;