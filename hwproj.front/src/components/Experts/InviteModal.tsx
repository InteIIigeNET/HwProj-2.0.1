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
import {CircularProgress, IconButton} from "@material-ui/core";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {CoursePreviewView, HomeworkViewModel, InviteExpertViewModel, AccountDataDto} from "../../api";
import {Select, MenuItem, InputLabel, FormControl, Autocomplete} from "@mui/material";
import CourseFilter from "../Courses/CourseFilter";
import NameBuilder from "../Utils/NameBuilder";

interface IInviteExpertProps {
    isOpen: boolean;
    onClose: any;
    expertEmail: string;
    expertFullName: string;
    expertId: string;
}

interface IInviteExpertState {
    accessToken: string;
    lecturerCourses: CoursePreviewView[];
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
        selectedHomeworks: [],
        selectedStudents: [],
        selectedCourseId: -1,
        errors: []
    });

    const [isInviteButtonDisabled, setIsInviteButtonDisabled]
        = useState<boolean>(true); // Состояние для блокировки кнопки "Пригласить"

    const [isLinkAccessible, setIsLinkAccessible]
        = useState<boolean>(false); // Состояние для блокировки отображения ссылки

    const [isLinkCopied, setIsLinkCopied]
        = useState<boolean>(false); // Состояние для отображения сообщения "Ссылка скопирована"

    const [isInvited, setIsInvited]
        = useState<boolean>(false); // Состояние для скрытия кнопки "Пригласить"

    const [isCourseListLoading, setIsCourseListLoading]
        = useState<boolean>(true); // Состояние для отображения элемента загрузки списка курсов

    const [isWorkspaceLoading, setIsWorkspaceLoading]
        = useState<boolean>(true); // Состояние для отображения элемента загрузки данных курса

    useEffect(() => {
        const fetchCourses = async () => {
            const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet();
            setState(prevState => ({
                ...prevState,
                lecturerCourses: courses
            }));
            setIsCourseListLoading(false);
        }

        const fetchCredentials = async () => {
            const tokenCredentials = await ApiSingleton.expertsApi.apiExpertsGetTokenGet(props.expertEmail);
            setState(prevState => ({
                ...prevState,
                accessToken: tokenCredentials.value!.accessToken!
            }));
        }

        fetchCourses();
        fetchCredentials();
    }, [])

    useEffect(() => {
        const controlItemsAccessibility = () => {
            if (isLinkAccessible) {
                setIsLinkAccessible(false);
            }

            const isInputAllowed = state.selectedCourseId !== -1;
            setIsInviteButtonDisabled(!isInputAllowed);
            setIsInvited(!isInputAllowed);
        }

        controlItemsAccessibility();
    }, [state.selectedCourseId, state.selectedStudents, state.selectedHomeworks])

    const invitationLink = `${window.location.origin}/join/${state.accessToken}`;

    const handleInvitation = async () => {
        try {
            const inviteExpertModel: InviteExpertViewModel = {
                userId: props.expertId,
                userEmail: props.expertEmail,
                courseId: state.selectedCourseId,
                homeworkIds: state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.map(accountData => accountData.userId!)
            }

            const result = await ApiSingleton.expertsApi.apiExpertsInvitePost(inviteExpertModel);
            if (result.succeeded) {
                setIsInviteButtonDisabled(true);
                setIsLinkAccessible(true);
                setIsInvited(true);
                navigator.clipboard.writeText(invitationLink).then(() => {
                    setIsLinkCopied(true);
                    setTimeout(() => setIsLinkCopied(false), 5000);
                }).catch(err => {
                    console.error('Ошибка при копировании ссылки в буфер обмена: ', err);
                });
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
                <DialogTitle id="dialog-title" style={{textAlign: "center"}}>
                    {props.expertFullName}
                </DialogTitle>
                <DialogContent>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        {state.errors.length > 0 && (
                            <p style={{color: "red", marginBottom: "5px"}}>{state.errors}</p>
                        )}
                    </Grid>
                    {isCourseListLoading ? (
                        <div className="container">
                            <p>Загружаем курсы...</p>
                            <CircularProgress/>
                        </div>
                    ) : (
                        <div>
                            <Typography>
                                Выберите курс, на который хотите пригласить эксперта
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
                                                onChange={e => {
                                                    setIsWorkspaceLoading(true)
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        selectedCourseId: +e.target.value,
                                                        selectedHomeworks: [],
                                                        selectedStudents: []
                                                    }));
                                                }}>
                                                {state.lecturerCourses.map((courseViewModel, i) =>
                                                    <MenuItem key={i} value={courseViewModel.id}>
                                                        {NameBuilder.getCourseFullName(courseViewModel.name!, courseViewModel.groupName)}
                                                    </MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                {state.selectedCourseId !== -1 && (
                                    <Grid container style={{marginTop: '15px'}} direction="column">
                                        {!isWorkspaceLoading &&
                                            <Grid item>
                                                <Typography>
                                                    Выберите задачи:
                                                </Typography>
                                            </Grid>}
                                        <Grid item>
                                            <CourseFilter key={state.selectedCourseId}
                                                          courseId={state.selectedCourseId}
                                                          mentorId={props.expertId}
                                                          isStudentsSelectionHidden={true}
                                                          onSelectedHomeworksChange={(homeworks) =>
                                                              setState(prevState => ({
                                                                  ...prevState,
                                                                  selectedHomeworks: homeworks
                                                              }))
                                                          }
                                                          onSelectedStudentsChange={(students) =>
                                                              setState(prevState => ({
                                                                  ...prevState,
                                                                  selectedStudents: students
                                                              }))
                                                          }
                                                          onWorkspaceInitialize={(success, errors) => {
                                                              if (!success) {
                                                                  setState(prevState => ({
                                                                      ...prevState,
                                                                      errors: errors ?? ['Сервис недоступен']
                                                                  }))
                                                              }
                                                              setIsWorkspaceLoading(false)
                                                          }}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
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
                                                    value={invitationLink}
                                                />
                                            </Grid>
                                            <Grid item sm={1} justifyContent="center" alignItems="center">
                                                <IconButton
                                                    onClick={() => handleCopyClick(invitationLink)}
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
                                    {!isInvited && <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleInvitation}
                                            disabled={isInviteButtonDisabled}
                                        >
                                            Получить ссылку
                                        </Button>
                                    </Grid>}
                                </Grid>
                            </Grid>
                        </div>)}
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

export default InviteExpertModal;