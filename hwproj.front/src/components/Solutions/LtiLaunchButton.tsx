import React, { FC, useState } from "react";
import { LoadingButton } from "@mui/lab";
import ApiSingleton from "../../api/ApiSingleton";

interface LtiLaunchButtonProps {
    courseId: number;
    toolId: number;
    taskId: number;
    ltiLaunchUrl: string;
}

export const LtiLaunchButton: FC<LtiLaunchButtonProps> = ({ courseId, toolId, taskId, ltiLaunchUrl }) => {
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        try {
            const response = await ApiSingleton.ltiAuthApi.ltiAuthStartLti(
                String(taskId),   // resourceLinkId
                String(courseId),
                String(toolId),
                ltiLaunchUrl,
                false
            );

            // Обработка ответа (как в вашем коде)
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
        <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            onClick={handleLaunch}
            loading={isLoading}
        >
            Решить задачу
        </LoadingButton>
    );
};