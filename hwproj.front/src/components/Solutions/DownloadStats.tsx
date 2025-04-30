import { FC, useState } from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";

interface DownloadStatsProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
}

interface DownloadStatsState {
    fileName: string,
}

const DownloadStats: FC<DownloadStatsProps> = (props: DownloadStatsProps) => {
    const [state, setState] = useState<DownloadStatsState>({
        fileName: "",
    })

    const { fileName } = state

    const handleFileDownloading = (promise : Promise<Response>, fileName: string) => {
        promise.then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${fileName}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode!.removeChild(link);
            })
    }

    return <Grid container spacing={1} style={{ marginTop: 15 }}>
        <Grid container item spacing={1} alignItems={"center"}>
            <Grid item>
                <TextField size={"small"} fullWidth label={"Название файла"} value={fileName}
                           onChange={event => {
                               event.persist();
                               setState({fileName: event.target.value});
                           }} />
            </Grid>
            <Grid item>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button variant="text" color="primary" type="button"
                            onClick={() => {
                                const fileData = apiSingleton.statisticsApi.statisticsGetFile(
                                    props.courseId, props.userId, "Лист 1"
                                );
                                handleFileDownloading(fileData, fileName);
                            }}>
                        Загрузить
                    </Button>
                </Box>
            </Grid>
            <Grid item>
                <Button variant="text" color="primary" type="button"
                        onClick={props.onCancellation}>
                    Отмена
                </Button>
            </Grid>
        </Grid>
    </Grid>
}
export default DownloadStats;