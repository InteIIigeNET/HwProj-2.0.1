import React, { FC, useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import ApiSingleton from "../../api/ApiSingleton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { CreateTaskViewModel } from "@/api";

interface LtiImportButtonProps {
    homeworkId: number;
    courseId: number;
    toolId: number;
    onTasksAdded: () => void;
}

export const LtiImportButton: FC<LtiImportButtonProps> = ({ homeworkId, courseId, toolId, onTasksAdded }) => {
    const [isLoading, setIsLoading] = useState(false);

    const submitLtiForm = (formData: any) => {
        if (!formData || !formData.actionUrl) {
            console.error("Invalid LTI Form Data");
            return;
        }

        const form = document.createElement("form");
        form.method = formData.method;
        form.action = formData.actionUrl;
        form.target = "_blank";

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
            // isDeepLink = true
            const response = await ApiSingleton.ltiAuthApi.ltiAuthStartLti(
                undefined,
                String(courseId),
                String(toolId),
                true
            );

            // Обработка ответа (если NSwag вернул Response вместо JSON)
            let dto = response;
            if (response && typeof (response as any).json === 'function') {
                dto = await (response as any).json();
            }

            submitLtiForm(dto);

            // Снимаем лоадер через 15 секунд (если пользователь просто закрыл вкладку и ничего не выбрал)
            setTimeout(() => setIsLoading(false), 15000);

        } catch (e) {
            console.error(e);
            alert("Не удалось запустить инструмент");
            setIsLoading(false);
        }
    };

    // 3. Слушаем ответ от вкладки с Инструментом
    useEffect(() => {
        const handleLtiMessage = async (event: MessageEvent) => {
            // Проверяем, что это сообщение от нашего LTI контроллера
            if (event.data && event.data.type === 'LTI_DEEP_LINK_SUCCESS') {
                const payload = event.data.payload;

                // Приводим к массиву (даже если вернулся один элемент)
                const items = Array.isArray(payload) ? payload : [payload];

                if (items.length === 0) return;

                setIsLoading(true);
                try {
                    let count = 0;

                    // Создаем задачи по очереди
                    for (const item of items) {
                        const newTask: CreateTaskViewModel = {
                            title: item.title || "External Task",

                            // ИЗМЕНЕНИЕ: Простое описание без ссылки
                            description: "Это интерактивное задание. Нажмите кнопку 'Перейти к выполнению', чтобы начать.",

                            maxRating: 10,
                            hasDeadline: false,
                            isDeadlineStrict: false,
                            publicationDate: undefined,

                            // ИЗМЕНЕНИЕ: Передаем URL в специальное поле
                            // (Убедитесь, что вы перегенерировали API клиент, и это поле доступно)
                            ltiLaunchUrl: item.url
                        };

                        await ApiSingleton.tasksApi.tasksAddTask(homeworkId, newTask);
                        count++;
                    }

                    // Успех!
                    alert(`Успешно импортировано задач: ${count}`);
                    onTasksAdded(); // Обновляем список задач на странице

                } catch (e) {
                    console.error("Ошибка импорта", e);
                    alert("Произошла ошибка при создании задач.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        window.addEventListener("message", handleLtiMessage);
        return () => window.removeEventListener("message", handleLtiMessage);
    }, [homeworkId, onTasksAdded]);

    return (
        <LoadingButton
            fullWidth
            variant="text"
            color="primary"
            onClick={handleStartLti}
            loading={isLoading}
            startIcon={<CloudDownloadIcon />}
        >
            Импорт из внешнего инструмента
        </LoadingButton>
    );
};