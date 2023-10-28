import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Utils from "../../services/Utils";
import Checkbox from '@mui/material/Checkbox';
import {Alert, Grid} from "@mui/material";
import { Typography } from '@material-ui/core';
import Homework from 'components/Homeworks/Homework';

interface IDateFieldsProps {
    homeworkPublicationDate: Date;
    homeworkHasDeadline: boolean;
    homeworkDeadlineDate: Date | undefined;
    homeworkIsDeadlineStrict: boolean;
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    onChange: (c: IDateFieldsState) => void;
}

interface IDateFieldsState {
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
}

const TaskPublicationAndDeadlineDates: React.FC<IDateFieldsProps> = (props) => {
    const [state, setState] = useState<IDateFieldsState>({
        hasDeadline: props.hasDeadline,
        publicationDate: props.publicationDate ,
        deadlineDate: props.deadlineDate,
        isDeadlineStrict: props.isDeadlineStrict,
    });

    useEffect(() => {
        props.onChange(state)
    }, [state])

    const getInitialDeadlineDate = (publicationDate: Date | undefined) => {
        if (publicationDate == undefined)
            return undefined
        
        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000

        const deadlineDate = new Date(publicationDate.getTime() + twoWeeks)
        deadlineDate.setHours(23, 59, 0, 0)

        return Utils.toMoscowDate(deadlineDate)
    }

    const getStyle = (obj: any) =>
    {
        return obj == undefined ? {fontSize: 13} : {textDecoration: "underline", fontSize: 13}
    }

    const homeworkPublicationDate = new Date(props.homeworkPublicationDate!)

    const isDateSoonerThanHomework = (newDate: Date | string) => {
        return newDate != undefined 
            && (Utils.convertLocalDateToUTCDate(new Date(newDate)) < homeworkPublicationDate)
    }

    const isTaskSoonerThanHomework = isDateSoonerThanHomework(state.publicationDate!)

    return (
        <div>
            <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                marginTop="10px"
            >
                <Grid item>
                    <TextField
                        size="small"
                        id="datetime-local"
                        label="Дата публикации"
                        type="datetime-local"
                        variant='standard'
                        style={{marginTop: "10px"}}
                        error={isTaskSoonerThanHomework}
                        helperText={isTaskSoonerThanHomework ? 'Публикация задачи раньше ДЗ' : ' '}
                        value={state.publicationDate?.toISOString().substring(0, 16)}
                        onChange={(e) => {
                            const date = e.target.value === '' ? undefined : Utils.toMoscowDate(new Date(e.target.value))
                            const isErrorState = isDateSoonerThanHomework(e.target.value)

                            setState(prevState => ({
                                ...prevState,
                                publicationDate: date,
                                hasError: isErrorState,
                            }))
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item>
                    <Alert sx={{borderRadius: 3, fontSize: 11}} severity={isTaskSoonerThanHomework ? "error" : state.publicationDate == undefined ? "info" : "warning"}>
                        <Typography display="inline" style={getStyle(state.publicationDate)}>
                            {new Date(props.homeworkPublicationDate).toLocaleString("ru-RU") + " "}
                        </Typography>
                    </Alert>
                </Grid>
                <Grid item>
                    <Alert sx={{borderRadius: 3, fontSize: 11}} severity={state.hasDeadline == undefined ? "info" : "warning"}>
                        <Typography display="inline" style={getStyle(state.hasDeadline)}>
                            {props.homeworkHasDeadline ? "С дедлайном" : "Без дедлайна"}
                        </Typography>
                    </Alert>
                </Grid>
                <Grid item>
                    <label style={{ margin: 0, padding: 0 }}>
                        <Checkbox
                            color="primary"
                            checked={state.hasDeadline == undefined ? false : !state.hasDeadline}
                            onChange={(e) => {
                                setState(prevState => ({
                                    ...prevState,
                                    hasDeadline: e.target.checked ? false : undefined,
                                    deadlineDate: undefined,
                                }))
                            }}
                        />
                        Без дедлайна
                    </label>
                
                    <label style={{ margin: 0, padding: 0 }}>
                        <Checkbox
                            color="primary"
                            checked={state.hasDeadline ?? false}
                            onChange={(e) => {
                                const date = e.target.checked && state.deadlineDate != undefined
                                    ? getInitialDeadlineDate(state.publicationDate) 
                                    : undefined
                                
                                setState(prevState => ({
                                    ...prevState,
                                    hasDeadline: e.target.checked ? true : undefined,
                                    deadlineDate: date,
                                }))    
                            }}
                        />
                        Добавить дедлайн
                    </label>
                </Grid>
            </Grid>
            
                <Grid
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ marginTop: '16px' }}
                >
                    <Grid item>
                        <TextField
                            size="small"
                            id="datetime-local"
                            label="Дедлайн задания"
                            type="datetime-local"
                            variant="standard"
                            required={state.hasDeadline}
                            value={state.deadlineDate?.toISOString().substring(0, 16) ?? ''}
                            disabled={!state.hasDeadline}
                            onChange={(e) => {
                                const date = e.target.value === '' ? undefined : Utils.toMoscowDate(new Date(e.target.value))
                                
                                setState(prevState => ({
                                    ...prevState,
                                    deadlineDate: date
                                }))
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Alert sx={{borderRadius: 3}} severity={state.deadlineDate == undefined ? "info" : "warning"}>
                            <Typography display="inline" style={getStyle(state.deadlineDate)}>
                                {new Date(props.homeworkPublicationDate).toLocaleString("ru-RU") + " "}
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item>
                        <Alert sx={{borderRadius: 3}} severity={state.isDeadlineStrict == undefined ? "info" : "warning"}>
                            <Typography display="inline" style={getStyle(state.isDeadlineStrict)}>
                                {props.homeworkHasDeadline ? "Строгий" : "Нестрогий"}
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item>
                        <label style={{ margin: 0, padding: 0 }}>
                            <Checkbox
                                color="primary"
                                checked={state.isDeadlineStrict == undefined ? false : !state.isDeadlineStrict}
                                onChange={(e) => {
                                    setState(prevState => ({
                                    ...prevState,
                                    isDeadlineStrict: e.target.checked ? false : undefined,
                                }))
                            }}
                            />
                            Разрешить /
                        </label>

                        <label style={{ margin: 0, padding: 0 }}>
                            <Checkbox
                                color="primary"
                                checked={state.isDeadlineStrict ?? false}
                                onChange={(e) => {
                                    const isDeadlineStrict = e.target.checked ? true : undefined

                                    setState(prevState => ({
                                    ...prevState,
                                    isDeadlineStrict: isDeadlineStrict,
                                }))
                            }}
                            />
                            Запретить отправку решений после дедлайна
                        </label>
                    </Grid>
                </Grid>
        </div>
    );
};

export default TaskPublicationAndDeadlineDates;