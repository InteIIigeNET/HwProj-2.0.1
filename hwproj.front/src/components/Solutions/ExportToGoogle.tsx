import { FC, useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    MenuItem,
    TextField,
} from "@mui/material";
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
    loadingSheets: boolean
    exportStatus: LoadingStatus
    error: string | null
}

const ExportToGoogle: FC<ExportToGoogleProps> = (props: ExportToGoogleProps) => {
    const [state, setState] = useState<ExportToGoogleState>({
        url: "",
        googleSheetTitles: undefined,
        selectedSheet: 0,
        loadingSheets: false,
        exportStatus: LoadingStatus.None,
        error: null
    })

    const {url, googleSheetTitles, selectedSheet, loadingSheets, exportStatus, error } = state

    const handleGoogleDocUrlChange = (value: string) => {
        setState(prevState => ({ ...prevState, url: value, loadingSheets: true }))
        if (value)
            apiSingleton.statisticsApi.statisticsGetSheetTitles(value)
            .then(response => setState(prevState => ({
                ...prevState,
                googleSheetTitles: response,
                loadingSheets: false,
            })))
        else
            setState(prevState => ({
                ...prevState,
                googleSheetTitles: undefined,
                loadingSheets: false,
            }))
    }

    const getGoogleSheetName = () => {
        return (googleSheetTitles && googleSheetTitles.value
            && googleSheetTitles.value.length > state.selectedSheet)
            ? googleSheetTitles.value[state.selectedSheet] : "";
    }

    const buttonSx = {
        ...(exportStatus === LoadingStatus.Success && {
            color: green[600],
        }),
        ...(exportStatus === LoadingStatus.Error && {
            color: red[600],
        }),
    };

    return (
        <DialogContent>
            <DialogContentText>
                <Grid item>
                    {(googleSheetTitles && !googleSheetTitles.succeeded &&
                        <Alert severity="error">
                            {googleSheetTitles!.errors![0]}
                        </Alert>
                    ) || (exportStatus === LoadingStatus.Error &&
                        <Alert severity="error">
                            {error}
                        </Alert>
                    ) || (
                        <Alert severity="info" variant="standard">
                            Для загрузки таблицы необходимо разрешить доступ
                            на редактирование по ссылке для Google Sheets
                        </Alert>
                    )}
                </Grid>
            </DialogContentText>
            <DialogActions style={{ padding: 0, marginTop: 12 }}>
                <Grid item xs={true}>
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
                {loadingSheets &&
                    <Grid item>
                        <CircularProgress size={28}/>
                    </Grid>
                }
                {!loadingSheets && googleSheetTitles && googleSheetTitles.value && googleSheetTitles.value.length > 0 &&
                    <Grid item>
                        <TextField
                            select
                            size="small"
                            id="demo-simple-select"
                            label="Лист"
                            value={selectedSheet}
                            onChange={v => setState(prevState => ({ ...prevState, selectedSheet: +v.target.value }))}
                        >
                            {googleSheetTitles.value.map((title, i) => <MenuItem value={i}>{title}</MenuItem>)}
                        </TextField>
                    </Grid>
                }
                {!loadingSheets && googleSheetTitles && googleSheetTitles.succeeded &&
                    <Grid item>
                        <LoadingButton
                            variant="text"
                            color="primary"
                            type="button"
                            sx={buttonSx}
                            loading={exportStatus === LoadingStatus.Loading}
                            onClick={async () => {
                                setState((prevState) => ({...prevState, exportStatus: LoadingStatus.Loading}))
                                const result = await apiSingleton.statisticsApi.statisticsExportToGoogleSheets(
                                    props.courseId,
                                    url,
                                    getGoogleSheetName())
                                setState((prevState) =>
                                    ({...prevState,
                                        exportStatus: result.succeeded ? LoadingStatus.Success : LoadingStatus.Error,
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
                    </Grid>
                }
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

export default ExportToGoogle;
