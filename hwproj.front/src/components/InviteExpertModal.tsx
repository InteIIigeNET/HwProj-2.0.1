import React, {FC, useEffect, useState} from 'react'
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
import {CoursePreviewView} from "../api";
import {Select, MenuItem, InputLabel, FormControl} from "@mui/material";

interface IInviteExpertProps {
    isOpen: boolean;
    close: any;
    expertEmail: string;
}

interface IInviteExpertState {
    accessToken: string;
    lecturerCourses: CoursePreviewView[];
    selectedCourseId: number;
}

const handleCopyClick = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
}

const InviteExpertModal: FC<IInviteExpertProps> = (props) => {
    const [state, setState] = useState<IInviteExpertState>({
        accessToken: "",
        lecturerCourses: [],
        selectedCourseId: -1
    });

    const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState<boolean>(true); // Состояние для блокировки кнопки

    const [isLinkAccessible, setIsLinkAccessible] = useState<boolean>(false); // Состояние для блокировки отображения ссылки

    const setInitialState = async () => {
        const courses = await ApiSingleton.coursesApi.apiCoursesUserCoursesGet();
        setState(prevState => ({
            ...prevState,
            lecturerCourses: courses
        }));

        const tokenCredentials = await ApiSingleton.accountApi.apiAccountGetExpertTokenGet(props.expertEmail);
        setState(prevState => ({
            ...prevState,
            accessToken: tokenCredentials.value!.accessToken!
        }));
    }

    useEffect(() => {
        setInitialState()
    }, [])

    const handleInvitation = async () => {
        // TODO: query to invite expert to course with state.selectedCourseId
        setIsInviteButtonDisabled(true);
        setIsLinkAccessible(true);
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.close} aria-labelledby="dialog-title" fullWidth>
                <DialogTitle id="dialog-title">
                    Пригласить эксперта
                </DialogTitle>
                <DialogContent>
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
                                            setIsLinkAccessible(false);
                                            const selectedId = Number(e.target.value)
                                            setState((prevState) => ({
                                                ...prevState,
                                                selectedCourseId: selectedId
                                            }));
                                            setIsInviteButtonDisabled(false);
                                        }}>
                                        {state.lecturerCourses.map((courseViewModel, i) =>
                                            <MenuItem key={i} value={courseViewModel.id}>
                                                {courseViewModel.name}
                                            </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
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
