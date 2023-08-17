import React, { FC, useState } from "react";
import { useEffect } from 'react';
import { ResultString } from "../../api";
import { Alert, Box, Button, CircularProgress, Grid, MenuItem, Select, TextField } from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import { green, red } from "@material-ui/core/colors";

enum LoadingStatus {
    None,
    Loading,
    Success,
    Error
}

interface ExportToGoogleProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
}

interface ExportToGoogleState {
    url: string
    googleSheetTitles: ResultString | undefined
    selectedSheet: number
    loadingStatus: LoadingStatus
    error: string | null

}

const ExportToGoogle: FC<ExportToGoogleProps> = (props: ExportToGoogleProps) => {
    const [state, setState] = useState<ExportToGoogleState>({
        url: '',
        selectedSheet: 0,
        googleSheetTitles: undefined,
        loadingStatus: LoadingStatus.None,
        error: null
    })

    const {url, googleSheetTitles, selectedSheet, loadingStatus, error } = state

    const handleGoogleDocUrlChange = async (value: string) => {
        const titles = await apiSingleton.statisticsApi.apiStatisticsGetSheetTitlesGet(value)
        setState(prevState => ({ ...prevState, url: value, googleSheetTitles: titles }));
    }

    const getGoogleSheetName = () => {
        return (googleSheetTitles && googleSheetTitles.value
            && googleSheetTitles.value.length > state.selectedSheet)
            ? googleSheetTitles.value[state.selectedSheet] : "";
    }

    const buttonSx = {
        ...(loadingStatus === LoadingStatus.Success && {
            color: green[600],
        }),
        ...(loadingStatus === LoadingStatus.Error && {
            color: red[600],
        }),
    };

    return <Grid container spacing={1} style={{ marginTop: 15 }}>
        <Grid xs={12} item>
            {(googleSheetTitles && !googleSheetTitles.succeeded &&
            <Alert severity="error">
                {googleSheetTitles!.errors![0]}
            </Alert>)
                ||
                (loadingStatus === LoadingStatus.Error &&
                    <Alert severity="error">
                    {error}
                    </Alert>)
                ||
                (<Alert severity="info" variant={"standard"}>
                    Для загрузки таблицы необходимо разрешить доступ на редактирование по ссылке для Google Sheets
                </Alert>)
            }
        </Grid>
        <Grid container item spacing={1} alignItems={"center"}>
            <Grid item xs={5}>
                <TextField size={"small"} fullWidth label={"Ссылка на Google Sheets"} value={url}
                           onChange={event =>
                               handleGoogleDocUrlChange(event.target.value)
                           }
                />
            </Grid>
            {googleSheetTitles && googleSheetTitles.value && googleSheetTitles.value.length > 0 && <Grid item>
                <Select
                    size={"small"}
                    id="demo-simple-select"
                    label={"Лист"}
                    value={selectedSheet}
                    onChange={v => setState(prevState => ({ ...prevState, selectedSheet: +v.target.value }))}
                >
                    {googleSheetTitles.value.map((title, i) => <MenuItem value={i}>{title}</MenuItem>)}
                </Select>
            </Grid>}
            {googleSheetTitles && googleSheetTitles.succeeded && <Grid item>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button variant="text" color="primary" type="button" sx={buttonSx}
                            onClick={async () => {
                                setState((prevState) => ({...prevState, loadingStatus: LoadingStatus.Loading}))
                                const result = await apiSingleton.statisticsApi.apiStatisticsExportToSheetGet(
                                    props.courseId,
                                    url,
                                    getGoogleSheetName())
                                setState((prevState) =>
                                    ({...prevState,
                                        loadingStatus: result.succeeded ? LoadingStatus.Success : LoadingStatus.Error,
                                        error: result.errors === undefined
                                            || result.errors === null
                                            || result.errors.length === 0
                                                ? null : result.errors[0]
                                    }))
                            }
                        }>
                        Сохранить
                    </Button>
                    {loadingStatus === LoadingStatus.Loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: green[500],
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </Grid>}
            <Grid item>
                <Button variant="text" color="primary" type="button"
                        onClick={props.onCancellation}>
                    Отмена
                </Button>
            </Grid>
        </Grid>
    </Grid>
}
export default ExportToGoogle;
