import { FC, useState } from "react";
import { Button, DialogActions, DialogContent, Grid } from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import { LoadingButton } from "@mui/lab";
import Utils from "@/services/Utils";

interface DownloadStatsProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
}

const DownloadStats: FC<DownloadStatsProps> = (props: DownloadStatsProps) => {
    const [loading, setLoading] = useState<boolean>(false)

    const handleFileDownloading = () => {
        const statsDatetime =  Utils.toStringForFileName(new Date())
        setLoading(true)
        apiSingleton.statisticsApi.statisticsGetFile(props.courseId, props.userId, "Лист 1")
        .then((response) => response.blob())
        .then((blob) => {
            const fileName = `StatsReport_${statsDatetime}`
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${fileName}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode!.removeChild(link);
        })
        .finally(() => setLoading(false))
    }

    return (
        <DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <Grid item>
                    <LoadingButton
                        variant="text"
                        color="primary"
                        type="button"
                        loading={loading}
                        onClick={handleFileDownloading}
                    >
                        Скачать
                    </LoadingButton>
                </Grid>
                <Grid item>
                    <Button variant="text" color="inherit" type="button"
                            onClick={props.onCancellation}>
                        Отмена
                    </Button>
                </Grid>
            </DialogActions>
        </DialogContent>
    )
}

export default DownloadStats;
