import React, { FC, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import ApiSingleton from "../../api/ApiSingleton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {LtiLaunchData} from "@/api";

export interface LtiItemDto {
    title: string;
    text?: string;
    ltiLaunchData: LtiLaunchData;
    scoreMaximum: number;
}

interface LtiImportButtonProps {
    courseId: number;
    toolId: number;
    onImport: (items: LtiItemDto[]) => void;
}

export const LtiImportButton: FC<LtiImportButtonProps> = ({ courseId, toolId, onImport }) => {
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
        try {
            const response = await ApiSingleton.ltiAuthApi.ltiAuthStartLti(
                undefined,
                String(courseId), String(toolId), 
                undefined,
                undefined,
                true
            );
            let dto = response;
            if (response && typeof (response as any).json === 'function') {
                dto = await (response as any).json();
            }

            submitLtiForm(dto);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const handleLtiMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'LTI_DEEP_LINK_SUCCESS') {
                const payload = event.data.payload;

                const rawItems = Array.isArray(payload) ? payload : [payload];

                const items: LtiItemDto[] = rawItems.map((item: any) => {
                    let parsedItem = item;
                    if (typeof item === 'string') {
                        try {
                            parsedItem = JSON.parse(item);
                        } catch (e) {
                            console.error("Ошибка парсинга JSON от LTI:", item);
                            return null;
                        }
                    }

                    const mappedItem: LtiItemDto = {
                        title: parsedItem.title || "Задача из внешнего инструмента",
                        text: parsedItem.text || "",
                        ltiLaunchData: {
                            ltiLaunchUrl: parsedItem.url,
                            customParams: parsedItem.custom ? JSON.stringify(parsedItem.custom) : undefined
                        },

                        scoreMaximum: parsedItem.lineItem?.scoreMaximum || 10
                    };

                    return mappedItem;
                }).filter((item): item is LtiItemDto => item !== null);

                if (items.length > 0) {
                    onImport(items);
                }
            }
        };
        window.addEventListener("message", handleLtiMessage);
        return () => window.removeEventListener("message", handleLtiMessage);
    }, [onImport]);

    return (
        <Button
            fullWidth variant="text" color="primary"
            onClick={handleStartLti}
            startIcon={<CloudDownloadIcon />}
        >
            Импорт из внешнего инструмента
        </Button>
    );
};