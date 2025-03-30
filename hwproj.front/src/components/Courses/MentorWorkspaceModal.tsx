import React, {FC, useState} from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ApiSingleton from "../../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import {HomeworkViewModel, AccountDataDto, EditMentorWorkspaceDTO} from "../../api";
import {Alert} from "@mui/material";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {Snackbar} from "@material-ui/core";
import CourseFilter from "./CourseFilter";

interface MentorWorkspaceProps {
    isOpen: boolean;
    onClose: any;
    mentorId: string;
    courseId: number;
    mentorName: string;
    mentorSurname: string;
}

interface MentorWorkspaceState {
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    errors: string[];
}

const MentorWorkspaceModal: FC<MentorWorkspaceProps> = (props) => {
    const [state, setState] = useState<MentorWorkspaceState>({
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

    // Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
    const handleWorkspaceChanges = async () => {
        try {
            const workspaceViewModel: EditMentorWorkspaceDTO = {
                homeworkIds: state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.map(accountData => accountData.userId!)
            }

            await ApiSingleton.coursesApi.coursesEditMentorWorkspace(
                props.courseId, props.mentorId, workspaceViewModel
            );

            setIsWorkspaceUpdated(true);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
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
                    <Typography component="div" align="center" variant="h6">
                        {props.mentorName}&nbsp;{props.mentorSurname}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <div>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            {state.errors.length > 0 && (
                                <p style={{color: "red", marginBottom: "5px"}}>{state.errors}</p>
                            )}
                        </Grid>
                        {!isWorkspaceLoading &&
                            <Typography>
                                Здесь Вы можете изменить область работы преподавателя
                            </Typography>}
                        <CourseFilter courseId={props.courseId}
                                      mentorId={props.mentorId}
                                      isStudentsSelectionHidden={false}
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
                        {!isWorkspaceLoading &&
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
                            </Grid>}
                    </div>
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