import * as React from "react";
import {FC, FormEvent, useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
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
import {LoadingButton} from "@mui/lab";
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import {AccountDataDto, EditAccountViewModel} from "@/api";
import ApiSingleton from "../api/ApiSingleton";
import {UserInitialsAvatar} from "./Common/UserInitialsAvatar";

interface IEditProfileModalProps {
    isOpen: boolean
    isExpert: boolean
    user: AccountDataDto
    // Ошибка привязки GitHub приходит со страницы: аккаунт привязывается при возврате с github.com
    githubError?: string
    onClose: () => void
    onSaved: () => void
}

interface IEditProfileFormState {
    name: string
    surname: string
    middleName: string
    email: string
    company: string
    bio: string
}

// Оформление согласовано с остальными диалогами: скруглённые поля, мягкий индиго-акцент
const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const actionButtonSx = {
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 500,
    px: 2.5,
}

const githubPanelSx = {
    px: 1.5,
    py: 1.25,
    borderRadius: "12px",
    border: "1px solid #e0e3e7",
    backgroundColor: "#fafbfe",
}

const githubIconSx = {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#eceef4",
    color: "#24292f",
}

const toFormState = (user: AccountDataDto): IEditProfileFormState => ({
    name: user.name ?? "",
    surname: user.surname ?? "",
    middleName: user.middleName ?? "",
    email: user.email ?? "",
    company: user.companyName ?? "",
    bio: user.bio ?? "",
})

const EditProfileModal: FC<IEditProfileModalProps> = (props) => {
    const {user, isExpert, githubError} = props

    // У пользователей с внешней авторизацией часть данных приходит от провайдера — их не редактируем,
    // условия те же, что на странице /user/edit
    const isExternalAuth = user.isExternalAuth ?? false
    const showCompany = !isExternalAuth
    const showGithub = !isExternalAuth && !isExpert

    const [form, setForm] = useState<IEditProfileFormState>(toFormState(user))
    const [errors, setErrors] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [githubLoginUrl, setGithubLoginUrl] = useState<string | undefined>(undefined)

    // Форма открывается поверх карточки профиля, поэтому при каждом открытии подхватываем актуальные данные
    useEffect(() => {
        if (props.isOpen) {
            setForm(toFormState(user))
            setErrors([])
        }
    }, [props.isOpen, user])

    useEffect(() => {
        if (!props.isOpen || !showGithub || githubLoginUrl !== undefined) return
        // Возвращаемся на ту же страницу без параметров: код авторизации GitHub добавит сам
        const url = window.location.origin + window.location.pathname
        ApiSingleton.accountApi.accountGetGithubLoginUrl({url})
            .then(result => setGithubLoginUrl(result.url))
            .catch(() => setGithubLoginUrl(""))
    }, [props.isOpen, showGithub, githubLoginUrl])

    const setField = (field: keyof IEditProfileFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setForm(prevState => ({...prevState, [field]: value}))
    }

    const save = async () => {
        const editForm: EditAccountViewModel = {
            name: form.name,
            surname: form.surname,
            middleName: form.middleName,
            email: form.email,
            bio: form.bio,
            companyName: form.company,
        }
        try {
            const result = await ApiSingleton.accountApi.accountEdit(editForm)
            if (!result.succeeded) {
                setErrors(result.errors!)
                return false
            }
            if (isExpert) await ApiSingleton.authService.setIsExpertProfileEdited()
            return true
        } catch (e) {
            setErrors(['Сервис недоступен'])
            return false
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        setErrors([])
        const saved = await save()
        setIsSaving(false)
        if (saved) props.onSaved()
    }

    // Привязка GitHub уводит со страницы, поэтому сначала сохраняем введённое, чтобы правки не потерялись
    const goToGithub = async () => {
        if (!githubLoginUrl) return
        setIsSaving(true)
        setErrors([])
        const saved = await save()
        if (!saved) {
            setIsSaving(false)
            return
        }
        window.location.href = githubLoginUrl
    }

    const allErrors = githubError ? [githubError, ...errors] : errors

    return (
        <Dialog
            open={props.isOpen}
            onClose={props.onClose}
            aria-labelledby="edit-profile-title"
            fullWidth
            maxWidth={"sm"}
            PaperProps={{sx: {borderRadius: "16px"}}}
        >
            <Box component={"form"} onSubmit={handleSubmit}>
                <DialogTitle id="edit-profile-title" sx={{p: 2}}>
                    <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
                        <UserInitialsAvatar user={user} size={40}/>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}>
                                Редактировать профиль
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Так вас видят на курсах
                            </Typography>
                        </Box>
                        <Tooltip arrow title={"Закрыть"}>
                            <IconButton size={"small"} onClick={props.onClose} sx={{flexShrink: 0}}>
                                <CloseIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </DialogTitle>
                <Divider/>
                <DialogContent sx={{p: 2}}>
                    <Stack spacing={2}>
                        {allErrors.length > 0 &&
                            <Alert severity="error" sx={{borderRadius: "10px"}}>
                                {allErrors.map((error, index) => <div key={index}>{error}</div>)}
                            </Alert>}
                        {/* Раскладка на Stack, а не на Grid: Stack снаружи ставит детям margin: 0
                            и стирает отрицательные отступы Grid container, из-за чего поля уезжают за край */}
                        <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                            <TextField
                                fullWidth
                                required
                                label="Фамилия"
                                variant="outlined"
                                sx={inputSx}
                                value={form.surname}
                                onChange={setField("surname")}
                            />
                            <TextField
                                fullWidth
                                required
                                label="Имя"
                                variant="outlined"
                                sx={inputSx}
                                value={form.name}
                                onChange={setField("name")}
                            />
                        </Stack>
                        <TextField
                            fullWidth
                            label="Отчество"
                            variant="outlined"
                            sx={inputSx}
                            value={form.middleName}
                            onChange={setField("middleName")}
                        />
                        {isExpert &&
                            <TextField
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                sx={inputSx}
                                value={form.email}
                                onChange={setField("email")}
                            />}
                        {showCompany &&
                            <TextField
                                fullWidth
                                label="Организация/Компания"
                                variant="outlined"
                                sx={inputSx}
                                value={form.company}
                                onChange={setField("company")}
                            />}
                        {isExpert &&
                            <TextField
                                fullWidth
                                multiline
                                label="Дополнительная информация (био)"
                                variant="outlined"
                                sx={inputSx}
                                value={form.bio}
                                onChange={setField("bio")}
                            />}
                        {showGithub &&
                            <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={githubPanelSx}>
                                <Box sx={githubIconSx}>
                                    <GitHubIcon fontSize={"small"}/>
                                </Box>
                                <Box sx={{flexGrow: 1, minWidth: 0}}>
                                    <Typography sx={{fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.3}}>
                                        {user.githubId ? user.githubId : "GitHub не привязан"}
                                    </Typography>
                                    <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                        {user.githubId
                                            ? "Аккаунт привязан — по нему видно вашу аватарку"
                                            : "Нужен, чтобы показывать вашу аватарку"}
                                    </Typography>
                                </Box>
                                <Button
                                    size={"small"}
                                    variant={"outlined"}
                                    disabled={!githubLoginUrl || isSaving}
                                    onClick={goToGithub}
                                    sx={{...actionButtonSx, px: 1.75, flexShrink: 0}}
                                >
                                    {user.githubId ? "Изменить" : "Привязать"}
                                </Button>
                            </Stack>}
                    </Stack>
                </DialogContent>
                <Divider/>
                <DialogActions sx={{px: 2, py: 1.5, gap: 1}}>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        disableElevation
                        loading={isSaving}
                        disabled={!form.name.trim() || !form.surname.trim()}
                        sx={actionButtonSx}
                    >
                        Сохранить
                    </LoadingButton>
                    <Button
                        onClick={props.onClose}
                        color="primary"
                        variant="text"
                        sx={actionButtonSx}
                    >
                        Отменить
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

export default EditProfileModal
