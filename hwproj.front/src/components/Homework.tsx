import * as React from 'react';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { HomeworkViewModel, HomeworksApi} from "../api/homeworks/api";
import AddTask from'./AddTask'
import HomeworkTasks from './HomeworkTasks'

interface IHomeworkProps {
    id: number
}

interface IHomeworkState {
    isLoaded: boolean,
    isFound: boolean,
    homework: HomeworkViewModel,
    createTask: boolean
}

export default class Homework extends React.Component<IHomeworkProps, IHomeworkState> {
    constructor(props : IHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            homework: {},
            createTask: false
        };
    }

    public render() {
        const { isLoaded, isFound, homework, createTask } = this.state;

        if (isLoaded) {
            if (isFound) {
                return (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            <b>{homework.title}</b> {homework.date}
                            <br />
                            {homework.description}
                        </Typography>
                        
                        {this.state.createTask && 
                            <div>
                                <HomeworkTasks id={this.props.id} />
                                <AddTask
                                id={homework.id!}
                                onAdding={() => this.setState({createTask: false})} />
                            </div>
                        }
                        {!this.state.createTask &&
                            <div>
                                <HomeworkTasks id={this.props.id} />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => { this.setState({createTask: true })}}>Добавить задачу</Button>
                            </div>
                        }
                    </div>
                )
            }
        }

        return <h1></h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getHomework(this.props.id)
            .then(res => res.json())
            .then(homework => this.setState({
                isLoaded: true,
                isFound: true,
                homework: homework
            }))
            .catch(err => this.setState({
                isLoaded: true,
                isFound: false
            }));
    }
}