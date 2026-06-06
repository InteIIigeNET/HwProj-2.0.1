import ApiSingleton from "@/api/ApiSingleton";
import {makeStyles} from "@material-ui/core/styles";
import {FC, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Alert, AlertTitle, Container, Typography} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface IConfirmState {
    isLoading: boolean;
    isConfirmed: boolean;
    error: string[];
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
    }
}));

const RegistrationRequestConfirm: FC = () => {
    const classes = useStyles();
    const [searchParams] = useSearchParams();

    const [state, setState] = useState<IConfirmState>({
        isLoading: true,
        isConfirmed: false,
        error: [],
    })

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setState({
                isLoading: false,
                isConfirmed: false,
                error: ["Некорректная ссылка подтверждения"],
            });
            return;
        }

        const confirm = async () => {
            try {
                const result = await ApiSingleton.authService.confirmRegistrationRequest({token});

                const isConfirmed = result.isConfirmed ?? false;
                setState({
                    isLoading: false,
                    isConfirmed,
                    error: isConfirmed 
                        ? []
                        : result.error && result.error.length > 0
                            ? result.error
                            : ["Не удалось подтвердить заявку"],
                });
            } catch {
                setState({
                    isLoading: false,
                    isConfirmed: false,
                    error: ["Сервис недоступен"],
                })
            }
        };

        confirm();
    }, [searchParams]);

    return (
        <Container component="main" maxWidth="sm">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} style={{color: "white", backgroundColor: "#ba2e2e"}}>
                    <MarkEmailReadIcon/>
                </Avatar>

                <Typography component="h1" variant="h5">
                    Подтверждение заявки
                </Typography>

                {state.isLoading && <DotLottieReact
                    src="https://lottie.host/919997f6-e82f-4995-b17d-bb3dad2376be/jDvgCK2W1q.lottie"
                    loop
                    autoplay
                />}

                {!state.isLoading && state.isConfirmed && (
                    <Alert severity="success" sx={{mt: 2, width: "100%"}}>
                        <AlertTitle>Почта подтверждена</AlertTitle>
                        Ваша заявка успешно подтверждена и отправлена на рассмотрение.
                    </Alert>
                )}

                {!state.isLoading && !state.isConfirmed && state.error.length > 0 && (
                    <Alert severity="error" sx={{mt: 2, width: "100%"}}>
                        <AlertTitle>Не удалось подтвердить заявку</AlertTitle>
                        {state.error.join(", ")}
                    </Alert>
                )}
            </div>
        </Container>
    )
}

export default RegistrationRequestConfirm;