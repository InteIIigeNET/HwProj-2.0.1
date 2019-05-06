import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import { Typography } from '@material-ui/core';
import { HomeworksApi} from "../api/homeworks/api";
import Homework from './Homework';

interface ICourseHomeworkProps {
    id: number
}

interface ICourseHomeworkState {
    isLoaded: boolean,
    homeworks: number[]
}

export default class CourseHomework extends React.Component<ICourseHomeworkProps, ICourseHomeworkState> {
    constructor(props : ICourseHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            homeworks: []
        };
    }

    public render() {
        const { isLoaded, homeworks } = this.state;

        if (isLoaded) {
                let homeworkList = homeworks.map(homeworkId =>
                    <ListItem key={homeworkId}>
                        <Homework id={homeworkId} onDeleteClick={() => this.componentDidMount()}/>
                    </ListItem>).reverse();
                
                return (
                    <div>
                        {homeworkList.length > 0 &&
                            <Typography variant='h6'>Задачи</Typography>
                        }
                        <List>
                            {homeworkList}
                        </List>
                    </div>
                )
        }

        return <h1></h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getCourseHomeworks(this.props.id)
            .then(homeworks => this.setState({
                isLoaded: true,
                homeworks: homeworks.map(hw => hw.id!)
            }));
    }
}