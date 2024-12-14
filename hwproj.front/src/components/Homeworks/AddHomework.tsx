import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {useEffect, useState} from "react";
import {Grid, TextField, Button, Typography} from "@material-ui/core";
import {MarkdownEditor} from "../Common/MarkdownEditor";
import {CreateHomeworkViewModel, CreateTaskViewModel, HomeworkViewModel} from "../../api";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import CreateTask from "../Tasks/CreateTask"
import Tags from "../Common/Tags";
import apiSingleton from "../../api/ApiSingleton";
import {Alert} from "@mui/material";
import {TestTag, isTestWork, isBonusWork} from "components/Common/HomeworkTags";
import Lodash from "lodash";

interface IAddHomeworkProps {
    id: number;
    previousHomeworks: HomeworkViewModel[]
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
    isGroupWork: boolean;
    hasErrors: boolean;
    tags: string[];
}

interface IAddHomeworkTaskState {
    task: CreateTaskViewModel;
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
        isGroupWork: false,
        publicationDate: new Date(),
        hasDeadline: true,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        added: false,
        hasErrors: false,
        tags: []
    })

    const [deadlineSuggestion, setDeadlineSuggestion] = useState<Date | undefined>(undefined)

    useEffect(() => {
        const isTest = isTestWork(addHomeworkState)
        const isBonus = isBonusWork(addHomeworkState)

        const dateCandidate = Lodash(props.previousHomeworks
            .filter(x => {
                const xIsTest = isTestWork(x)
                const xIsBonus = isBonusWork(x)
                return x.hasDeadline && (isTest && xIsTest || isBonus && xIsBonus || !isTest && !isBonus && !xIsTest && !xIsBonus)
            })
            .map(x => {
                const deadlineDate = new Date(x.deadlineDate!)
                return ({
                    deadlineDate: deadlineDate,
                    daysDiff: Math.floor((deadlineDate.getTime() - new Date(x.publicationDate!).getTime()) / (1000 * 3600 * 24))
                });
            }))
            .groupBy(x => [x.daysDiff, x.deadlineDate.getHours(), x.deadlineDate.getMinutes()])
            .entries()
            .sortBy(x => x[1].length).last()?.[1][0]
        if (dateCandidate) {
            const publicationDate = new Date(addHomeworkState.publicationDate)
            const dateTime = dateCandidate.deadlineDate
            publicationDate.setDate(publicationDate.getDate() + dateCandidate.daysDiff)
            publicationDate.setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0)
            setDeadlineSuggestion(publicationDate)
        } else {
            setDeadlineSuggestion(undefined)
        }
    }, [addHomeworkState.tags, addHomeworkState.publicationDate])


    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const addHomework: CreateHomeworkViewModel = {
            ...addHomeworkState,
            tasks: addHomeworkState.tasks.map(t => t.task)
        }

        await ApiSingleton.homeworksApi.apiHomeworksByCourseIdAddPost(props.id, addHomework)
        setAddHomeworkState((prevState) => ({
            ...prevState,
            added: true
        }))

        props.onSubmit()
    }

    const handleTagsChange = (newValue: string[]) => {
        setAddHomeworkState((prevState) => ({
            ...prevState,
            tags: newValue
        }))
    };

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
                            title: e.target.value
                        }))
                    }
                    }
                />
                <div style={{ marginBottom: -3, marginTop: -5 }}>
                    <MarkdownEditor
                        label={"Описание"}
                        height={200}
                        maxHeight={400}
                        value={addHomeworkState.description}
                        onChange={(value) => {
                            setAddHomeworkState((prevState) => ({
                                ...prevState,
                                description: value
                            }))
                        }}
                    />
                </div>
                <Tags tags={[]} onTagsChange={handleTagsChange} isElementSmall={false}
                      requestTags={() => apiSingleton.coursesApi.apiCoursesTagsByCourseIdGet(props.id)}/>
                {addHomeworkState.tags.includes(TestTag) &&
                    <Alert severity="info">Вы можете сгруппировать контрольные работы и переписывания с помощью
                        дополнительного тега. Например, 'КР 1'</Alert>}
                <PublicationAndDeadlineDates
                    hasDeadline={false}
                    isDeadlineStrict={false}
                    publicationDate={undefined}
                    deadlineDate={undefined}
                    autoCalculatedDeadline={deadlineSuggestion}
                    onChange={(state) => setAddHomeworkState((prevState) => ({
                        ...prevState,
                        hasDeadline: state.hasDeadline,
                        isDeadlineStrict: state.isDeadlineStrict,
                        publicationDate: state.publicationDate,
                        deadlineDate: state.deadlineDate,
                        hasErrors: state.hasErrors,
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
                        disabled={addHomeworkState.hasErrors || addHomeworkState.tasks.some(t => t.hasErrors)}
                    >
                        Добавить задание
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