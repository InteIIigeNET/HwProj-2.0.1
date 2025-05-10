import { FC, useState, useEffect } from "react";
import {
    Alert,
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    Link,
    TextField,
} from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import { green, red } from "@material-ui/core/colors";
import { LoadingButton } from "@mui/lab";

enum LoadingStatus {
    None,
    Loading,
    Success,
    Error,
}

interface LocalStorageKey {
    name: string
    userId: string
}

interface ExportToYandexProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
    userCode: string | null
}

interface ExportToYandexState {
    fileName: string
    userToken: string | null
    loadingStatus: LoadingStatus
    isAuthorizationError: boolean
}

const ExportToYandex: FC<ExportToYandexProps> = (props: ExportToYandexProps) => {
    const [state, setState] = useState<ExportToYandexState>({
        fileName: "",
        userToken: localStorage.getItem(
            JSON.stringify({name: "yandexAccessToken", userId: `${props.userId}`})),
        loadingStatus: LoadingStatus.None,
        isAuthorizationError: false,
    })

    const { fileName, userToken, loadingStatus, isAuthorizationError } = state

    const setUserYandexToken = async (userConfirmationCode: string, userId: string) : Promise<string> => {
        const fetchBody = `grant_type=authorization_code&code=${userConfirmationCode}` +
        `&client_id=${import.meta.env.VITE_YANDEX_CLIENT_ID}&client_secret=${import.meta.env.VITE_YANDEX_CLIENT_SECRET}`;

        const response = await fetch(`https://oauth.yandex.ru/token`, {
            method: "post",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; Charset=utf-8',
                'Host': 'https://oauth.yandex.ru/'
            },
            body: fetchBody
        })
        if (response.status === 200) {
            const jsonResponse = await response.json();
            const token = jsonResponse.access_token;
            if (token !== null && userId !== undefined) {
                const localStorageKey : LocalStorageKey = {
                    name: 'yandexAccessToken',
                    userId: userId
                }
                localStorage.setItem(JSON.stringify(localStorageKey), token);
                return token;
            }
        }
        return "error";
    }

    const setCurrentState = async () =>
    {
        if (userToken === null && props.userCode !== null)
        {
            const token = await setUserYandexToken(props.userCode, props.userId)
            setState((prevState) =>
                ({...prevState, userToken: token === 'error' ? null : token, isAuthorizationError: token === 'error'}))
        }
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    const handleExportClick = async () =>
    {
        fetch(`https://cloud-api.yandex.net/v1/disk/resources/upload?path=app:/${fileName}.xlsx&overwrite=true`,
            {
                method: "get",
                headers: {
                    'Authorization': `${import.meta.env.VITE_YANDEX_AUTHORIZATION_TOKEN}`,
                }})
            .then( async (response) => {
                if (response.status >= 200 && response.status < 300) {
                    const jsonResponse = await response.json();
                    const url = jsonResponse.href;
                    const fileData = await apiSingleton.statisticsApi.statisticsGetFile(props.courseId, props.userId, "Лист 1");
                    const data = await fileData.blob();
                    const fileExportResponse = await fetch(url,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/octet-stream',
                                'Content-Length': `${data.size}`
                            },
                            body: data
                        })
                    if (fileExportResponse.status >= 200 && fileExportResponse.status < 300)
                    {
                        setState((prevState) => ({...prevState, loadingStatus: LoadingStatus.Success}))
                        return;
                    }
                }

                setState((prevState) => ({...prevState, loadingStatus: LoadingStatus.Error}))
            })
    }

    const yacRequestLink = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${import.meta.env.VITE_YANDEX_CLIENT_ID}`

    const buttonSx = {
        ...(loadingStatus === LoadingStatus.Success && {
            color: green[600],
        }),
        ...(loadingStatus === LoadingStatus.Error && {
            color: red[600],
        }),
    };

    return userToken === null ? (
        <DialogContent>
            <DialogContentText>
                <Grid item>
                    {isAuthorizationError ? (
                        <Alert severity="error" variant="standard">
                            Авторизация не пройдена. Попробуйте{" "}
                            <Link href={yacRequestLink}>
                                еще раз
                            </Link>
                        </Alert>
                    ) : (
                        <Alert severity="info" variant="standard">
                            Для загрузки таблицы необходимо пройти{" "}
                            <Link href={yacRequestLink}>
                                авторизацию
                            </Link>
                        </Alert>
                    )}
                </Grid>
            </DialogContentText>
            <DialogActions style={{ padding: 0, marginTop: 12 }}>
                <Grid item>
                    <Button variant="text" color="inherit" type="button"
                            onClick={props.onCancellation}>
                        Отмена
                    </Button>
                </Grid>
            </DialogActions>
        </DialogContent>
    ) : (
        <DialogContent>
            <DialogContentText>
                <Grid item>
                    <Alert severity="success" variant="standard">
                        Авторизация успешно пройдена. Файл будет загружен на диск по адресу
                        "Приложения/{import.meta.env.VITE_YANDEX_APPLICATION_NAME}/{fileName}.xlsx"
                    </Alert>
                </Grid>
            </DialogContentText>
            <DialogActions style={{ padding: 0, marginTop: 12 }}>
                <Grid item marginRight="auto">
                    <TextField
                        fullWidth
                        size="small"
                        label="Название файла"
                        value={fileName}
                        onChange={event => {
                            event.persist()
                            setState((prevState) =>
                                ({...prevState, fileName: event.target.value, loadingStatus: LoadingStatus.None})
                            )
                        }}
                    />
                </Grid>
                <Grid item>
                    <LoadingButton
                        variant="text"
                        color="primary"
                        type="button"
                        sx={buttonSx}
                        loading={loadingStatus === LoadingStatus.Loading}
                        onClick={() => {
                            setState((prevState) => ({...prevState, loadingStatus: LoadingStatus.Loading}))
                            handleExportClick()
                        }}
                    >
                        Сохранить
                    </LoadingButton>
                </Grid>
                <Grid item>
                    <Button variant="text" color="inherit" type="button"
                            onClick={props.onCancellation}>
                        Отмена
                    </Button>
                </Grid>
            </DialogActions>
        </DialogContent>
    )
}

export default ExportToYandex;
