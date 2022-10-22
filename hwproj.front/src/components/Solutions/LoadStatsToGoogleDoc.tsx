import React, {FC, useState} from "react";
import {Alert, Button, Grid, MenuItem, Select, TextField} from "@mui/material";
import {ResultString} from "../../api";
import apiSingleton from "../../api/ApiSingleton";

interface LoadStatsToGoogleDocProps {
}

interface LoadStatsToGoogleDocState {
    googleDocUrl: string,
    sheetTitles: ResultString | undefined,
    selectedSheet: number,
    isOpened: boolean
}

const LoadStatsToGoogleDoc: FC<LoadStatsToGoogleDocProps> = (props) => {
    const [state, setState] = useState<LoadStatsToGoogleDocState>({
        selectedSheet: 0,
        isOpened: false,
        googleDocUrl: "",
        sheetTitles: undefined
    })

    const {googleDocUrl, sheetTitles, isOpened, selectedSheet} = state

    //TODO: throttling
    const handleGoogleDocUrlChange = async (value: string) => {
        const titles = value === ""
            ? undefined
            : await apiSingleton.statisticsApi.apiStatisticsGetSheetTitlesPost({url: value})
        setState(prevState => ({...prevState, googleDocUrl: value, sheetTitles: titles}));
    }

    return !isOpened
        ? <Button variant="text" color="primary" type="button"
                  onClick={() => setState(prevState => ({...prevState, isOpened: true}))}>
            Загрузить
        </Button>
        : <Grid container spacing={1} style={{marginTop: 15}}>
            <Grid item>
                <Alert severity="info" variant={"standard"}>
                    Для загрузки таблицы необходимо разрешить доступ на редактирование по ссылке для Google Docs
                    страницы
                </Alert>
            </Grid>
            <Grid container item spacing={1} alignItems={"center"}>
                <Grid item>
                    <TextField size={"small"} fullWidth label={"Ссылка на Google Docs"} value={googleDocUrl}
                               onChange={event => {
                                   event.persist()
                                   handleGoogleDocUrlChange(event.target.value)
                               }}/>
                </Grid>
                {sheetTitles && !sheetTitles.succeeded && <Grid item>
                    <Alert severity="error">
                        {sheetTitles!.errors![0]}
                    </Alert>
                </Grid>}
                {sheetTitles && sheetTitles.value && sheetTitles.value.length > 0 && <Grid item>
                    <Select
                        size={"small"}
                        id="demo-simple-select"
                        label="Sheet"
                        value={selectedSheet}
                        onChange={v => setState(prevState => ({...prevState, selectedSheet: +v.target.value}))}
                    >
                        {sheetTitles.value.map((title, i) => <MenuItem value={i}>{title}</MenuItem>)}
                    </Select>
                </Grid>}
                {sheetTitles && sheetTitles.succeeded && <Grid item>
                    <Button variant="text" color="primary" type="button">
                        Загрузить
                    </Button>
                </Grid>}
                {<Grid item>
                    <Button variant="text" color="primary" type="button"
                            onClick={() => setState(prevState => ({...prevState, isOpened: false}))}>
                        Отмена
                    </Button>
                </Grid>}
            </Grid>
        </Grid>
}
export default LoadStatsToGoogleDoc;
