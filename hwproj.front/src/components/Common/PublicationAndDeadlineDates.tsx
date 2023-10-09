import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';

interface DateFieldsProps {
    publicationDate: Date | undefined;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    onChange: (c: DateFieldsState) => void;
}

interface DateFieldsState {
    publicationDate: Date | undefined;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
}

const PublicationAndDeadlineDates: React.FC<DateFieldsProps> = (props) => {
    const [state, setState] = useState<DateFieldsState>({
        hasDeadline: props.hasDeadline,
        publicationDate: props.publicationDate,
        deadlineDate: props.deadlineDate,
        isDeadlineStrict: props.isDeadlineStrict,
    });

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
                        size="small"
                        id="datetime-local"
                        label="Дата публикации"
                        type="datetime-local"
                        variant='standard'
                        defaultValue={props.publicationDate?.toLocaleString("ru-RU")}
                        onChange={(e) => props.onChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid>
                    <label style={{ margin: 0, padding: 0 }}>
                        <Checkbox
                            color="primary"
                            onChange={(e) => {
                                props.onChange(state)
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
                            defaultValue={props.deadlineDate?.toLocaleString("ru-RU")}
                            onChange={(e) => props.onChange(state)}
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
                                onChange={(e) => props.onChange(state)}
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