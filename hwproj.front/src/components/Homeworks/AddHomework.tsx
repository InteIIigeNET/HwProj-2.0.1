import * as React from "react";
import ApiSingleton from "../../api/ApiSingleton";
import {Grid, TextField, Button, Checkbox, Typography, Tooltip, Link} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import {CreateTaskViewModel} from "../../api";
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

export default class AddHomework extends React.Component<IAddHomeworkProps,
    IAddHomeworkState> {
    constructor(props: IAddHomeworkProps) {
        super(props);

        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000
        const now = Date.now()

        const deadlineDate = Utils.toMoscowDate(new Date(now + twoWeeks))
        deadlineDate.setHours(23, 59, 0, 0)

        this.state = {
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
            publicationDate: this.getInitialPublicationDate(),
            hasDeadline: true,
            deadlineDate: Utils.toMoscowDate(deadlineDate),
            isDeadlineStrict: false,
            added: false,
        };
    }

    public getInitialPublicationDate() {
        const publicationDay = Utils.toMoscowDate(new Date(Date.now()))
        publicationDay.setHours(0, 0, 0, 0)

        return Utils.toMoscowDate(publicationDay)
    }

    render() {
        return (
            <div>
                <form onSubmit={(e) => this.handleSubmit(e)} style={{maxWidth: "100%"}}>
                    <TextField
                        size="small"
                        required
                        label="Название"
                        variant="outlined"
                        margin="normal"
                        name={this.state.title}
                        onChange={(e) => this.setState({title: e.target.value})}
                    />
                    <TextFieldWithPreview
                        multiline
                        fullWidth
                        minRows={4}
                        maxRows="20"
                        label="Описание"
                        variant="outlined"
                        margin="normal"
                        value={this.state.description}
                        onChange={(e) => this.setState({description: e.target.value})}
                    />
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
                                defaultValue={this.state.publicationDate?.toISOString().slice(0, -1)}
                                onChange={(e) => this.setState({publicationDate: new Date(e.target.value)})}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid>
                            <label style={{margin: 0, padding: 0}}>
                                <Checkbox
                                    color="primary"
                                    checked={this.state.hasDeadline}
                                    onChange={(e) => this.setState({
                                            hasDeadline: e.target.checked,
                                            deadlineDate: undefined,
                                            isDeadlineStrict: false,
                                            added: false
                                        })}
                                />
                                Добавить дедлайн
                            </label>
                        </Grid>
                    </Grid>
                    {this.state.hasDeadline && (
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            style={{marginTop: '10px'}}
                        >
                            <Grid item>
                                <TextField
                                    size="small"
                                    id="datetime-local"
                                    label="Дедлайн задания"
                                    type="datetime-local"
                                    defaultValue={this.state.deadlineDate?.toISOString().slice(0, -1)}
                                    onChange={(e) => {
                                        this.setState({deadlineDate: new Date(e.target.value)});
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item>
                                <label style={{margin: 0, padding: 0}}>
                                    <Checkbox
                                        color="primary"
                                        onChange={(e) => {
                                            this.setState({isDeadlineStrict: e.target.checked});
                                        }}
                                    />
                                    Запретить отправку решений после дедлайна
                                </label>
                            </Grid>
                        </Grid>
                    )}
                    <div>
                        <ol>
                            {this.state.tasks.map((task, index) => (
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
                                                    this.setState({
                                                        tasks: this.state.tasks.slice(
                                                            0,
                                                            this.state.tasks.length - 1
                                                        ),
                                                    })
                                                }
                                            >
                                                Убрать задачу
                                            </Button>
                                        </Grid>
                                        <Grid container>
                                            <div style={{marginRight: '10px'}}>
                                                <TextField
                                                    size="small"
                                                    required
                                                    label="Название задачи"
                                                    variant="outlined"
                                                    margin="normal"
                                                    name={task.title}
                                                    onChange={(e) => (task.title = e.target.value)}
                                                />
                                            </div>
                                            <TextField
                                                size="small"
                                                required
                                                label="Баллы"
                                                variant="outlined"
                                                type="number"
                                                margin="normal"
                                                defaultValue={task.maxRating}
                                                onChange={(e) => (task.maxRating = +e.target.value)}
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
                                            value={task.description}
                                            onChange={(e) => {
                                                task.description = e.target.value;
                                                this.setState(prevState => prevState)
                                            }}
                                        />
                                        {task.publicationDate == undefined && <Grid item>
                                        <Tooltip arrow title={"Позволяет установить даты для определенной задачи"}>
                                            <Typography variant={"caption"} style={{fontSize: "14px"}}>
                                                <Link onClick={() => {
                                                    task.publicationDate = this.getInitialPublicationDate()
                                                    this.setState(prevState => prevState)
                                                }}>
                                                    Нужны особые даты?
                                                </Link>
                                            </Typography>
                                        </Tooltip>
                                    </Grid>}
                                                
                                        {task.publicationDate != undefined &&
                                            <Grid item>
                                                <Tooltip arrow title={"Позволяет выставить даты как у домашнего задания"}>
                                                    <Typography variant={"caption"} style={{fontSize: "14px"}}>
                                                        <Link onClick={() => {
                                                            task.hasDeadline = false
                                                            task.deadlineDate = undefined
                                                            task.isDeadlineStrict = false
                                                            task.publicationDate = undefined
                                                            this.setState(prevState => prevState)
                                                        }}>
                                                            Оставить обычные даты
                                                        </Link>
                                                    </Typography>
                                                </Tooltip>
                                            </Grid>
                                        }
                                        
                                        {task.publicationDate != undefined &&
                                        <Grid
                                            style={{marginTop: "16px"}}
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
                                                    defaultValue={task.publicationDate?.toISOString().slice(0, -1)}
                                                    onChange={(e) => task.publicationDate = new Date(e.target.value)}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid>
                                                <label style={{margin: 0, padding: 0}}>
                                                    <Checkbox
                                                        color="primary"
                                                        onChange={(e) => {
                                                            task.hasDeadline = e.target.checked;
                                                            task.deadlineDate = undefined;
                                                            task.isDeadlineStrict = false;
                                                            this.setState({added: false});
                                                        }}
                                                    />
                                                    Добавить дедлайн
                                                </label>
                                            </Grid>
                                        </Grid>
                                        }
                                        
                                        {task.hasDeadline && (
                                            <Grid
                                                container
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                style={{marginTop: '10px'}}
                                            >
                                                <Grid item>
                                                    <TextField
                                                        size="small"
                                                        id="datetime-local"
                                                        label="Дедлайн задачи"
                                                        type="datetime-local"
                                                        defaultValue={task.deadlineDate?.toISOString().slice(0, -1)}
                                                        onChange={(e) => {
                                                            task.deadlineDate = new Date(e.target.value)
                                                        }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <label style={{margin: 0, padding: 0}}>
                                                        <Checkbox
                                                            color="primary"
                                                            onChange={(e) => {
                                                                task.isDeadlineStrict = e.target.checked
                                                            }}
                                                        />
                                                        Запретить отправку решений после дедлайна
                                                    </label>
                                                </Grid>
                                            </Grid>
                                        )}
                                    </li>
                                </Grid>
                            ))}
                        </ol>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() =>
                                this.setState({
                                    tasks: [...this.state.tasks, {
                                        title: "",
                                        description: "",
                                        maxRating: 10,
                                        publicationDate: undefined,
                                        hasDeadline: false,
                                        deadlineDate: undefined,
                                        isDeadlineStrict: false,
                                    }],
                                })
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
                        >
                            Добавить домашнее задание
                        </Button>
                        &nbsp;
                        <Button
                            onClick={() => this.props.onCancel()}
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

    async handleSubmit(e: any) {
        e.preventDefault();

        await ApiSingleton.homeworksApi.apiHomeworksByCourseIdAddPost(this.props.id, this.state)
        this.setState({added: true})
        this.props.onSubmit()
    }
}
