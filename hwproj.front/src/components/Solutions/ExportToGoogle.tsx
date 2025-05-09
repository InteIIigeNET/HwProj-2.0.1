import { FC, useState } from "react";
import { Alert, Button, Grid, MenuItem, Select, TextField } from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import { green, red } from "@material-ui/core/colors";
import { StringArrayResult } from "@/api";
import { LoadingButton } from "@mui/lab";

enum LoadingStatus {
    None,
    Loading,
    Success,
    Error,
}

interface ExportToGoogleProps {
    courseId: number | undefined
    userId: string
    onCancellation: () => void
}

interface ExportToGoogleState {
    url: string
    googleSheetTitles: StringArrayResult | undefined
    selectedSheet: number
    loadingStatus: LoadingStatus
    error: string | null
}

const ExportToGoogle: FC<ExportToGoogleProps> = (props: ExportToGoogleProps) => {
    const [state, setState] = useState<ExportToGoogleState>({
        url: "",
        selectedSheet: 0,
        googleSheetTitles: undefined,
        loadingStatus: LoadingStatus.None,
        error: null
    })

    const {url, googleSheetTitles, selectedSheet, loadingStatus, error } = state

    const handleGoogleDocUrlChange = (value: string) => {
        setState(prevState => ({ ...prevState, url: value }))
        if (value)
            apiSingleton.statisticsApi.statisticsGetSheetTitles(value)
            .then(response => setState(prevState => ({ ...prevState, googleSheetTitles: response }))) 
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

    return (
        <Grid container direction="column" spacing={1} marginTop="2px" width="100%">
            <Grid item xs={12}>
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
                    (<Alert severity="info" variant="standard">
                        Для загрузки таблицы необходимо разрешить доступ на редактирование по ссылке для Google Sheets
                    </Alert>)
                }
            </Grid>
            <Grid container item direction="row" spacing={1} width="100%"
                  justifyContent="space-between" alignItems="center">
                <Grid item xs={5}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Ссылка на Google Sheets"
                        value={url}
                        onChange={event => {
                            event.persist()
                            handleGoogleDocUrlChange(event.target.value)
                        }}
                    />
                </Grid>
                {googleSheetTitles && googleSheetTitles.value && googleSheetTitles.value.length > 0 &&
                    <Grid item>
                        <Select
                            size="small"
                            id="demo-simple-select"
                            label="Лист"
                            value={selectedSheet}
                            onChange={v => setState(prevState => ({ ...prevState, selectedSheet: +v.target.value }))}
                        >
                            {googleSheetTitles.value.map((title, i) => <MenuItem value={i}>{title}</MenuItem>)}
                        </Select>
                    </Grid>
                }
                <Grid item>
                    {googleSheetTitles && googleSheetTitles.succeeded &&
                        <LoadingButton
                            variant="text"
                            color="primary"
                            type="button"
                            sx={buttonSx}
                            style={{ marginRight: 8 }}
                            loading={loadingStatus === LoadingStatus.Loading}
                            onClick={async () => {
                                setState((prevState) => ({...prevState, loadingStatus: LoadingStatus.Loading}))
                                const result = await apiSingleton.statisticsApi.statisticsExportToGoogleSheets(
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
                            }
                        >
                            Сохранить
                        </LoadingButton>
                    }
                    <Button variant="text" color="inherit" type="button"
                            onClick={props.onCancellation}>
                        Отмена
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ExportToGoogle;
