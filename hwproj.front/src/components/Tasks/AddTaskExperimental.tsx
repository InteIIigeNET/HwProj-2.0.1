import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../../api/ApiSingleton";
import {CreateTaskViewModel} from "../../api";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Utils from "../../services/Utils";
import { Card, CardContent, Box } from "@material-ui/core";

interface IAddTaskProps {
    id: number;
    onAdding: () => void;
    onCancel: () => void;
    update: () => void;
}

export default class AddTaskExperimental extends React.Component<IAddTaskProps,
    CreateTaskViewModel> {
    constructor(props: IAddTaskProps) {
        super(props);

        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000
        const now = Date.now()

        const publicationDay = Utils.toMoscowDate(new Date(now))
        publicationDay.setHours(0, 0, 0, 0)

        const deadlineDate = Utils.toMoscowDate(new Date(now + twoWeeks))
        deadlineDate.setHours(23, 59, 0, 0)

        this.state = {
            title: "",
            description: "",
            maxRating: 10,
            publicationDate: Utils.toMoscowDate(publicationDay),
            hasDeadline: true,
            deadlineDate: Utils.toMoscowDate(deadlineDate),
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
            <Card>
                <CardContent style={{ padding: "8px 16px 12px", backgroundColor: "ghostwhite" }}>
                    <Typography variant="h6" style={{marginTop: "15px"}}>
                        Добавить задачу
                    </Typography>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <Grid xs={12} item container direction={'row'}>
                            <Grid xs={12} item style={{ display: "flex", alignItems: "flex-end", padding: 0 }}>

                                    <Grid xs item style={{ display: "flex", alignItems: "flex-end", padding: 0 }}>
                                        <TextField
                                            size="small"
                                            style={{ margin: 0 }}
                                            required
                                            fullWidth
                                            label="Название задачи"
                                            variant="standard"
                                            margin="normal"
                                            name={this.state.title}
                                            onChange={(e) =>  this.setState({title: e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item
                                          xs={1}
                                          style={{ minWidth: 60, width: 60, display: "flex", alignItems: "flex-end", padding: 0 }}>
                                        <Grid>
                                            <Box id="simple-tab-0"
                                                 role="tabpanel"
                                                 style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <Typography>⭐ </Typography>
                                                <TextField id="input-max-rating"
                                                           type="number"
                                                           variant="standard"
                                                           label={'Баллы'}
                                                           defaultValue={this.state.maxRating}
                                                           onChange={(e) => this.setState({maxRating: +e.target.value})}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
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
                                xs={12}
                                item
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Grid xs={12} item style={{ marginTop: 16 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="datetime-local"
                                        label="Дата публикации"
                                        type="datetime-local"
                                        defaultValue={this.state.publicationDate?.toISOString().slice(0, -1)}
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
                            </Grid>
                            <Grid
                                container
                                xs={12}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                style={{marginTop: '10px'}}
                            >
                                <Grid xs={this.state.hasDeadline && 1} item>
                                    <label style={{margin: 0, padding: 0 }}>
                                        <Checkbox
                                            color="primary"
                                            onChange={(e) => {
                                                this.setState({
                                                    hasDeadline: e.target.checked
                                                })
                                            }}
                                            checked={this.state.hasDeadline}
                                        />
                                        {!this.state.hasDeadline && 'Добавить дедлайн'}
                                    </label>
                                </Grid>
                                {this.state.hasDeadline &&
                                    <Grid xs item hidden={!this.state.hasDeadline}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="datetime-local"
                                            label="Дедлайн задачи"
                                            type="datetime-local"
                                            defaultValue={this.state.deadlineDate?.toISOString().slice(0, -1)}
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
                                }
                            </Grid>
                            {this.state.hasDeadline &&
                                <Grid item>
                                    <label style={{margin: 0, padding: 0}}>
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.isDeadlineStrict}
                                            onChange={(e) => this.setState({isDeadlineStrict: e.target.checked})}
                                        />
                                        Запретить отправку решений после дедлайна
                                    </label>
                                </Grid>
                            }
                            
                            <Grid
                                container
                                style={{marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}
                            >
                                <Button
                                    style={{ marginRight: 8 }}
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Добавить задачу
                                </Button>
                                <Button
                                    onClick={() => this.props.onCancel()}
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                >
                                    Отменить
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        );
    }
}
