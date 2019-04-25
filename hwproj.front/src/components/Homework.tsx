import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import { HomeworkViewModel, HomeworksApi} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router";
import Typography from '@material-ui/core/Typography'
import Task from './Task';

interface IHomeworkProps {
    id: number
}

interface IHomeworkState {
    isLoaded: boolean,
    isFound: boolean,
    homework: HomeworkViewModel
}

export default class Course extends React.Component<IHomeworkProps, IHomeworkState> {
    constructor(props : IHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            homework: {}
        };
    }

    public render() {
        const { isLoaded, isFound, homework} = this.state;

        if (isLoaded) {
            if (isFound) {
                let listItems = homework.tasks!.map(taskId => <li>
                        <Task id={taskId} />
                    </li>);
                
                return (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            <b>{homework.title}</b> {homework.date}
                            <br />
                            {homework.description}
                        </Typography>
                        <ol>
                            {listItems}
                        </ol>
                    </div>
                )
            }
        }

        return <h1>loading...</h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getHomework(this.props.id)
            .then(res => res.json())
            .then(data => this.setState({
                isLoaded: true,
                isFound: true,
                homework: data
            }))
            .catch(err => this.setState({
                isLoaded: true,
                isFound: false
            }));
    }
}