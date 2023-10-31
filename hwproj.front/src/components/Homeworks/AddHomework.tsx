import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {Grid, TextField, Button, Checkbox, Typography, Tooltip, Link} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import {CreateTaskViewModel} from "../../api";
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
    tasks: CreateTaskViewModel[];
    added: boolean;
    publicationDate: Date;
    deadlineDate: Date | undefined;
    hasDeadline: boolean,
    isDeadlineStrict: boolean;
}

const AddHomework: React.FC<IAddHomeworkProps> = (props) => {
    const [addHomeworkState, setAddHomeworkState] = useState<IAddHomeworkState>({
        title: "",
        description: "",
        tasks: [{
            title: "",
            description: "",
            maxRating: 10,
            publicationDate: undefined,
            hasDeadline: false,
            deadlineDate: undefined,
            isDeadlineStrict: false,
        }],
        publicationDate: new Date(),
        hasDeadline: true,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        added: false,
    })

    const isSomeTaskSoonerThanHomework = addHomeworkState.tasks
        .some(t => t.publicationDate != undefined && t.publicationDate < addHomeworkState.publicationDate)

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await ApiSingleton.homeworksApi.apiHomeworksByCourseIdAddPost(props.id, addHomeworkState)
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
                                        homeworkPublicationDate={Utils.convertLocalDateToUTCDate(addHomeworkState.publicationDate!)}
                                        homeworkDeadlineDate={Utils.convertLocalDateToUTCDate(addHomeworkState.deadlineDate!)}
                                        homeworkHasDeadline={addHomeworkState.hasDeadline}
                                        homeworkIsDeadlineStrict={addHomeworkState.isDeadlineStrict}
                                        onChange={(state) => {
                                            addHomeworkState.tasks[index] = state

                                            setAddHomeworkState((prevState) => prevState)
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
                                    title: "",
                                    description: "",
                                    maxRating: 10,
                                    publicationDate: undefined,
                                    hasDeadline: false,
                                    deadlineDate: undefined,
                                    isDeadlineStrict: false,
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
                        disabled={isSomeTaskSoonerThanHomework}
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