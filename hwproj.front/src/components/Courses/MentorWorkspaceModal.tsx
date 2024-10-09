import React, {FC, useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ApiSingleton from "../../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import {
    HomeworkViewModel,
    AccountDataDto,
    WorkspaceViewModel
} from "../../api";
import {Autocomplete} from "@mui/material";

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

    const [isInviteButtonDisabled, setIsInviteButtonDisabled]
        = useState<boolean>(true); // Состояние для блокировки кнопки "Изменить"

    const [isLinkCopied, setIsLinkCopied]
        = useState<boolean>(false); // Состояние для отображения сообщения "Ссылка скопирована"

    const [isInvited, setIsInvited]
        = useState<boolean>(false); // Состояние для скрытия кнопки "Изменить"

    // Получаем всех возможных студентов и все возможные домашние работы курса.
    useEffect(() => {
        const fetchCourseData = async () => {
            const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(props.courseId);
            setState(prevState => ({
                ...prevState,
                courseHomeworks: courseViewModel.homeworks ?? [],
                courseStudents: courseViewModel.acceptedStudents ?? []
            }));
        };

        fetchCourseData();
    }, [])

    // useEffect(() => {
    //     // Здесь будем получать текущих выбранных студентов и домашние работы.
    //     const fetchCourses = async () => {
    //         const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet();
    //         setState(prevState => ({
    //             ...prevState,
    //             lecturerCourses: courses
    //         }));
    //     }
    //
    //     fetchCourses();
    // }, [])

    // Здесь работаем с кнопкой изменить: пока выбранные студенты и домашки совпадают с ранее выбранными, кнопка заблокирована
    useEffect(() => {
        const controlItemsAccessibility = () => {
            //setIsInviteButtonDisabled(!isInputAllowed);
        }

        controlItemsAccessibility();
    }, [state.selectedStudents, state.selectedHomeworks])

    // Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
    const handleInvitation = async () => {
        try {
            const workspaceViewModel: WorkspaceViewModel = {
                homeworkIds: state.selectedHomeworks.length === 0 ?
                    state.courseHomeworks.map(homeworkViewModel => homeworkViewModel.id!)
                    : state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.length === 0 ?
                    state.courseStudents.map(accountData => accountData.userId!)
                    : state.selectedStudents.map(accountData => accountData.userId!),
                mentorIds: []
            }
            const result = await ApiSingleton.coursesApi.apiCoursesEditMentorWorkspaceByCourseIdByMentorIdPost(
                props.courseId, props.mentorId, workspaceViewModel
            );
            
            if (result.succeeded) {
                setIsInviteButtonDisabled(true);
                setIsInvited(true);
            }
            setState((prevState) => ({
                ...prevState,
                errors: result!.errors ?? [],
            }));
        } catch (e) {
            const responseErrors = await e.json()
            setState((prevState) => ({
                ...prevState,
                errors: responseErrors ?? ['Сервис недоступен']
            }))
        }
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.onClose} aria-labelledby="dialog-title" fullWidth>
                <DialogTitle id="dialog-title">
                    {props.mentorName}&nbsp;{props.mentorSurname}
                </DialogTitle>
                <DialogContent>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        {state.errors.length > 0 && (
                            <p style={{color: "red", marginBottom: "5px"}}>{state.errors}</p>
                        )}
                    </Grid>
                    <Typography>
                        Здесь вы можете изменить область работы преподавателя.
                    </Typography>
                    <Grid container style={{marginTop: '10px'}}>
                        <Grid container>
                            <Typography>
                                Задачи:
                            </Typography>
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
                        </Grid>
                        <Grid container style={{marginTop: '10px'}}>
                            <Typography>
                                Студенты:
                            </Typography>
                            <Grid container spacing={2} style={{marginTop: '2px'}}>
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
                                onClick={handleInvitation}
                                disabled={isInviteButtonDisabled}
                            >
                                Изменить
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                </DialogActions>
                {isLinkCopied && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#3F51B5',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        zIndex: 1000
                    }}>
                        Ссылка скопирована в буфер обмена
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default MentorWorkspaceModal;