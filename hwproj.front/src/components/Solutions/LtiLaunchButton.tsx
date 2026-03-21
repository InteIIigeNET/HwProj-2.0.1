import React, { FC, useState } from "react";
import { LoadingButton } from "@mui/lab";
import ApiSingleton from "../../api/ApiSingleton";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import DialogContentText from "@material-ui/core/DialogContentText";
import {LtiLaunchData} from "@/api";

interface LtiLaunchButtonProps {
    courseId: number;
    toolName: string;
    taskId: number;
    ltiLaunchData: LtiLaunchData;
}

export const LtiLaunchButton: FC<LtiLaunchButtonProps> = ({ courseId, toolName, taskId, ltiLaunchData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const submitLtiForm = (formData: any) => {
        const windowName = `lti_launch_task_${taskId}`;
        window.open('about:blank', windowName);

        const form = document.createElement("form");
        form.method = formData.method;
        form.action = formData.actionUrl;
        form.target = windowName;

        if (formData.fields) {
            Object.entries(formData.fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            });
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleLaunch = async () => {
        setOpenDialog(false);
        setIsLoading(true);
        try {
            const response = await ApiSingleton.ltiAuthApi.ltiAuthStartLti(
                String(taskId),
                String(courseId),
                toolName,
                ltiLaunchData.ltiLaunchUrl,
                ltiLaunchData.customParams,
                false
            );

            let dto = response;
            if (response && typeof (response as any).json === 'function') {
                dto = await (response as any).json();
            }

            submitLtiForm(dto);
        } catch (e) {
            console.error("Ошибка запуска LTI:", e);
            alert("Не удалось запустить задачу. Обратитесь к администратору.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                onClick={() => setOpenDialog(true)}
                loading={isLoading}
            >
                Решить задачу
            </LoadingButton>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="lti-warning-title"
                aria-describedby="lti-warning-desc"
            >
                <DialogTitle id="lti-warning-title">
                    Внимание
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="lti-warning-desc">
                        Вы переходите к решению задачи во внешней системе.
                        <br /><br />
                        Обратите внимание: <strong>баллы за решение могут появиться в HwProj не сразу</strong>, а с небольшой задержкой после завершения работы.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleLaunch} color="primary" variant="contained" autoFocus>
                        Понятно, перейти
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};