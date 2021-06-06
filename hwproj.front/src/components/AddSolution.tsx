import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../api/ApiSingleton";
import {SolutionViewModel} from "../api/solutions/api";

interface IAddSolutionProps {
    taskId: number,
    studentId: string,
    onAdding: () => void,
    onCancel: () => void
}

export default class AddSolution extends React.Component<IAddSolutionProps, SolutionViewModel> {
    constructor(props : IAddSolutionProps) {
        super(props);
        this.state = {
            githubUrl: "",
            comment: "",
            studentId: this.props.studentId
        };
    }

    public async handleSubmit(e: any) {
        e.preventDefault();

        await ApiSingleton.solutionService.addSolution({
            taskId: this.props.taskId,
            studentId: this.state.studentId,
            githubUrl: this.state.githubUrl,
            comment: this.state.comment,
            state: "Posted"
        })
        this.props.onAdding()
    }

    // public handleSubmit(e: any) {
    //     e.preventDefault();
    //     ApiSingleton.solutionsApi.postSolution(this.props.taskId, this.state)
    //         .then(id => this.props.onAdding());
    // }

    public render() {
        return (<div>
            <form onSubmit={e => this.handleSubmit(e)}>
                <TextField
                    fullWidth
                    required
                    label="Ссылка на решение"
                    variant="outlined"
                    margin="normal"
                    value={this.state.githubUrl}
                    onChange={e => this.setState({ githubUrl: e.target.value })}
                />
                <TextField
                    multiline
                    fullWidth
                    rows="3"
                    rowsMax="15"
                    label="Комментарий"
                    variant="outlined"
                    margin="normal"
                    value={this.state.comment}
                    onChange={e => this.setState({ comment: e.target.value })}
                />
                <Button size="small" variant="contained" color="primary" type="submit">Добавить решение</Button>
                &nbsp;
                <Button onClick={() => this.props.onCancel()} size="small" variant="contained" color="primary">Отменить</Button>
            </form>
        </div>);
    }
}