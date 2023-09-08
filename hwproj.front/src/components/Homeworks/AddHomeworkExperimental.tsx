import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../../api/ApiSingleton";
import {CreateTaskViewModel} from "../../api";
import ReactMarkdown from "react-markdown";
import {Grid, Tab, Tabs, Zoom, CardContent, Card, Divider} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {Box} from "@mui/material";

interface IAddHomeworkProps {
    id: number;
    onSubmit: () => void;
    onCancel: () => void;
}

interface IAddHomeworkState {
    title: string;
    description: string;
    added: boolean;
    isPreview: boolean;
}

const styles = makeStyles(() => ({
    titleCreate: {
        display: "flex",
        justifyContent: "space-between",
    },
}))

export default class AddHomeworkExperimental extends React.Component<IAddHomeworkProps,
    IAddHomeworkState> {
    constructor(props: IAddHomeworkProps) {
        super(props);
        this.state = {
            title: "",
            description: "",
            added: false,
            isPreview: false,
        };
    }

    render() {
        return (
            <Card variant="elevation">
                <CardContent style={{ padding: "8px 16px 12px", backgroundColor: "ghostwhite" }}>
                    <form onSubmit={(e) => this.handleSubmit(e)} style={{maxWidth: "100%"}}>
                        <Tabs
                            onChange={(event, newValue) => this.setState({isPreview: newValue === 1})}
                            indicatorColor="primary"
                            value={this.state.isPreview ? 1 : 0}
                            centered
                        >
                            <Tab label="Редактировать"
                                 id="simple-tab-0" 
                                 aria-controls="simple-tabpanel-0"
                                 style={{ width: '100%' }}/>
                            <Tab label="Превью" 
                                 id="simple-tab-1" 
                                 aria-controls="simple-tabpanel-1"
                                 style={{ width: '100%' }}/>
                        </Tabs>
                        <TextField
                            size="small"
                            required
                            fullWidth
                            label="Название задания"
                            variant="standard"
                            margin="normal"
                            hidden={this.state.isPreview}
                            name={this.state.title}
                            onChange={(e) => this.setState({title: e.target.value})}
                        />
                        <div role="tabpanel" hidden={this.state.isPreview} id="simple-tab-0">
                            <TextField
                                multiline
                                fullWidth
                                rows="4"
                                rowsMax="20"
                                label="Описание задания"
                                variant="outlined"
                                margin="normal"
                                name={this.state.description}
                                onChange={(e) => this.setState({description: e.target.value})}
                            />
                        </div>
                        <Grid xs item role="tabpanel" hidden={!this.state.isPreview} id="simple-tab-1">
                            <Grid item xs>
                                <Typography variant="h6" component="div" >
                                    {this.state.title}
                                </Typography>
                            </Grid>
                            <Divider style={{marginTop: 15, marginBottom: 15}}/>
                            <div>
                                <p><ReactMarkdown>{this.state.description}</ReactMarkdown></p>
                            </div>
                        </Grid>
                        <Grid container xs item style={{ display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                size="large"
                                variant="contained"
                                color="primary"
                                type="submit"
                                style={{ marginRight: 8 }}
                            >
                                Добавить 
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
                    </form>
                </CardContent>
            </Card>
        );
    }

    async handleSubmit(e: any) {
        e.preventDefault();

        const homework = {
            title: this.state.title,
            description: this.state.description,
        }
        await ApiSingleton.homeworksApi.apiHomeworksByCourseIdAddPost(this.props.id, homework)
        this.setState({added: true})
        this.props.onSubmit()
    }
}
