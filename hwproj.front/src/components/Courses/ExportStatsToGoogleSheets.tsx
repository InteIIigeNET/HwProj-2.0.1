import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {Grid} from '@material-ui/core';
import {FC, useState} from "react";
import Snackbar from '@material-ui/core/Snackbar';
import { Alert } from '@material-ui/lab';

interface IExportStatsToGoogleSheetsProps {
    courseId: string
}


const ExportStatsToGoogleSheets : FC<IExportStatsToGoogleSheetsProps> = (props) => {

    const [sheetName, setSheetName] = useState('');
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [response, setResponse] = useState('');
    const [severity, setSeverity] = useState('' as SeverityState);
    const [open, setOpen] = useState(false);

    type SeverityState = "error" | "success" | "info" | "warning" | undefined;

    const handleSubmit = async (e: any) => {
            e.preventDefault();
            const backendResponse = await ApiSingleton.statisticsApi.apiStatisticsExportByCourseIdToSheetsPost(Number(props.courseId), spreadsheetId, sheetName);
            const objectResponse = await backendResponse.json();
            const toResponse = JSON.stringify(objectResponse.response);
            setSeverity(objectResponse.status as SeverityState)
            handleClick();
            await setSpreadsheetId('');

            await setSheetName('');
            await setResponse(toResponse);
    }


    const handleClick = () => {
        setOpen(true);
    };

    const handleShowForm = async (e: any) => {
        e.preventDefault();
        setShowForm(!showForm);
    }


    const handleClose = async (event: any, reason: any) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };


    return (
        <div style={{justifyContent: 'center'}}>
            { !showForm &&
                <div id="block1">
                    <form>
                        <Button onClick={handleShowForm}
                                size="small"
                                variant="contained"
                                color="primary"> Показать окно выгрузки курса
                        </Button>
                </form>
            </div>}

            <div id="block2" style={{  flexDirection:'row' }}>
                {showForm && (
                    <form onSubmit={e => handleSubmit(e)}>
                        <Grid>
                            <Grid>
                        <TextField
                            required
                            value={spreadsheetId}
                            label="Id таблицы"
                            variant="outlined"
                            size={"small"}
                            margin="normal"
                            onChange={e => {setSpreadsheetId(e.target.value)}}
                        />
                                </Grid>
                            <Grid>
                                <TextField
                                    value={sheetName}
                                    label="Название листа"
                                    variant="outlined"
                                    size={"small"}
                                    margin="normal"
                                    onChange={e => {setSheetName(e.target.value)}}
                                />
                            </Grid>
                            <Grid>
                        <Button type="submit"
                                size="small"
                                variant="contained"
                                color="primary">
                            Выгрузить курс
                        </Button>
                            </Grid>
                        </Grid>
                    </form>)}
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={(e) => setOpen(false)} severity={severity}>
                    {response}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ExportStatsToGoogleSheets
