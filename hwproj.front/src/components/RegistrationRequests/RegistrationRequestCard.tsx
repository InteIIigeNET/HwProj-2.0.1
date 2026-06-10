import {RegistrationRequestDto} from "@/api";
import {FC} from "react";
import {Button, Card, CardActions, CardContent, Chip, Grid, Stack, Typography} from "@mui/material";
import Utils from "@/services/Utils";

interface IRegistrationRequestCardProps {
    request: RegistrationRequestDto;
    isProcessing?: boolean;
    isPreferredForCurrentLecturer?: boolean;
    isNewRegistration?: boolean;
    onApprove: (requestId: number) => void;
    onReject: (request: RegistrationRequestDto) => void;
}

const RegistrationRequestCard: FC<IRegistrationRequestCardProps> = (props) => {
    const {
        request,
        isProcessing,
        isPreferredForCurrentLecturer,
        isNewRegistration,
        onApprove,
        onReject,
    } = props;

    return (
        <Grid item xs={12} md={6} style={{display: "flex"}}>
            <Card variant="elevation" 
                  style={{
                      backgroundColor: "ghostwhite",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column"
                  }}>
                <CardContent style={{flexGrow: 1}}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6" component="div">
                            {request.surname} {request.name}
                        </Typography>

                        {isNewRegistration && (
                            <Chip
                                size="small"
                                color="info"
                                label="Новая регистрация"
                            />
                        )}

                        {isPreferredForCurrentLecturer && (
                            <Chip
                                size="small"
                                color="primary"
                                label="Предпочтительный преподаватель"
                            />
                        )}
                    </Stack>

                    {request.middleName && (
                        <Typography style={{color: "GrayText", marginTop: 4}}>
                            {request.middleName}
                        </Typography>
                    )}

                    <Typography style={{color: "GrayText", marginTop: 8}}>
                        {request.email}
                    </Typography>

                    {request.createdAtUtc && (
                        <Typography style={{color: "GrayText", marginTop: 4}}>
                            {Utils.renderDateWithoutSeconds(request.createdAtUtc)}
                        </Typography>
                    )}

                    {request.description && (
                        <Typography style={{marginTop: 16}}>
                            {request.description}
                        </Typography>
                    )}

                    {request.preferredLecturerEmail && (
                        <Typography style={{marginTop: 16, color: "GrayText"}}>
                            Предпочитаемый преподаватель: {request.preferredLecturerEmail}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button
                        onClick={() => onApprove(request.id!)}
                        size="small"
                        color="primary"
                        disabled={isProcessing}
                    >
                        Принять
                    </Button>

                    <Button
                        onClick={() => {
                            onReject(request);
                        }}
                        size="small"
                        color="error"
                        disabled={isProcessing}
                    >
                        Отклонить
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
}

export default RegistrationRequestCard;
