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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import ApiSingleton from 'api/ApiSingleton'
import React, {FC, FormEvent, useEffect, useState} from 'react'
import {AccountDataDto} from "@/api";
import ValidationUtils from "../Utils/ValidationUtils";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";

interface AddLecturerInCourseProps {
    onClose: any;
    isOpen: boolean;
    courseId: string;
    update: any;
}

interface AddLecturerInCourseState {
    email: string;
    errors: string[];
    info: string[];
    data: AccountDataDto[];
}

// В инпут подставляем только email, поэтому по ФИО ищем через отдельный матчер
const filterOptions = createFilterOptions<AccountDataDto>({
    stringify: option => `${option.email ?? ""} ${option.surname ?? ""} ${option.name ?? ""} ${option.middleName ?? ""}`,
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

const AddLecturerInCourse: FC<AddLecturerInCourseProps> = (props) => {

    const [lecturerState, setLecturerState] = useState<AddLecturerInCourseState>({
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
                errors: ['Некорректный адрес электронной почты']
            }))
            return
        }
        try {
            await ApiSingleton.coursesApi.coursesAcceptLecturer(+props.courseId, lecturerState.email)
            const data = await ApiSingleton.coursesApi.coursesGetLecturersAvailableForCourse(+props.courseId);
            setLecturerState((prevState) => ({
                ...prevState,
                info: ['Преподаватель добавлен'],
                errors: [],
                data: data
            }))
            props.update()
        } catch (e) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const closeDialogIcon = () => {
        // Диалог смонтирован всегда, а список преподавателей загружается один раз при монтировании,
        // поэтому очищаем только ввод: иначе при повторном открытии подсказок не останется
        setLecturerState((prevState) => ({
            ...prevState,
            info: [],
            errors: [],
            email: '',
        }))
        props.onClose()
    }

    const setCurrentState = async () => {
        const data = await ApiSingleton.coursesApi.coursesGetLecturersAvailableForCourse(+props.courseId);
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
            onClose={closeDialogIcon}
            aria-labelledby="add-lecturer-title"
            open={props.isOpen}
            fullWidth
            maxWidth={"sm"}
            PaperProps={{sx: {borderRadius: "16px"}}}
        >
            <Box component={"form"} onSubmit={handleSubmit}>
                <DialogTitle id="add-lecturer-title" sx={{p: 2}}>
                    <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
                        <Box sx={iconBadgeSx}>
                            <PersonAddAlt1OutlinedIcon fontSize={"small"}/>
                        </Box>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}>
                                Добавить преподавателя
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Приглашение по адресу электронной почты
                            </Typography>
                        </Box>
                        <Tooltip arrow title={"Закрыть"}>
                            <IconButton size={"small"} onClick={closeDialogIcon} sx={{flexShrink: 0}}>
                                <CloseIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </DialogTitle>
                <Divider/>
                <DialogContent sx={{p: 2}}>
                    <Stack spacing={3}>
                        <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                            Пользователь должен быть зарегистрирован и иметь статус лектора.
                            Начните вводить email или ФИО — подходящие преподаватели появятся в списке.
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
                            noOptionsText={"Нет подходящих преподавателей"}
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
                                                {`${option.surname ?? ""} ${option.name ?? ""} ${option.middleName ?? ""}`.trim()}
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
                                    label="Email или ФИО преподавателя"
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
                        onClick={closeDialogIcon}
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

export default AddLecturerInCourse
