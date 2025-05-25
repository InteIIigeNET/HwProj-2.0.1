import { FC, useEffect } from "react";
import { useSnackbar } from "notistack";
import apiSingleton from "../../api/ApiSingleton";
import Utils from "@/services/Utils";

interface DownloadStatsProps {
    courseId: number | undefined
    userId: string
    onClose: () => void
}

const DownloadStats: FC<DownloadStatsProps> = (props: DownloadStatsProps) => {
    const {courseId, userId, onClose} = props
    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        const downloadStats = async () => {
            try {
                const statsDatetime = Utils.toStringForFileName(new Date())
                const response = await apiSingleton.statisticsApi.statisticsGetFile(courseId, userId, "Лист 1")
                const blob = await response.blob()
                const fileName = `StatsReport_${statsDatetime}`
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `${fileName}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode!.removeChild(link);
            } catch (e) {
                console.error("Ошибка при загрузке статистики:", e)
                enqueueSnackbar("Не удалось загрузить файл со статистикой, попробуйте позже", {variant: "error"})
            }
        }

        downloadStats()
        onClose()
    })

    return null
}

export default DownloadStats;
