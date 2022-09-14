import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../../api/ApiSingleton";
import {CreateTaskViewModel} from "../../api";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Utils from "../../services/Utils";

interface IAddTaskProps {
    id: number;
    onAdding: () => void;
    onCancel: () => void;
    update: () => void;
}

export default class AddTask extends React.Component<IAddTaskProps,
    CreateTaskViewModel> {
    constructor(props: IAddTaskProps) {
        super(props);
        this.state = {
            title: "",
            description: "",
            maxRating: 10,
            publicationDate: new Date(),
            hasDeadline: false,
            deadlineDate: undefined,
            isDeadlineStrict: false
        };
    }

    public async handleSubmit(e: any) {
        e.preventDefault();
        await ApiSingleton.tasksApi.apiTasksAddByHomeworkIdPost(this.props.id, this.state);
        this.props.onAdding()
    }

    public render() {
        return (
            <div>
                <Typography variant="subtitle1" style={{marginTop: "15px"}}>
                    Добавить задачу
                </Typography>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <Grid container>
                        <Grid item style={{marginRight: '10px'}}>
                            <TextField
                                required
                                label="Название задачи"
                                variant="outlined"
                                margin="normal"
                                value={this.state.title}
                                onChange={(e) => this.setState({title: e.target.value})}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                required
                                label="Баллы"
                                variant="outlined"
                                margin="normal"
                                type="number"
                                value={this.state.maxRating}
                                onChange={(e) => this.setState({maxRating: +e.target.value})}
                            />
                        </Grid>
                        <TextField
                            multiline
                            fullWidth
                            rows="10"
                            label="Условие задачи"
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
                                    id="datetime-local"
                                    label="Дата публикации"
                                    type="datetime-local"
                                    defaultValue={this.state.publicationDate?.toLocaleString("ru-RU")}
                                    onChange={(e) => {
                                        let date = new Date(e.target.value)
                                        date = Utils.toMoscowDate(date)
                                        this.setState({publicationDate: date})
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <label>
                                    <Checkbox
                                        color="primary"
                                        onChange={(e) => {
                                            this.setState({
                                                hasDeadline: e.target.checked,
                                                deadlineDate: undefined,
                                            })
                                        }}
                                    />
                                    Добавить дедлайн
                                </label>
                            </Grid>
                        </Grid>
                        {this.state.hasDeadline &&
                            <Grid
                                container
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                style={{marginTop: '16px'}}
                            >
                                <Grid item>
                                    <TextField
                                        id="datetime-local"
                                        label="Дедлайн задачи"
                                        type="datetime-local"
                                        defaultValue={this.state.deadlineDate?.toLocaleString("ru-RU")}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        onChange={(e) => {
                                            let date = new Date(e.target.value)
                                            date = Utils.toMoscowDate(date)
                                            this.setState({deadlineDate: date})
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <label>
                                        <Checkbox
                                            color="primary"
                                            onChange={(e) => this.setState({isDeadlineStrict: e.target.checked})}
                                        />
                                        Запретить отправку решений после дедлайна
                                    </label>
                                </Grid>
                            </Grid>
                        }
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
                                onClick={() => this.props.onCancel()}
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
}
