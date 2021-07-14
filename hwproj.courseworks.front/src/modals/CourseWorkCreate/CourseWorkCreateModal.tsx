import React from "react";
import {Modal, TextField, Typography} from "@material-ui/core";
import {Button} from "@skbkontur/react-ui";
import {AgPickerField} from "ag-grid-community/dist/lib/widgets/agPickerField";
import ApiSingleton from "../../api/ApiSingleton";
import axios from "axios";

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

interface IState {
    title: string;
    overview: string;
    description: string;
    type: string;
    requirements: string;
    course: number;
    consultantName: string;
    consultantContact: string;
    supervisorName: string;
    supervisorContact: string;
}

export default class CourseWorkCreateModalProps extends React.Component<ModalProps, IState> {
    constructor(props: ModalProps) {
        super(props);

        this.state = {
            title: "",
            overview: "",
            description: "",
            type: "",
            requirements: "",
            course: 0,
            consultantName: "",
            consultantContact: "",
            supervisorName: "",
            supervisorContact: "",
        }
    }
    
    async handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        //ApiSingleton.courseWorksApi.po
        //ApiSingleton.courseWorksApi.
        /*const res = await axios.post("http://localhost:5000/api/lecturer/course_works/add", {...this.state}, {
            headers: {
                'Authorization': `Bearer ${ApiSingleton.authService.getToken()}`
            }
        })
        console.group('RESPONSE')
        console.log(res);
        console.groupEnd();*/
    }

    render() {
        return (
            <Modal
                disableAutoFocus
                disableEnforceFocus
                open={this.props.open}
                onClose={this.props.onClose}
                style={{
                    position: 'fixed',
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "1rem 1.5rem",
                        borderRadius: "5px",
                        maxHeight: "80vh",
                        overflowY: "scroll",
                        width: "500px",

                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Добавить курсовую работу
                    </Typography>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <TextField
                            style={{width: '100%'}}
                            required
                            type="text"
                            label="Название"
                            variant="outlined"
                            margin="normal"
                            name={this.state.title}
                            onChange={(e) => this.setState({title: e.target.value})}
                        />
                        <TextField
                            style={{width: '100%'}}
                            multiline
                            rows={2}
                            rowsMax={Infinity}
                            required
                            type="text"
                            label="Описание"
                            variant="outlined"
                            margin="normal"
                            name={this.state.description}
                            onChange={(e) => this.setState({description: e.target.value})}
                        />
                        <TextField
                            style={{width: '100%'}}
                            multiline
                            rows={2}
                            rowsMax={Infinity}
                            required
                            type="text"
                            label="Обзор"
                            variant="outlined"
                            margin="normal"
                            name={this.state.overview}
                            onChange={(e) => this.setState({overview: e.target.value})}
                        />
                        <TextField
                            style={{width: '100%'}}
                            multiline
                            rows={2}
                            rowsMax={Infinity}
                            required
                            type="text"
                            label="Требования"
                            variant="outlined"
                            margin="normal"
                            name={this.state.requirements}
                            onChange={(e) => this.setState({requirements: e.target.value})}
                        />
                        <fieldset style={{display: 'flex', justifyContent: 'space-between'}}>
                            <legend>Консультант</legend>
                            <TextField
                                style={{marginRight: '1rem'}}
                                required
                                type="text"
                                label="Имя"
                                variant="outlined"
                                margin="normal"
                                name={this.state.consultantName}
                                onChange={(e) => this.setState({consultantName: e.target.value})}
                            />
                            <TextField
                                required
                                type="text"
                                label="Контакты"
                                variant="outlined"
                                margin="normal"
                                name={this.state.consultantContact}
                                onChange={(e) => this.setState({consultantContact: e.target.value})}
                            />
                        </fieldset>
                        <br/>
                        <fieldset style={{display: 'flex', justifyContent: 'space-between'}}>
                            <legend>Научный руководитель</legend>
                            <TextField
                                style={{marginRight: '1rem'}}
                                required
                                type="text"
                                label="Имя"
                                variant="outlined"
                                margin="normal"
                                name={this.state.supervisorName}
                                onChange={(e) => this.setState({supervisorName: e.target.value})}
                            />
                            <TextField
                                required
                                type="text"
                                label="Контакты"
                                variant="outlined"
                                margin="normal"
                                name={this.state.supervisorContact}
                                onChange={(e) => this.setState({supervisorContact: e.target.value})}
                            />
                        </fieldset>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button size="small"
                                    use="primary"
                                    type="submit"
                                    style={{margin: "1.5rem 0 0 0"}}
                            >
                                Добавить
                            </Button>
                        </div>
               
                    </form>
                </div>
            </Modal>
        );
    }
}
