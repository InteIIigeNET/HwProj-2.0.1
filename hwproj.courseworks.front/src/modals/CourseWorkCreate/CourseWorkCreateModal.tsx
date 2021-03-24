import React from "react";
import { Modal, TextField, Typography } from "@material-ui/core";
import InviteLecturerForm from "../InviteLecturer/InviteLecturerForm";

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

export default class CourseWorkCreateModalprops extends React.Component<ModalProps, IState> {
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
  
  render() {
    return (
        <Modal
            disableAutoFocus
            disableEnforceFocus
            open={this.props.open}
            onClose={this.props.onClose}
        >
          <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "5px",
              }}
          >
            <Typography variant="h6" gutterBottom>
              Добавить курсовую работу
            </Typography>
            <form action="">
              <TextField
                  required
                  type="text"
                  label="Название курсовой"
                  variant="outlined"
                  margin="normal"
                  name={this.state.title}
                  onChange={(e) => this.setState({ title: e.target.value })}
              />
              <br />
              <TextField
                  required
                  type="text"
                  label="Название курсовой"
                  variant="outlined"
                  margin="normal"
                  name={this.state.title}
                  onChange={(e) => this.setState({ title: e.target.value })}
              />
          </div>
        </Modal>
  );
  }
  
}
