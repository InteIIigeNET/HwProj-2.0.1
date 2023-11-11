import React, {useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Utils from "../../services/Utils";
import Checkbox from '@mui/material/Checkbox';
import {Grid} from "@mui/material";
import {Typography, Link, Tooltip} from '@material-ui/core';
import {HomeworkViewModel} from 'api';

interface IDateFieldsProps {
    homework: HomeworkViewModel;
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    disabledPublicationDate?: boolean;
    onChange: (c: IDateFieldsState & { hasErrors: boolean }) => void;
}

interface IDateFieldsState {
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
}

const TaskPublicationAndDeadlineDates: React.FC<IDateFieldsProps> = (props) => {
    const {homework} = props
    const homeworkPublicationDate = new Date(homework.publicationDate!)

    const [state, setState] = useState<IDateFieldsState>({
        hasDeadline: props.hasDeadline,
        publicationDate: props.publicationDate,
        deadlineDate: props.deadlineDate,
        isDeadlineStrict: props.isDeadlineStrict,
    });

    const [showDates, setShowDates] = useState<boolean>(
        props.deadlineDate != undefined
        || props.hasDeadline != undefined
        || props.isDeadlineStrict != undefined
        || props.publicationDate != undefined)

    const {publicationDate, isDeadlineStrict, deadlineDate, hasDeadline} = state

    const isTaskSoonerThanHomework = (taskPublicationDate: Date) =>
        taskPublicationDate < homeworkPublicationDate

    const isDeadlineSoonerThanPublication = (taskPublicationDate: Date | undefined, taskDeadlineDate: Date) =>
        taskDeadlineDate != undefined && taskDeadlineDate < (taskPublicationDate || homeworkPublicationDate)

    const taskSoonerThanHomework = !!state.publicationDate && isTaskSoonerThanHomework(state.publicationDate)
    const deadlineSoonerThanPublication = !!state.deadlineDate && isDeadlineSoonerThanPublication(state.publicationDate, state.deadlineDate)
    const showDeadlineEdit = hasDeadline == undefined ? homework.hasDeadline : hasDeadline

    useEffect(() => {
        const validationResult =
            !!state.publicationDate && isTaskSoonerThanHomework(state.publicationDate) ||
            !!state.deadlineDate && isDeadlineSoonerThanPublication(state.publicationDate, state.deadlineDate)

        props.onChange({...state, hasErrors: validationResult})
    }, [state])

    useEffect(() => {
        setState(prevState => ({
            hasDeadline: homework.hasDeadline === prevState.hasDeadline ? undefined : prevState.hasDeadline,
            publicationDate: homework.publicationDate === prevState.publicationDate ? undefined : prevState.publicationDate,
            deadlineDate: homework.deadlineDate === prevState.deadlineDate ? undefined : prevState.deadlineDate,
            isDeadlineStrict: homework.isDeadlineStrict === prevState.isDeadlineStrict ? undefined : prevState.isDeadlineStrict
        }));
    }, [homework.publicationDate, homework.deadlineDate, homework.hasDeadline, homework.isDeadlineStrict])

    return <div>
        <Tooltip arrow title={"Позволяет переопределить даты для задачи"}>
            <Typography variant={"caption"} style={{fontSize: "14px", cursor: "pointer"}}>
                <Link onClick={() => {
                    setState((prevState) => ({
                        ...prevState,
                        hasDeadline: undefined,
                        deadlineDate: undefined,
                        isDeadlineStrict: undefined,
                        publicationDate: undefined,
                    }))

                    setShowDates(!showDates)
                }}>
                    {showDates ? "Оставить обычные даты" : "Нужны особые даты?"}
                </Link>
            </Typography>
        </Tooltip>
        {showDates && <Grid container direction={"column"} style={{marginTop: "10px"}}>
            <Grid
                item
                container
                direction="row"
                spacing={2}
                alignContent="center"
            >
                <Grid item>
                    <TextField
                        size="small"
                        id="datetime-local"
                        label="Дата публикации"
                        type="datetime-local"
                        variant='standard'
                        disabled={props.disabledPublicationDate}
                        error={taskSoonerThanHomework}
                        color={publicationDate && "warning"}
                        helperText={taskSoonerThanHomework
                            ? "Дата публикации задачи не может быть раньше домашней работы"
                            : publicationDate !== undefined ? `Было ${new Date(props.homework.publicationDate!).toLocaleString("ru-RU")}` : ""}
                        value={Utils.convertUTCDateToLocalDate(state.publicationDate || props.homework.publicationDate!)?.toISOString().substring(0, 16)}
                        onChange={(e) => {
                            const date = e.target.value === '' ? undefined : new Date(e.target.value)
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
                    <label>
                        <Checkbox
                            color={hasDeadline === undefined ? "primary" : "warning"}
                            checked={hasDeadline === undefined ? homework.hasDeadline : hasDeadline}
                            onChange={(_) => {
                                setState(prevState => ({
                                    ...prevState,
                                    hasDeadline: hasDeadline === undefined ? !homework.hasDeadline : undefined,
                                }))
                            }}
                        />
                        Дедлайн
                    </label>
                </Grid>
            </Grid>
            {showDeadlineEdit &&
                <Grid
                    item
                    container
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >
                    <Grid item>
                        <TextField
                            size="small"
                            id="datetime-local"
                            label="Дедлайн задания"
                            type="datetime-local"
                            variant="standard"
                            color={deadlineDate !== undefined ? "warning" : undefined}
                            error={deadlineSoonerThanPublication}
                            helperText={deadlineSoonerThanPublication ? "Дедлайн задачи не может быть раньше даты публикации" :
                                deadlineDate !== undefined ? `Было ${new Date(props.homework.publicationDate!).toLocaleString("ru-RU")}` : ""}
                            required={!homework.deadlineDate && !deadlineDate}
                            value={Utils.convertUTCDateToLocalDate(deadlineDate || homework.deadlineDate)?.toISOString().substring(0, 16) ?? ''}
                            onChange={(e) => {
                                const date = e.target.value === '' ? undefined : new Date(e.target.value)
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
                        <label style={{margin: 0, padding: 0}}>
                            <Checkbox
                                color={isDeadlineStrict === undefined ? "primary" : "warning"}
                                checked={isDeadlineStrict === undefined ? homework.isDeadlineStrict : isDeadlineStrict}
                                onChange={(_) => {
                                    setState(prevState => ({
                                        ...prevState,
                                        isDeadlineStrict: isDeadlineStrict === undefined ? !homework.isDeadlineStrict : undefined,
                                    }))
                                }}
                            />
                            Строгий
                        </label>
                    </Grid>
                </Grid>}
        </Grid>}
    </div>;
};

export default TaskPublicationAndDeadlineDates;
