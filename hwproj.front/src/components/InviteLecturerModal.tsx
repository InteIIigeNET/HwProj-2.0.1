import React, {FC, FormEvent, useEffect, useState} from 'react'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    createFilterOptions,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import ApiSingleton from "../api/ApiSingleton";
import {AccountDataDto} from "../api";
import ValidationUtils from "./Utils/ValidationUtils";
import {UserInitialsAvatar} from "./Common/UserInitialsAvatar";

interface InviteLecturer {
    isOpen: boolean;
    close: any;
}

interface InviteLecturerState {
    email: string;
    errors: string[];
    info: string[];
    data: AccountDataDto[];
}

// В инпут подставляем только email, поэтому по ФИО ищем через отдельный матчер
const filterOptions = createFilterOptions<AccountDataDto>({
    stringify: option => `${option.email ?? ""} ${option.surname ?? ""} ${option.name ?? ""}`,
})

const iconBadgeSx = {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "#e4e7f6",
    color: "#3f51b5",
}

const InviteLecturerModal: FC<InviteLecturer> = (props) => {

    const [lecturerState, setLecturerState] = useState<InviteLecturerState>({
        email: '',
        errors: [],
        info: [],
        data: [],
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!ValidationUtils.isCorrectEmail(lecturerState.email)) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты.']
            }))
            return
        }
        try {
            const result = await ApiSingleton.accountApi.accountInviteNewLecturer({email: lecturerState.email})
            if (result.succeeded) {
                setLecturerState((prevState) => ({
                    ...prevState,
                    info: ['Запрос отправлен'],
                    errors: []
                }))
                return
            }
            setLecturerState((prevState) => ({
                ...prevState,
                errors: result.errors!
            }))
        } catch (e) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const close = () => {
        setLecturerState((prevState) => ({
            ...prevState,
            email: '',
            errors: [],
            info: [],
            data: [],
        }))
        props.close()
    }

    const setCurrentState = async () => {
        const data = await ApiSingleton.accountApi.accountGetAllStudents();
        setLecturerState({
            errors: [],
            email: '',
            info: [],
            data: data
        })
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    return (
        <Dialog
            open={props.isOpen}
            onClose={close}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth={"sm"}
            PaperProps={{sx: {borderRadius: "16px"}}}
        >
            <Box component={"form"} onSubmit={handleSubmit}>
                <DialogTitle id="form-dialog-title" sx={{p: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Box sx={iconBadgeSx}>
                            <PersonAddAlt1OutlinedIcon fontSize={"small"}/>
                        </Box>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}>
                                Пригласить преподавателя
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Пользователь получит статус преподавателя
                            </Typography>
                        </Box>
                        <Tooltip arrow title={"Закрыть"}>
                            <IconButton size={"small"} onClick={close} sx={{flexShrink: 0}}>
                                <CloseIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </DialogTitle>
                <Divider/>
                <DialogContent sx={{p: 2}}>
                    <Stack spacing={3}>
                        <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                            Введите адрес электронной почты пользователя, которому нужно выдать статус
                            преподавателя. Можно начать вводить email или ФИО — подходящие пользователи
                            появятся в списке.
                        </Typography>
                        {lecturerState.info.length > 0 &&
                            <Alert severity="success" sx={{borderRadius: "10px"}}>
                                {lecturerState.info.map((message, index) => <div key={index}>{message}</div>)}
                            </Alert>}
                        {lecturerState.errors.length > 0 &&
                            <Alert severity="error" sx={{borderRadius: "10px"}}>
                                {lecturerState.errors.map((error, index) => <div key={index}>{error}</div>)}
                            </Alert>}
                        <Autocomplete
                            freeSolo
                            disableClearable
                            fullWidth
                            options={lecturerState.data}
                            filterOptions={filterOptions}
                            inputValue={lecturerState.email}
                            getOptionLabel={option => typeof option === "string" ? option : (option.email ?? "")}
                            getOptionKey={option => typeof option === "string" ? option : (option.userId ?? "")}
                            noOptionsText={"Нет подходящих пользователей"}
                            onChange={(_, value) => setLecturerState((prevState) => ({
                                ...prevState,
                                email: typeof value === "string" ? value : (value.email ?? "")
                            }))}
                            onInputChange={(_, value, reason) => {
                                // reason === "reset" приходит при выборе из списка — email там уже выставлен в onChange
                                if (reason === "input") setLecturerState((prevState) => ({
                                    ...prevState,
                                    email: value
                                }))
                            }}
                            renderOption={(optionProps, option) => (
                                <Box component={"li"} {...optionProps} key={option.userId}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={1.5}
                                           sx={{width: "100%", minWidth: 0}}>
                                        <UserInitialsAvatar user={option} size={32} fontSize={"0.7rem"}/>
                                        <Box sx={{minWidth: 0}}>
                                            <Typography
                                                sx={{fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.3}}>
                                                {`${option.surname ?? ""} ${option.name ?? ""}`.trim()}
                                            </Typography>
                                            <Typography variant={"caption"} noWrap
                                                        sx={{display: "block", color: "text.secondary"}}>
                                                {option.email}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    autoFocus
                                    size={"small"}
                                    label="Email или ФИО пользователя"
                                    variant="outlined"
                                    sx={{"& .MuiOutlinedInput-root": {borderRadius: "10px"}}}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <Divider/>
                <DialogActions sx={{px: 2, py: 1.5, gap: 1}}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disableElevation
                        disabled={!lecturerState.email.trim()}
                        sx={{textTransform: "none", borderRadius: "10px", px: 2.5}}
                    >
                        Пригласить
                    </Button>
                    <Button
                        onClick={close}
                        color="primary"
                        variant="text"
                        sx={{textTransform: "none", borderRadius: "10px"}}
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

export default InviteLecturerModal
