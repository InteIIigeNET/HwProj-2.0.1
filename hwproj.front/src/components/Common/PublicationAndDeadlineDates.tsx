import React, { useState, useEffect} from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Utils from "../../services/Utils";
import Checkbox from '@mui/material/Checkbox';

interface IDateFieldsProps {
    publicationDate: Date | undefined;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    onChange: (c: IDateFieldsState) => void;
}

interface IDateFieldsState {
    publicationDate: Date;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
}

const PublicationAndDeadlineDates: React.FC<IDateFieldsProps> = (props) => {
    const [state, setState] = useState<IDateFieldsState>({
        hasDeadline: false,
        publicationDate: new Date(),
        deadlineDate: undefined,
        isDeadlineStrict: false,
    });

    useEffect(() => {
        props.onChange(state)
    }, [state])

    useEffect(() => setInitialState(), [])

    const getInitialDeadlineDate = (publicationDate: Date) => {
        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000

        const deadlineDate = new Date(publicationDate.getTime() + twoWeeks)
        deadlineDate.setHours(23, 59, 0, 0)

        return Utils.toMoscowDate(deadlineDate)
    }

    const getInitialPublicationDate = () => {
        const now = Date.now()

        const publicationDate = new Date(Date.now())
        publicationDate.setHours(0, 0, 0, 0)

        return Utils.toMoscowDate(publicationDate)
    }

    const setInitialState = () => {
        const publicationDate = props.publicationDate == undefined
            ? getInitialPublicationDate()
            : props.publicationDate 

        const deadlineDate = props.hasDeadline
            ? props.deadlineDate == undefined 
                ? getInitialDeadlineDate(publicationDate) 
                : props.deadlineDate
            : undefined
        
        setState({
            hasDeadline: props.hasDeadline,
            isDeadlineStrict: props.isDeadlineStrict,
            publicationDate: publicationDate,
            deadlineDate: deadlineDate
        })
    }

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
                            let date = new Date(e.target.value)
                            date = Utils.toMoscowDate(date)
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
                <Grid>
                    <label style={{ margin: 0, padding: 0 }}>
                        <Checkbox
                            color="primary"
                            checked={state.hasDeadline}
                            onChange={(e) => {
                                const date = e.target.checked
                                    ? props.deadlineDate == undefined 
                                        ? getInitialDeadlineDate(state.publicationDate) 
                                        : props.deadlineDate
                                    : undefined

                                setState(prevState => ({
                                    ...prevState,
                                    hasDeadline: e.target.checked,
                                    deadlineDate: date,
                                }))
                            }}
                        />
                        Добавить дедлайн
                    </label>
                </Grid>
            </Grid>
            {state.hasDeadline && (
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
                            value={state.deadlineDate?.toISOString().substring(0, 16)}
                            onChange={(e) => {
                                let date = new Date(e.target.value)
                                date = Utils.toMoscowDate(date)
                                setState(prevState => ({
                                    ...prevState,
                                    deadlineDate: date
                                }))
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </Grid>
                    <Grid item>
                        <label style={{ margin: 0, padding: 0 }}>
                            <Checkbox
                                color="primary"
                                onChange={(e) => {
                                    setState(prevState => ({
                                    ...prevState,
                                    isDeadlineStrict: e.target.checked,
                                }))
                            }}
                            />
                            Запретить отправку решений после дедлайна
                        </label>
                    </Grid>
                </Grid>
            )}
        </div>
    );
};

export default PublicationAndDeadlineDates;