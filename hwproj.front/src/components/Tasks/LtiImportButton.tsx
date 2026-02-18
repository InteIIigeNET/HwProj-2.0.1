import React, { FC, useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import ApiSingleton from "../../api/ApiSingleton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

export interface LtiItemDto {
    title: string;
    text?: string;
    url: string;
    scoreMaximum: number;
}

interface LtiImportButtonProps {
    courseId: number;
    toolId: number;
    onImport: (items: LtiItemDto[]) => void;
}

export const LtiImportButton: FC<LtiImportButtonProps> = ({ courseId, toolId, onImport }) => {
    const [isLoading, setIsLoading] = useState(false);

    const submitLtiForm = (formData: any) => {
        const windowName = "lti_tab_" + new Date().getTime();
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

    const handleStartLti = async () => {
        setIsLoading(true);
        try {
            const response = await ApiSingleton.ltiAuthApi.ltiAuthStartLti(
                undefined, String(courseId), String(toolId), undefined, true
            );
            let dto = response;
            if (response && typeof (response as any).json === 'function') {
                dto = await (response as any).json();
            }
            submitLtiForm(dto);
            setTimeout(() => setIsLoading(false), 30000);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleLtiMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'LTI_DEEP_LINK_SUCCESS') {
                const payload = event.data.payload;

                const rawItems = Array.isArray(payload) ? payload : [payload];

                const items = rawItems.map((item: any) => {
                    if (typeof item === 'string') {
                        try {
                            return JSON.parse(item);
                        } catch (e) {
                            console.error("Ошибка парсинга JSON от LTI:", item);
                            return null;
                        }
                    }
                    return item;
                }).filter(item => item !== null);

                if (items.length > 0) {
                    onImport(items);
                }
                setIsLoading(false);
            }
        };
        window.addEventListener("message", handleLtiMessage);
        return () => window.removeEventListener("message", handleLtiMessage);
    }, [onImport]);

    return (
        <LoadingButton
            fullWidth variant="text" color="primary"
            onClick={handleStartLti} loading={isLoading}
            startIcon={<CloudDownloadIcon />}
        >
            Импорт из внешнего инструмента
        </LoadingButton>
    );
};