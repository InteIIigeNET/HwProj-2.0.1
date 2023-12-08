import React, {useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Utils from "../../services/Utils";
import Checkbox from '@mui/material/Checkbox';
import {Grid} from "@mui/material";
import {Typography, Link, Tooltip, FormControlLabel, FormHelperText} from '@material-ui/core';
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
    const homeworkDeadlineDate = homework.deadlineDate == undefined ? undefined : new Date(homework.deadlineDate)

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

    const isDeadlineSoonerThanPublication = (taskPublicationDate: Date | undefined, taskDeadlineDate: Date | undefined) =>
    {
        if ((taskDeadlineDate || homeworkDeadlineDate) == undefined) return false

        return (taskDeadlineDate || homeworkDeadlineDate)! < (taskPublicationDate || homeworkPublicationDate)
    }

    const taskSoonerThanHomework = !!state.publicationDate && isTaskSoonerThanHomework(state.publicationDate)
    const deadlineSoonerThanPublication = (!!state.deadlineDate || !!homeworkDeadlineDate) && isDeadlineSoonerThanPublication(state.publicationDate, state.deadlineDate)

    const showDeadlineEdit = hasDeadline == undefined ? homework.hasDeadline : hasDeadline

    useEffect(() => {
        const validationResult =
            !!state.publicationDate && isTaskSoonerThanHomework(state.publicationDate) ||
            (!!state.deadlineDate || !!homeworkDeadlineDate) && isDeadlineSoonerThanPublication(state.publicationDate, state.deadlineDate)

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
        <Tooltip placement={"right"} arrow title={"Позволяет переопределить даты для задачи"}>
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
                        error={taskSoonerThanHomework || (deadlineSoonerThanPublication && hasDeadline === false)}
                        helperText={taskSoonerThanHomework
                            ? "Дата публикации задачи не может быть раньше домашней работы"
                            : (deadlineSoonerThanPublication && hasDeadline === false)
                                ? "Дата публикации задачи не может быть позже дедлайна"
                                : publicationDate !== undefined 
                                    ? `Было ${Utils.renderDateWithoutSeconds(homeworkPublicationDate)}` 
                                    : "\u200b"}
                        value={Utils.toISOString(state.publicationDate || homeworkPublicationDate)}
                        onChange={(e) => {
                            const valueDate = new Date(e.target.value)

                            const date = (e.target.value === '' || valueDate.valueOf() === homeworkPublicationDate?.valueOf()) ? undefined : valueDate
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
                            label='Дедлайн'
                            control={<Checkbox
                                checked={hasDeadline ?? homework.hasDeadline}
                                onChange={(_) => {
                                    setState(prevState => ({
                                        ...prevState,
                                        deadlineDate: undefined,
                                        isDeadlineStrict: undefined,
                                        hasDeadline: hasDeadline == undefined ? !homework.hasDeadline : undefined,
                                    }))
                                }}
                            />}
                        />
                    <FormHelperText style={{ marginTop: '-1px' }}>
                        {hasDeadline != undefined 
                            ? hasDeadline
                                ? 'Было без дедлайна'
                                : 'Был с дедлайном'
                            : "\u200b"}
                    </FormHelperText>
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
                            error={deadlineSoonerThanPublication}
                            helperText={deadlineSoonerThanPublication ? "Дедлайн задачи не может быть раньше даты публикации" :
                                deadlineDate != undefined 
                                    ? props.homework.hasDeadline
                                        ? `Было ${Utils.renderDateWithoutSeconds(props.homework.deadlineDate!)}`
                                        : `Было без дедлайна`
                                    : "\u200b"}
                            required={!homework.deadlineDate && !deadlineDate}
                            value={Utils.toISOString((deadlineDate || homeworkDeadlineDate)) ?? ''}
                            onChange={(e) => {
                                const valueDate = new Date(e.target.value)

                                const date = (e.target.value === '' || valueDate.valueOf() === homeworkDeadlineDate?.valueOf()) ? undefined : valueDate
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
                    <Tooltip placement={"right"} arrow title={"Можно ли отправлять решения после дедлайна"}>
                        <Grid item>
                            <FormControlLabel
                                label="Строгий"
                                control={<Checkbox
                                    checked={isDeadlineStrict == undefined ? homework.isDeadlineStrict : isDeadlineStrict}
                                    onChange={(_) => {
                                        setState(prevState => ({
                                            ...prevState,
                                            isDeadlineStrict: isDeadlineStrict == undefined ? !homework.isDeadlineStrict : undefined,
                                        }))
                                    }}
                                />}
                            />
                            <FormHelperText style={{ marginTop: '-1px' }}>
                                {isDeadlineStrict != undefined
                                    ? isDeadlineStrict
                                        ? 'Был нестрогий'
                                        : 'Был строгий'
                                    : "\u200b"}
                            </FormHelperText>
                        </Grid>
                    </Tooltip>
                </Grid>}
        </Grid>}
    </div>;
};

export default TaskPublicationAndDeadlineDates;
