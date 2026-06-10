import {RegistrationRequestDto} from "@/api";
import {FC, useState} from "react";
import ApiSingleton from "@/api/ApiSingleton";
import {Alert, AlertTitle, Grid} from "@mui/material";
import RegistrationRequestCard from "@/components/RegistrationRequests/RegistrationRequestCard";
import RejectRegistrationRequestModal from "@/components/RegistrationRequests/RejectRegistrationRequestModal";

interface ICourseRegistrationRequestsProps {
    requests: RegistrationRequestDto[];
    onUpdate: () => Promise<void> | void;
}

const CourseRegistrationRequests: FC<ICourseRegistrationRequestsProps> = (props) => {
    const [error, setError] = useState<string[]>([]);
    const [rejectingRequest, setRejectingRequest] = useState<RegistrationRequestDto | undefined>(undefined);
    const [rejectError, setRejectError] = useState<string[]>([]);
    const [isRejectSubmitting, setIsRejectSubmitting] = useState<boolean>(false);
    const [processingRequestId, setProcessingRequestId] = useState<number | undefined>(undefined);
    
    const currentLecturerEmail = ApiSingleton.authService.getUserEmail().toLowerCase();
    
    const isPreferredForCurrentLecturer = (preferredLecturerEmail?: string) => {
        return !!preferredLecturerEmail &&
            preferredLecturerEmail.toLowerCase() === currentLecturerEmail;
    };

    const sortedRequests = [...props.requests].sort((leftRequest, rightRequest) => {
        const leftPriority = Number(isPreferredForCurrentLecturer(leftRequest.preferredLecturerEmail));
        const rightPriority = Number(isPreferredForCurrentLecturer(rightRequest.preferredLecturerEmail));

        return rightPriority - leftPriority;
    });

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

            try {
                await props.onUpdate();
                setError([]);
            } catch {
                setError(["Заявка принята, но не удалось обновить список"]);
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
                {rejectReason},
            );

            if (!result.succeeded) {
                setRejectError(result.errors ?? ["Не удалось отклонить заявку"]);
                return;
            }
            
            setRejectingRequest(undefined);

            try {
                await props.onUpdate();
                setError([]);
            } catch {
                setError(["Заявка отклонена, но не удалось обновить список"]);
            }
        } catch {
            setRejectError(["Сервис недоступен"]);
        } finally {
            setIsRejectSubmitting(false);
            setProcessingRequestId(undefined);
        }
    };

    return (
        <>
            {error.length > 0 && (
                <Grid item xs={12}>
                    <Alert severity="error">
                        <AlertTitle>Ошибка</AlertTitle>
                        {error.join(", ")}
                    </Alert>
                </Grid>
            )}

            {sortedRequests.map((request) => (
                <RegistrationRequestCard
                    key={request.id}
                    request={request}
                    isProcessing={processingRequestId !== undefined || isRejectSubmitting}
                    isPreferredForCurrentLecturer={isPreferredForCurrentLecturer(request.preferredLecturerEmail)}
                    isNewRegistration
                    onApprove={approveRequest}
                    onReject={(selectedRequest) => {
                        setRejectingRequest(selectedRequest);
                        setRejectError([]);
                    }}
                />
            ))}
            
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
        </>
    )
}

export default CourseRegistrationRequests;
