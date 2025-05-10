import { FC, useState } from "react";
import { Button, DialogActions, DialogContent, Grid, TextField } from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import { LoadingButton } from "@mui/lab";

interface DownloadStatsProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
}

const DownloadStats: FC<DownloadStatsProps> = (props: DownloadStatsProps) => {
    const [fileName, setFileName] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const handleFileDownloading = () => {
        setLoading(true)
        apiSingleton.statisticsApi.statisticsGetFile(props.courseId, props.userId, "Лист 1")
        .then((response) => response.blob())
        .then((blob) => {
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
            <DialogActions>
                <Grid item>
                    <TextField
                        fullWidth
                        size="small"
                        label="Название файла"
                        value={fileName}
                        onChange={event => {
                            event.persist();
                            setFileName(event.target.value);
                        }}
                    />
                </Grid>
                <Grid>
                    <LoadingButton
                        variant="text"
                        color="primary"
                        type="button"
                        loading={loading}
                        onClick={handleFileDownloading}
                    >
                        Загрузить
                    </LoadingButton>
                </Grid>
                <Grid>
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
