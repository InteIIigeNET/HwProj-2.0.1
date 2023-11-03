import * as React from "react";
import {FC, useEffect, useState} from "react";
import {Grid, Checkbox, Button, TextField, Typography, Tooltip, Link} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import TaskPublicationAndDeadlineDates from "../Common/TaskPublicationAndDeadlineDates";

interface ICreateTaskProps {
    homeworkPublicationDate: Date;
    homeworkHasDeadline: boolean;
    homeworkDeadlineDate: Date | undefined;
    homeworkIsDeadlineStrict: boolean;
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
    hasError: boolean;
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
        hasError: false,
    })

    useEffect(() => props.onChange(createTaskState), [createTaskState])

    const [isOpenDates, setIsOpenDates] = useState<boolean>(false)

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
                        }))}}
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
                    }))}}
                />
            </Grid>
            <TextFieldWithPreview
                multiline
                fullWidth
                minRows={7}
                maxRows="20"
                label="Условие задачи"
                variant="outlined"
                margin="normal"
                value={createTaskState.description}
                onChange={(e) => {
                    e.persist()
                    setCreateTaskState((prevState) => ({
                    ...prevState,
                    description: e.target.value,
                }))}}
            />

            {!isOpenDates && 
            <Grid item>
                <Tooltip arrow title={"Позволяет установить даты для определенной задачи"}>
                    <Typography variant={"caption"} style={{fontSize: "14px"}}>
                        <Link onClick={() => {
                                setCreateTaskState((prevState) => ({
                                    ...prevState,
                                    hasDeadline: undefined,
                                    deadlineDate: undefined,
                                    isDeadlineStrict: undefined,
                                    publicationDate: undefined,
                                    hasError: false,
                                }))

                                setIsOpenDates(true)
                            }}>
                            Нужны особые даты?
                        </Link>
                    </Typography>
                </Tooltip>
            </Grid>}
                            
            {isOpenDates &&
            <Grid container>
                <Grid item>
                    <Tooltip arrow title={"Позволяет выставить даты как у домашнего задания"}>
                        <Typography variant={"caption"} style={{fontSize: "14px"}}>
                            <Link onClick={() => {
                                setCreateTaskState((prevState) => ({
                                    ...prevState,
                                    hasDeadline: undefined,
                                    deadlineDate: undefined,
                                    isDeadlineStrict: undefined,
                                    publicationDate: undefined,
                                    hasError: false,
                                }))

                                setIsOpenDates(false)
                            }}>
                                Оставить обычные даты
                            </Link>
                        </Typography>
                    </Tooltip>
                </Grid>
                
                <Grid item style={{width: "100%"}}>          
                    <TaskPublicationAndDeadlineDates
                        hasDeadline={undefined}
                        isDeadlineStrict={undefined}
                        publicationDate={undefined}
                        deadlineDate={undefined}
                        homeworkPublicationDate={props.homeworkPublicationDate}
                        homeworkHasDeadline={props.homeworkHasDeadline}
                        homeworkDeadlineDate={props.homeworkDeadlineDate}
                        homeworkIsDeadlineStrict={props.homeworkIsDeadlineStrict}
                        onChange={(state) => setCreateTaskState((prevState) => ({
                            ...prevState,
                            hasDeadline: state.hasDeadline,
                            isDeadlineStrict: state.isDeadlineStrict,
                            publicationDate: state.publicationDate,
                            deadlineDate: state.deadlineDate,
                            hasError: state.hasError,
                        }))}
                    />
                    </Grid>
                </Grid>
            }
            
        </Grid>
    )
}

export default CreateTask