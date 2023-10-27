import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Utils from "../../services/Utils";
import Checkbox from '@mui/material/Checkbox';
import {Alert, Grid} from "@mui/material";
import { HomeworkViewModel } from 'api';

interface IDateFieldsProps {
    homework: HomeworkViewModel;
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

    console.log(state)

    return (
        <div>
            <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Grid item>
                    <TextField
                        style={{marginTop: '16px'}}
                        size="small"
                        id="datetime-local"
                        label="Дата публикации"
                        type="datetime-local"
                        variant='standard'
                        value={state.publicationDate?.toISOString().substring(0, 16)}
                        onChange={(e) => {
                            const date = e.target.value === '' ? undefined : Utils.toMoscowDate(new Date(e.target.value))

                            setState(prevState => ({
                                ...prevState,
                                publicationDate: date
                            }))
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item>
                    <Alert sx={{padding: 0.2, borderRadius: 4, fontSize: 12}} severity="info">
                        {props.homework.publicationDate}
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
                    style={{ marginTop: '10px' }}
                >
                    <Grid item>
                        <TextField
                            size="small"
                            id="datetime-local"
                            label="Дедлайн задания"
                            type="datetime-local"
                            variant='standard'
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