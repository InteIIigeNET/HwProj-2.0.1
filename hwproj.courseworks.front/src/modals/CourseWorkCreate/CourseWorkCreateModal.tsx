import React from "react";
import { Modal, Typography } from "@material-ui/core";
import InviteLecturerForm from "../InviteLecturer/InviteLecturerForm";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CourseWorkCreateModal(props: ModalProps) {
  return (
    <Modal
      disableAutoFocus
      disableEnforceFocus
      open={props.open}
      onClose={props.onClose}
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
          Create a new Course Work
        </Typography>
      </div>
    </Modal>
  );
}
