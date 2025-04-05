import React, {useState, useEffect} from 'react';
import Utils from "../../services/Utils";
import {Tooltip, Checkbox, TextField, Grid, FormControlLabel} from '@mui/material/'

interface IDateFieldsProps {
    publicationDate: Date | undefined;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    autoCalculatedDeadline: Date | undefined;
    isDeadlineStrict: boolean;
    disabledPublicationDate?: boolean;
    onChange: (c: IDateFieldsState & { hasErrors: boolean }) => void;
}

interface IDateFieldsState {
    publicationDate: Date;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
}

const PublicationAndDeadlineDates: React.FC<IDateFieldsProps> = (props) => {
    const getInitialDeadlineDate = (publicationDate: Date) => {
        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000

        const deadlineDate = new Date(publicationDate.getTime() + twoWeeks)
        deadlineDate.setHours(23, 59, 0, 0)

        return deadlineDate
    }

    const getInitialPublicationDate = () => {
        const publicationDate = new Date(Date.now())
        publicationDate.setHours(0, 0, 0, 0)

        return publicationDate
    }

    const [state, setState] = useState<IDateFieldsState>(() => {
        const publicationDate =
            props.publicationDate && props.publicationDate.getTime() !== Utils.maxAllowedDate.getTime()
                ? props.publicationDate
                : getInitialPublicationDate()

        const deadlineDate =
            props.hasDeadline
                ? props.deadlineDate || props.autoCalculatedDeadline || getInitialDeadlineDate(publicationDate)
                : undefined

        return {
            hasDeadline: props.hasDeadline,
            publicationDate: publicationDate,
            deadlineDate: deadlineDate,
            isDeadlineStrict: props.isDeadlineStrict,
        }
    });

    const deadlineChosenAutomatically =
        props.autoCalculatedDeadline && state.deadlineDate === props.autoCalculatedDeadline

    const isDeadlineSoonerThanPublication = (publicationDate: Date, deadlineDate: Date | undefined) =>
        deadlineDate != null && deadlineDate < publicationDate;

    const deadlineDateNotSet = state.hasDeadline && !state.deadlineDate
    const deadlineSoonerThanHomework = isDeadlineSoonerThanPublication(state.publicationDate, state.deadlineDate)

    useEffect(() => {
        const validationResult = deadlineDateNotSet || deadlineSoonerThanHomework

        props.onChange({...state, hasErrors: validationResult})
    }, [state])

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            deadlineDate: state.hasDeadline
                ? props.autoCalculatedDeadline || state.deadlineDate || getInitialDeadlineDate(prevState.publicationDate)
                : undefined,
        }))
    }, [props.autoCalculatedDeadline])

    return <div>
        <Grid container direction="column" style={{marginTop: "10px"}}>
            <Grid
                item
                container
                direction="row"
                alignItems="center"
                spacing={2}
            >
                <Grid item>
                    <TextField
                        size="small"
                        id="datetime-local"
                        label="Дата публикации"
                        type="datetime-local"
                        variant='standard'
                        disabled={props.disabledPublicationDate}
                        value={Utils.toISOString(state.publicationDate)}
                        onChange={(e) => {
                            const date = e.target.value !== ''
                                ? new Date(e.target.value)
                                : getInitialPublicationDate();

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
                    <FormControlLabel
                        label="Дедлайн"
                        control={
                            <Checkbox
                                color="primary"
                                checked={state.hasDeadline}
                                onChange={(e) => {
                                    const date = e.target.checked
                                        //TODO: unify
                                        ? props.deadlineDate || props.autoCalculatedDeadline || getInitialDeadlineDate(state.publicationDate)
                                        : undefined

                                    const strict = e.target.checked && props.isDeadlineStrict !== undefined
                                        ? props.isDeadlineStrict
                                        : false

                                    setState(prevState => ({
                                        ...prevState,
                                        hasDeadline: e.target.checked,
                                        deadlineDate: date,
                                        isDeadlineStrict: strict,
                                    }))
                                }}
                            />
                        }
                    />
                </Grid>
            </Grid>
            {state.hasDeadline && (
                <Grid
                    item
                    container
                    direction="row"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid item>
                        <TextField
                            size="small"
                            id="datetime-local"
                            label="Дедлайн задания"
                            type="datetime-local"
                            error={deadlineSoonerThanHomework}
                            helperText={deadlineSoonerThanHomework
                                ? "Дедлайн задания не может быть раньше даты публикации"
                                : deadlineChosenAutomatically
                                    ? "На основе дедлайнов предыдущих работ"
                                    : ""}
                            variant='standard'
                            value={Utils.toISOString(state.deadlineDate) ?? ''}
                            onChange={(e) => {
                                setState(prevState => ({
                                    ...prevState,
                                    deadlineDate: e.target.value === ''
                                        ? undefined
                                        : new Date(e.target.value)
                                }))
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </Grid>
                    <Tooltip placement={"right"} arrow title={"Можно ли отправлять решения после дедлайна"}>
                        <Grid item>
                            <FormControlLabel
                                label="Строгий"
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={state.isDeadlineStrict}
                                        onChange={(e) => {
                                            setState(prevState => ({
                                                ...prevState,
                                                isDeadlineStrict: e.target.checked,
                                            }))
                                        }}
                                    />
                                }
                            />
                        </Grid>
                    </Tooltip>
                </Grid>
            )}
        </Grid>
    </div>
};

export default PublicationAndDeadlineDates;
