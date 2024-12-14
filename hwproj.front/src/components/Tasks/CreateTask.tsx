import * as React from "react";
import {FC, useEffect, useState} from "react";
import {Grid, TextField} from "@material-ui/core";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";
import {HomeworkViewModel} from 'api';
import {MarkdownEditor} from "../Common/MarkdownEditor";

interface ICreateTaskProps {
    homework: HomeworkViewModel;
    onChange: (c: ICreateTaskState) => void
}

interface ICreateTaskState {
    title: string
    description: string;
    maxRating: number;
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    hasErrors: boolean;
}

const CreateTask: FC<ICreateTaskProps> = (props) => {
    const [createTaskState, setCreateTaskState] = useState<ICreateTaskState>({
        title: "",
        description: "",
        maxRating: 10,
        publicationDate: undefined,
        hasDeadline: false,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        hasErrors: false,
    })

    useEffect(() => props.onChange(createTaskState), [createTaskState])

    return (
        <Grid style={{width: "100%"}}>
            <Grid container>
                <div style={{marginRight: '10px'}}>
                    <TextField
                        size="small"
                        required
                        label="Название задачи"
                        variant="outlined"
                        margin="normal"
                        value={createTaskState.title}
                        onChange={(e) => {
                            e.persist()
                            setCreateTaskState((prevState) => ({
                                ...prevState,
                                title: e.target.value,
                            }))
                        }}
                    />
                </div>
                <TextField
                    size="small"
                    required
                    label="Баллы"
                    variant="outlined"
                    type="number"
                    margin="normal"
                    value={createTaskState.maxRating}
                    onChange={(e) => {
                        e.persist()
                        setCreateTaskState((prevState) => ({
                            ...prevState,
                            maxRating: +e.target.value,
                        }))
                    }}
                />
            </Grid>
            <div style={{marginBottom: -3, marginTop: -5}}>
                <MarkdownEditor
                    label={"Условие задачи"}
                    height={240}
                    maxHeight={400}
                    value={createTaskState.description}
                    onChange={(value) => {
                        setCreateTaskState((prevState) => ({
                            ...prevState,
                            description: value,
                        }))
                    }}
                />
            </div>
            <TaskPublicationAndDeadlineDates
                hasDeadline={undefined}
                isDeadlineStrict={undefined}
                publicationDate={undefined}
                deadlineDate={undefined}
                homework={props.homework}
                onChange={(data) =>
                    setCreateTaskState((prevState) => ({
                        ...prevState,
                        hasDeadline: data.hasDeadline,
                        isDeadlineStrict: data.isDeadlineStrict,
                        publicationDate: data.publicationDate,
                        deadlineDate: data.deadlineDate,
                        hasErrors: data.hasErrors,
                    }))}
            />
        </Grid>
    )
}

export default CreateTask
