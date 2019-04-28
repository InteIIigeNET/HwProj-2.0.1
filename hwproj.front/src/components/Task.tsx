import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { HomeworkTaskViewModel, TasksApi } from "../api/homeworks/api";

interface ITaskState {
    isLoaded: boolean,
    isFound: boolean,
    task: HomeworkTaskViewModel
}

interface ITaskProp {
    id: number
}

export default class Task extends React.Component<ITaskProp, ITaskState> {
    constructor(props : ITaskProp) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            task: {}
        };
    }

    public render() {
        const { isLoaded, isFound, task} = this.state;
        
        if (isLoaded) {
            if (isFound) {
                return (
                    <div>
                        <Typography variant="subtitle2">
                            {task.title}
                        </Typography>
                        {task.description}
                    </div>
                );
            }
            else {
                return <Typography variant="h2" gutterBottom>
                            Не удалось найти задачу.
                        </Typography>
            }
        }

        return (<h1></h1>);
    }

    componentDidMount(): void {
        let api = new TasksApi();
        api.getTask(this.props.id)
            .then(res => res.json())
            .then(task => this.setState({
                isLoaded: true,
                isFound: true,
                task: task
            }))
            .catch(err => this.setState({ isLoaded: true, isFound: false }))
    }
}