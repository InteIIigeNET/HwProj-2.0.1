import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import { Redirect } from 'react-router-dom';
import { CoursesApi } from "../api/courses/api";
import {RouteComponentProps} from "react-router-dom"

interface IEditCourseState {
    name: string,
    groupName: string,
    isOpen: boolean,
    isComplete: boolean,
    edited: boolean,
    deleted: boolean
}

interface IEditCourseProps {
    courseId: string
}

export default class EditCourse extends React.Component<RouteComponentProps<IEditCourseProps>, IEditCourseState> {
    constructor(props: RouteComponentProps<IEditCourseProps>) {
        super(props)
        this.state = {
            name: "",
            groupName: "",
            isOpen: false,
            isComplete: false,
            edited: false,
            deleted: false
        };
    }
            
    public handleSubmit(e: any) {
        e.preventDefault();
        let api = new CoursesApi();

        let courseViewModel = {
            name: this.state.name,
            groupName: this.state.groupName,
            isOpen: this.state.isOpen,
            isComplete: this.state.isComplete
        };

        api.updateCourse(+this.props.match.params.courseId, courseViewModel)
            .then(res => this.setState({edited: true}))
    }

    public onDelete() {
        let api = new CoursesApi();
        api.deleteCourse(+this.props.match.params.courseId)
            .then(res => this.setState({deleted: true}));
    }

    public render() {
        if (this.state.edited) {
            return <Redirect to={'/courses/' + this.props.match.params.courseId} />
        }

        if (this.state.deleted) {
            return <Redirect to='/' />
        }
        return (
            <div className="container">
                <Typography variant='h6' gutterBottom>Редактировать курс</Typography>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <TextField
                        required
                        label="Название курса"
                        variant="outlined"
                        margin="normal"
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                    />
                    <br />
                    <TextField
                        required
                        label="Номер группы"
                        variant="outlined"
                        margin="normal"
                        value={this.state.groupName}
                        onChange={e => this.setState({ groupName: e.target.value})}
                    />
                    <br />
                    <FormControlLabel
                        control={
                            <Checkbox
                            defaultChecked
                            color="primary"
                            checked={this.state.isOpen}
                            onChange={e => this.setState({ isOpen: e.target.checked})}
                        />
                        }
                        label="Открытый курс"
                    />
                     <FormControlLabel
                        control={
                            <Checkbox
                            defaultChecked
                            color="primary"
                            checked={this.state.isComplete}
                            onChange={e => this.setState({ isComplete: e.target.checked})}
                        />
                        }
                        label="Завершённый курс"
                    />
                    <br />
                    <Button size="small" variant="contained" color="primary" type="submit">Редактировать курс</Button>
                    <br />
                    <br />
                    <Button onClick={() => this.onDelete()} size="small" variant="contained" color="secondary">Удалить курс</Button>
                </form>
            </div>
        );
    }

    componentDidMount() {
        let api = new CoursesApi();
        api.get(+this.props.match.params.courseId)
            .then(res => res.json())
            .then(course => this.setState({
                name: course.name,
                groupName: course.groupName,
                isOpen: course.isOpen,
                isComplete: course.isComplete
            }))
    }
}