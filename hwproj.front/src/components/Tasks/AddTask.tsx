import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import Utils from "../../services/Utils";
import {FC, useEffect, useState} from "react";
import {Grid, Checkbox, Button, TextField, Typography, Tooltip, Link} from "@material-ui/core";
import CreateTask from "./CreateTask";
import {HomeworkViewModel, CreateTaskViewModel} from "../../api";

interface IAddTaskProps {
    homework: HomeworkViewModel;
    onAdding: () => void;
    onCancel: () => void;
    update: () => void;
}

interface IAddTaskState {
    title: string
    description: string;
    maxRating: number;
    publicationDate: Date | undefined;
    hasDeadline: boolean | undefined;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean | undefined;
    hasErrors: boolean;
}

const AddTask: React.FC<IAddTaskProps> = (props) => {
    const [state, setTaskState] = useState<IAddTaskState>({
        title: "",
        description: "",
        maxRating: 10,
        publicationDate: undefined,
        hasDeadline: false,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        hasErrors: false,
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const addHomework: CreateTaskViewModel = {
            ...state,
            homeworkId: props.homework.id!,
            publicationDate: Utils.convertUTCDateToLocalDate(state.publicationDate),
            deadlineDate: Utils.convertUTCDateToLocalDate(state.deadlineDate),
        }

        await ApiSingleton.tasksApi.apiTasksAddPost(addHomework);
        props.onAdding()
    }

    return (
        <div>
            <Typography variant="subtitle1" style={{marginTop: "15px"}}>
                Добавить задачу
            </Typography>
            <form onSubmit={(e) => handleSubmit(e)}>
                <Grid container>
                    <CreateTask
                        homework={props.homework}
                        onChange={(e) => setTaskState(e)}
                    />
                    <Grid
                        container
                        style={{marginTop: '16px'}}
                    >
                        <Button
                            style={{marginRight: '5px'}}
                            size="small"
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={state.hasErrors}
                        >
                            Добавить задачу
                        </Button>
                        <Button
                            onClick={() => props.onCancel()}
                            size="small"
                            variant="contained"
                            color="primary"
                        >
                            Отменить
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
}

export default AddTask
