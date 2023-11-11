import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid, TextField, Button, Checkbox, Typography, Tooltip, Link} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import {CreateHomeworkViewModel, CreateTaskViewModel} from "../../api";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import CreateTask from "../Tasks/CreateTask"
import Utils from "../../services/Utils";

interface IAddHomeworkProps {
    id: number;
    onSubmit: () => void;
    onCancel: () => void;
}

interface IAddHomeworkState {
    title: string;
    description: string;
    tasks: IAddHomeworkTaskState[];
    added: boolean;
    publicationDate: Date;
    deadlineDate: Date | undefined;
    hasDeadline: boolean,
    isDeadlineStrict: boolean;
}

interface IAddHomeworkTaskState {
    task : CreateTaskViewModel;
    hasErrors: boolean;
}

const AddHomework: React.FC<IAddHomeworkProps> = (props) => {
    const [addHomeworkState, setAddHomeworkState] = useState<IAddHomeworkState>({
        title: "",
        description: "",
        tasks: [{
            task: {
                title: "",
                description: "",
                maxRating: 10,
                publicationDate: undefined,
                hasDeadline: false,
                deadlineDate: undefined,
                isDeadlineStrict: false,
            },
            hasErrors: false,
        }],
        publicationDate: new Date(),
        hasDeadline: true,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        added: false,
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const tasks: CreateTaskViewModel[] = addHomeworkState.tasks.map(t => ({
            ...t.task,
            publicationDate: Utils.convertUTCDateToLocalDate(t.task.publicationDate),
            deadlineDate: Utils.convertUTCDateToLocalDate(t.task.deadlineDate),
        }));

        const addHomework: CreateHomeworkViewModel = {
            ...addHomeworkState,
            tasks: tasks,
            publicationDate: Utils.convertUTCDateToLocalDate(addHomeworkState.publicationDate),
            deadlineDate: Utils.convertUTCDateToLocalDate(addHomeworkState.deadlineDate),
        }

        await ApiSingleton.homeworksApi.apiHomeworksByCourseIdAddPost(props.id, addHomework)
        setAddHomeworkState((prevState) => ({
            ...prevState,
            added: true
        }))
        props.onSubmit()
    }

    return (
        <div>
            <form onSubmit={(e) => handleSubmit(e)} style={{maxWidth: "100%"}}>
                <TextField
                    size="small"
                    required
                    label="Название"
                    variant="outlined"
                    margin="normal"
                    name={addHomeworkState.title}
                    onChange={(e) => {
                        e.persist()
                        setAddHomeworkState((prevState) => ({
                        ...prevState,
                        title: e.target.value}))}
                    }
                />
                <TextFieldWithPreview
                    multiline
                    fullWidth
                    minRows={4}
                    maxRows="20"
                    label="Описание"
                    variant="outlined"
                    margin="normal"
                    value={addHomeworkState.description}
                    onChange={(e) => {
                        e.persist()
                        setAddHomeworkState((prevState) => ({
                        ...prevState,
                        description: e.target.value}))}
                    }
                />
                <PublicationAndDeadlineDates 
                    hasDeadline={false}
                    isDeadlineStrict={false}
                    publicationDate={undefined}
                    deadlineDate={undefined}
                    onChange={(state) => setAddHomeworkState((prevState) => ({
                        ...prevState,
                        hasDeadline: state.hasDeadline,
                        isDeadlineStrict: state.isDeadlineStrict,
                        publicationDate: state.publicationDate,
                        deadlineDate: state.deadlineDate
                    }))}
                />
                <div>
                    <ol>
                        {addHomeworkState.tasks.map((task, index) => (
                            <Grid container style={{marginTop: "15px"}} xs={12}>
                                <li key={index} style={{width: "100vw"}}>
                                    <Typography variant="subtitle2" style={{fontSize: "1rem"}}>
                                        Задача
                                    </Typography>
                                    <Grid item>
                                        <Button
                                            style={{marginTop: "10px"}}
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                setAddHomeworkState((prevState) => ({
                                                    ...prevState,
                                                    tasks: addHomeworkState.tasks.slice(
                                                        0,
                                                        addHomeworkState.tasks.length - 1
                                                    ),
                                                }))
                                            }
                                        >
                                            Убрать задачу
                                        </Button>
                                    </Grid>
                                    <CreateTask
                                        homework={{...addHomeworkState, tasks: addHomeworkState.tasks.map(t => t.task)}}
                                        onChange={(state) => {
                                            addHomeworkState.tasks[index].task = state
                                            addHomeworkState.tasks[index].hasErrors = state.hasErrors

                                            setAddHomeworkState((prevState) => ({
                                                ...prevState,

                                            }))
                                        }}
                                     />
                                </li>
                            </Grid>
                        ))}
                    </ol>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            setAddHomeworkState((prevState) => ({
                                ...prevState,
                                tasks: [...addHomeworkState.tasks, {
                                    task: {
                                        title: "",
                                        description: "",
                                        maxRating: 10,
                                        publicationDate: undefined,
                                        hasDeadline: false,
                                        deadlineDate: undefined,
                                        isDeadlineStrict: false,
                                    },
                                    hasErrors: false,
                                }],
                            }))
                        }
                    >
                        Ещё задачу
                    </Button>
                </div>
                <Grid container style={{marginTop: "15px", marginBottom: 15}}>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={addHomeworkState.tasks.some(t => t.hasErrors)}
                    >
                        Добавить домашнее задание
                    </Button>
                    &nbsp;
                    <Button
                        onClick={() => props.onCancel()}
                        size="small"
                        variant="contained"
                        color="primary"
                    >
                        Отменить
                    </Button>
                </Grid>
            </form>
        </div>
    );
}

export default AddHomework