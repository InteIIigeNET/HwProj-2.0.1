import React, {FC, useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ApiSingleton from "../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import {IconButton} from "@material-ui/core";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {CoursePreviewView, HomeworkViewModel, CreateCourseFilterViewModel, AccountDataDto} from "../api";
import {Select, MenuItem, InputLabel, FormControl, Autocomplete} from "@mui/material";

interface IInviteExpertProps {
    isOpen: boolean;
    close: any;
    expertEmail: string;
    expertId: string;
}

interface IInviteExpertState {
    accessToken: string;
    lecturerCourses: CoursePreviewView[];
    courseHomeworks: HomeworkViewModel[];
    courseStudents: AccountDataDto[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    selectedCourseId: number;
    errors: string[];
}

// TODO: make placeholder darker
const useStyles = makeStyles({
    placeholder: {
        color: 'black'
    },
});

const handleCopyClick = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
}

const InviteExpertModal: FC<IInviteExpertProps> = (props) => {
    const [state, setState] = useState<IInviteExpertState>({
        accessToken: "",
        lecturerCourses: [],
        courseHomeworks: [],
        courseStudents: [],
        selectedHomeworks: [],
        selectedStudents: [],
        selectedCourseId: -1,
        errors: []
    });

    const [isInviteButtonDisabled, setIsInviteButtonDisabled]
        = useState<boolean>(true); // Состояние для блокировки кнопки "Пригласить"

    const [isLinkAccessible, setIsLinkAccessible]
        = useState<boolean>(false); // Состояние для блокировки отображения ссылки

    const [isStudentsSelectionOpened, setIsStudentsSelectionOpened]
        = useState<boolean>(false); // Состояние для отображения поля выбора студентов

    useEffect(() => {
        const fetchCourses = async () => {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet();
            setState(prevState => ({
                ...prevState,
                lecturerCourses: courses
            }));
        }

        const fetchCredentials = async () => {
            const tokenCredentials = await ApiSingleton.accountApi.apiAccountGetExpertTokenGet(props.expertEmail);
            setState(prevState => ({
                ...prevState,
                accessToken: tokenCredentials.value!.accessToken!
            }));
        }

        fetchCourses();
        fetchCredentials();
    }, [])

    useEffect(() => {
        const fetchCourseData = async () => {
            const courseViewModel = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(state.selectedCourseId);
            setState(prevState => ({
                ...prevState,
                courseHomeworks: courseViewModel.homeworks ?? [],
                courseStudents: courseViewModel.acceptedStudents ?? []
            }));
        };

        fetchCourseData();
    }, [state.selectedCourseId])

    useEffect(() => {
        const controlItemsAccessibility = () => {
            if (isLinkAccessible) {
                setIsLinkAccessible(false);
            }
            const isInputAllowed = state.selectedCourseId !== -1 && state.selectedHomeworks.length !== 0;
            setIsInviteButtonDisabled(!isInputAllowed);
        }

        controlItemsAccessibility();
    }, [state.selectedCourseId, state.selectedStudents, state.selectedHomeworks])

    // Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех
    const handleInvitation = async () => {
        try {
            const courseFilter: CreateCourseFilterViewModel = {
                userId: props.expertId,
                courseId: state.selectedCourseId,
                homeworkIds: state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.length === 0 ?
                    state.courseStudents.map(accountData => accountData.userId!)
                    : state.selectedStudents.map(accountData => accountData.userId!),
                mentorIds: []
            }
            const result = await ApiSingleton.courseFiltersApi.apiCourseFiltersCreateExpertFilterPost(courseFilter);
            if (result.succeeded) {
                await ApiSingleton.coursesApi.apiCoursesAcceptLecturerByCourseIdByLecturerEmailGet(courseFilter.courseId!, props.expertEmail);
                setIsInviteButtonDisabled(true);
                setIsLinkAccessible(true);
            }
            setState((prevState) => ({
                ...prevState,
                errors: result!.errors ?? [],
            }));
        } catch (e) {
            setState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен'],
            }))
        }
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.close} aria-labelledby="dialog-title" fullWidth>
                <DialogTitle id="dialog-title">
                    Пригласить эксперта
                </DialogTitle>
                <DialogContent>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        {state.errors.length > 0 && (
                            <p style={{color: "red", marginBottom: "0"}}>{state.errors}</p>
                        )}
                    </Grid>
                    <Typography>
                        Выберите курс:
                    </Typography>
                    <Grid container style={{marginTop: '10px'}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="course-select-label">Курс</InputLabel>
                                    <Select
                                        required
                                        fullWidth
                                        label="Курс"
                                        labelId="course-select-label"
                                        value={state.selectedCourseId === -1 ? '' : state.selectedCourseId}
                                        onChange={async (e) => {
                                            const selectedId = Number(e.target.value)
                                            setState((prevState) => ({
                                                ...prevState,
                                                selectedCourseId: selectedId
                                            }));
                                        }}>
                                        {state.lecturerCourses.map((courseViewModel, i) =>
                                            <MenuItem key={i} value={courseViewModel.id}>
                                                {courseViewModel.name}
                                            </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container style={{marginTop: '15px'}}>
                            <Typography>
                                Выберите задачи:
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
                                                label='Домашние работы'
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
                            {isStudentsSelectionOpened ?
                                (<Grid container spacing={2} style={{marginTop: '2px'}}>
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
                                </Grid>) : (
                                    <Button size={"small"} color="primary"
                                            onClick={() => setIsStudentsSelectionOpened(true)}>
                                        Выбрать студентов
                                    </Button>)}
                        </Grid>
                        {isLinkAccessible && (
                            <Grid container style={{marginTop: '10px'}}>
                                <Typography>
                                    Для приглашения эксперта поделитесь с ним ссылкой:
                                </Typography>
                                <Grid container style={{marginTop: '2px'}}>
                                    <Grid item xs={12} sm={11} style={{marginTop: '4px'}}>
                                        <TextField
                                            id="outlined-read-only-input"
                                            label=""
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="standard"
                                            fullWidth
                                            value={ApiSingleton.authService.buildInvitationLink(state.accessToken)}
                                        />
                                    </Grid>
                                    <Grid item sm={1} justifyContent="center" alignItems="center">
                                        <IconButton
                                            onClick={() => handleCopyClick(ApiSingleton.authService.buildInvitationLink(state.accessToken))}
                                            color="primary">
                                            <ContentCopyIcon/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Grid container style={{marginTop: '2px'}}>
                                    <Grid
                                        direction="row"
                                        item
                                        style={{marginTop: '0px'}}
                                    >
                                        <Typography>
                                            Действительна
                                            до <b>{ApiSingleton.authService.getTokenExpirationDate(state.accessToken)}</b>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>)}
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
                                onClick={props.close}
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
                                Пригласить
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default InviteExpertModal;
