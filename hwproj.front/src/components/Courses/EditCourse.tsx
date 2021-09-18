import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import { Redirect } from 'react-router-dom';
import {RouteComponentProps, Link} from "react-router-dom"
import ApiSingleton from "../../api/ApiSingleton";
import { Dialog, DialogTitle, Grid } from '@material-ui/core';

interface IEditCourseState {
    isLoaded: boolean,
    name: string,
    groupName?: string,
    isOpen: boolean,
    isComplete: boolean,
    mentorId: string,
    edited: boolean,
    deleted: boolean,
    isOpenDialog: boolean;
    lecturerEmail: string;
}

interface IEditCourseProps {
    courseId: string
}

export default class EditCourse extends React.Component<RouteComponentProps<IEditCourseProps>, IEditCourseState> {
    constructor(props: RouteComponentProps<IEditCourseProps>) {
        super(props)
        this.state = {
            isLoaded: false,
            name: "",
            groupName: "",
            isOpen: false,
            isComplete: false,
            mentorId: "",
            edited: false,
            deleted: false,
            isOpenDialog: false,
            lecturerEmail: "",
        };
    }

    public async handleSubmit(e: any) {
        e.preventDefault();
        let courseViewModel = {
            name: this.state.name,
            groupName: this.state.groupName,
            isOpen: this.state.isOpen,
            isComplete: this.state.isComplete
        };

        ApiSingleton.coursesApi.apiCoursesUpdateByCourseIdPost(+this.props.match.params.courseId, courseViewModel)
            .then(res => this.setState({edited: true}))
    }

    public onDelete() {
        ApiSingleton.coursesApi.apiCoursesByCourseIdDelete(+this.props.match.params.courseId)
            .then(res => this.setState({deleted: true}));
    }

    public async acceptLecturer(e: any) {
        e.preventDefault()
        await ApiSingleton.coursesApi
            .apiCoursesAcceptLecturerByCourseIdByLecturerEmailGet(+this.props.match.params.courseId, this.state.lecturerEmail)
            .then(res => this.setState({ isOpenDialog: false }))
    }

    public render() {
        if (this.state.isLoaded) {
            if (this.state.edited) {
                return <Redirect to={'/courses/' + this.props.match.params.courseId} />
            }

            if (this.state.deleted) {
                return <Redirect to='/' />
            }

            if (!ApiSingleton.authService.isLoggedIn() || !this.state.mentorId.includes(ApiSingleton.authService.getUserId())) {
                debugger
                return <Typography variant='h6' gutterBottom>Только преподаватель может редактировать курс</Typography>
            }

            return (
                <div>
                    &nbsp; <Link to={'/courses/' + this.props.match.params.courseId}>Назад к курсу</Link>
                        <br />
                        <br />
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
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => this.setState({ isOpenDialog: true })}
                            >
                                Добавить лектора
                            </Button>
                            <br /> <br />
                            <Button size="small" variant="contained" color="primary" type="submit">Редактировать курс</Button>
                            <br /> <br /> <br /> <hr />
                            <Button onClick={() => this.onDelete()} size="small" variant="contained" color="secondary">Удалить курс</Button>
                        </form>
                    </div>

                    <Dialog
                        onClose={() => this.setState({ isOpenDialog: false })}
                        aria-labelledby="simple-dialog-title"
                        open={this.state.isOpenDialog}
                    >
                        <DialogTitle id="simple-dialog-title">Введите Email лектора</DialogTitle>
                        <Grid container direction="column" justifyContent="space-evenly" alignItems="center">
                            <Grid item>
                                <form onSubmit={e => this.acceptLecturer(e)}>
                                    <TextField
                                        required
                                        label="Email лектора"
                                        variant="outlined"
                                        margin="normal"
                                        value={this.state.lecturerEmail}
                                        onChange={e => {
                                            e.persist()
                                            this.setState({ lecturerEmail: e.target.value })
                                        }}
                                    />
                                </form>
                            </Grid>
                        </Grid>
                    </Dialog>

                </div>
            );
        }

        return "";
    }

    async componentDidMount() {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+this.props.match.params.courseId)
        this.setState({
            isLoaded: true,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isComplete: course.isCompleted!,
            mentorId: course.mentorIds!
        })
    }
}