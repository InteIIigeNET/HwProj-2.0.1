import {FC, useEffect, useState} from "react";
import {RegistrationRequestDto} from "@/api";
import ApiSingleton from "@/api/ApiSingleton";
import {
    Alert,
    AlertTitle,
    Chip,
    Grid,
    Stack,
    Typography,
    Tabs,
    Tab
} from "@mui/material";
import RejectRegistrationRequestModal from "./RejectRegistrationRequestModal";
import RegistrationRequestCard from "./RegistrationRequestCard";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

const GeneralRegistrationRequests: FC = () => {
    const [requests, setRequests] = useState<RegistrationRequestDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string[]>([]);
    const [tabValue, setTabValue] = useState<number>(0);

    const [rejectingRequest, setRejectingRequest] = useState<RegistrationRequestDto | undefined>(undefined);
    const [rejectError, setRejectError] = useState<string[]>([]);
    const [isRejectSubmitting, setIsRejectSubmitting] = useState<boolean>(false);

    const [processingRequestId, setProcessingRequestId] = useState<number | undefined>(undefined);

    const currentLecturerEmail = ApiSingleton.authService.getUserEmail().toLowerCase();

    const isPreferredForCurrentLecturer = (preferredLecturerEmail?: string) => {
        return !!preferredLecturerEmail &&
            preferredLecturerEmail.toLowerCase() === currentLecturerEmail;
    };
    
    const sortRequestsByPriority = (items: RegistrationRequestDto[]) => {
        return [...items].sort((leftRequest, rightRequest) => {
            const leftPriority = Number(isPreferredForCurrentLecturer(leftRequest.preferredLecturerEmail));
            const rightPriority = Number(isPreferredForCurrentLecturer(rightRequest.preferredLecturerEmail));
            return rightPriority - leftPriority;
        })
    }

    const studentRequests = sortRequestsByPriority(
        requests.filter((request) => request.requestedRole === "Student"),
    )
    const lecturerRequests = requests.filter((request) => request.requestedRole === "Lecturer");
    
    const loadRequests = async () => {
        setIsLoading(true);
        setError([]);

        try {
            const result = await ApiSingleton.registrationRequestsApi.registrationRequestsGetGeneralRequests();

            if (result.succeeded) {
                setRequests(result.value ?? []);
            } else {
                setRequests([]);
                setError(result.errors ?? ["Не удалось загрузить заявки"]);
            }
        } catch {
            setRequests([]);
            setError(["Сервис недоступен"]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const refreshRequests = async () => {
        try {
            const result = await ApiSingleton.registrationRequestsApi.registrationRequestsGetGeneralRequests();
            if (!result.succeeded) {
                return false;
            } 
            
            setRequests(result.value ?? []);
            return true;
        } catch {
            return false;
        }
    }
    
    const isLecturer = ApiSingleton.authService.isLecturer();
    useEffect(() => {
        if (!isLecturer) {
            setIsLoading(false);
            return;
        }
        
        loadRequests();
    }, [isLecturer]);

    const approveRequest = async (requestId: number) => {
        if (processingRequestId !== undefined || isRejectSubmitting) {
            return;
        }
        
        setProcessingRequestId(requestId);
        setError([]);

        try {
            const result = await ApiSingleton.registrationRequestsApi.registrationRequestsApprove(requestId);
            if (!result.succeeded) {
                setError(result.errors ?? ["Не удалось принять заявку"]);
                return;
            }
            
            const refreshed = await refreshRequests();
            if (!refreshed) {
                setError(["Заявка принята, но не удалось обновить список"]);
            } else {
                setError([])
            }
        } catch {
            setError(["Сервис недоступен"]);
        } finally {
            setProcessingRequestId(undefined);
        }
    };

    const rejectRequest = async (rejectReason?: string) => {
        if (!rejectingRequest?.id || processingRequestId !== undefined || isRejectSubmitting) {
            return;
        }

        setProcessingRequestId(rejectingRequest.id);
        setIsRejectSubmitting(true);
        setRejectError([]);
        
        try {
            const result = await ApiSingleton.registrationRequestsApi.registrationRequestsReject(
                rejectingRequest.id,
                {rejectReason}
            );

            if (!result.succeeded) {
                setRejectError(result.errors ?? ["Не удалось отклонить заявку"]);
                return;
            } 
            
            setRejectingRequest(undefined);

            const refreshed = await refreshRequests();
            if (!refreshed) {
                setError(["Заявка отклонена, но не удалось обновить список"])
            } else {
                setError([]);
            }
        } catch {
            setRejectError(["Сервис недоступен"]);
        } finally {
            setIsRejectSubmitting(false);
            setProcessingRequestId(undefined);
        }
    };

    const renderRequests = (items: RegistrationRequestDto[], emptyText: string) => {
        if (items.length === 0) {
            return (
                <Grid item xs={12}>
                    <Alert severity="info">
                        <AlertTitle>Нет новых заявок</AlertTitle>
                        {emptyText}
                    </Alert>
                </Grid>
            )
        }

        return items.map((request) => (
            <RegistrationRequestCard
                key={request.id}
                request={request}
                isProcessing={processingRequestId !== undefined || isRejectSubmitting}
                isPreferredForCurrentLecturer={isPreferredForCurrentLecturer(request.preferredLecturerEmail)}
                onApprove={approveRequest}
                onReject={(selectedRequest) => {
                    setRejectingRequest(selectedRequest);
                    setRejectError([]);
                }}
            />
        ))
    }

    if (!isLecturer) {
        return (
            <div className="container" style={{marginTop: "15px"}}>
                <Alert severity="error">
                    <AlertTitle>Страница недоступна</AlertTitle>
                    Доступ только для преподавателей.
                </Alert>
            </div>
        )
    }
    
    if (isLoading) {
        return (
            <div className="container">
                <DotLottieReact
                    src="https://lottie.host/919997f6-e82f-4995-b17d-bb3dad2376be/jDvgCK2W1q.lottie"
                    loop
                    autoplay
                />
            </div>
        )
    }

    return (
        <div className="container" style={{marginTop: "15px", marginBottom: "30px"}}>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Typography variant="h5">
                        Общие заявки на регистрацию
                    </Typography>
                </Grid>

                {error.length > 0 && (
                    <Grid item>
                        <Alert severity="error">
                            <AlertTitle>Ошибка</AlertTitle>
                            {error.join(", ")}
                        </Alert>
                    </Grid>
                )}

                <Grid item>
                    <Tabs
                        style={{marginBottom: 10}}
                        variant="scrollable"
                        scrollButtons={"auto"}
                        value={tabValue}
                        indicatorColor="primary"
                        onChange={(event, value) => {
                            setTabValue(value);
                        }}
                    >
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <div>Заявки студентов</div>
                                    <Chip size={"small"} color={"default"} label={studentRequests.length}/>
                                </Stack>
                            }
                        />
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <div>Заявки преподавателей</div>
                                    <Chip size={"small"} color={"default"} label={lecturerRequests.length}/>
                                </Stack>
                            }
                        />
                    </Tabs>
                </Grid>

                {tabValue === 0 && (
                    <Grid item container spacing={2}>
                        {renderRequests(studentRequests, "Нет новых заявок от студентов.")}
                    </Grid>
                )}

                {tabValue === 1 && (
                    <Grid item container spacing={2}>
                        {renderRequests(lecturerRequests, "Нет новых заявок от преподавателей.")}
                    </Grid>
                )}
            </Grid>

            <RejectRegistrationRequestModal
                isOpen={rejectingRequest !== undefined}
                applicantName={
                    rejectingRequest
                        ? `${rejectingRequest.surname} ${rejectingRequest.name}`
                        : undefined
                }
                isSubmitting={isRejectSubmitting}
                error={rejectError}
                onClose={() => {
                    setRejectingRequest(undefined);
                    setRejectError([]);
                }}
                onReject={rejectRequest}
            />
        </div>
    );
}

export default GeneralRegistrationRequests