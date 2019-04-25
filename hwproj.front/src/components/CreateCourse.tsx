import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {CoursesApi, CreateCourseViewModel} from "../api/courses/api";
import { Redirect } from 'react-router-dom';

interface ICreateCourseState {
    name: string,
    groupName: string,
    isOpen: boolean,
    created: boolean,
    courseId: string
}

export default class CreateCourse extends React.Component<{}, ICreateCourseState> {
    state = {
        name: "",
        groupName: "",
        isOpen: false,
        created : false,
        courseId: ""
    };        

    public handleSubmit(e: any) {
        e.preventDefault();
        let api = new CoursesApi();
        let courseViewModel = {
            name: this.state.name,
            groupName: this.state.groupName,
            isOpen: this.state.isOpen
        };

        api.addCourse(courseViewModel, 1)
            .then(res => res.json())
            .then(id => this.setState({
                created: true,
                courseId: id
            }));
    }

    public render() {
        if (this.state.created) {
            return <Redirect to={'/courses/' + this.state.courseId} />
        }
        return (
            <div>
                <h1>Create new course</h1>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <TextField
                        label="Название курса"
                        variant="outlined"
                        margin="normal"
                        name={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                    />
                    <br />
                    <TextField
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
                    <br />
                    <Button variant="contained" color="primary" type="submit">Create course</Button>
                </form>
            </div>
        );
    }
}