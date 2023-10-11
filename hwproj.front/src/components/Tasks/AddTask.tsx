import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import Utils from "../../services/Utils";
import {FC, useEffect, useState} from "react";
import {Grid, Checkbox, Button, TextField, Typography, Tooltip, Link} from "@material-ui/core";
import CreateTask from "./CreateTask";

interface IAddTaskProps {
    homeworkId: number;
    onAdding: () => void;
    onCancel: () => void;
    update: () => void;
}

interface IAddTaskState {
    title: string
    description: string;
    maxRating: number;
    publicationDate: Date | undefined;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
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
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await ApiSingleton.tasksApi.apiTasksAddByHomeworkIdPost(props.homeworkId, state);
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
