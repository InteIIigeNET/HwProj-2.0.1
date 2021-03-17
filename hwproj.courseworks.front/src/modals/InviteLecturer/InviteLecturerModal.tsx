import React from "react";
import { Modal, Typography } from "@material-ui/core";
import InviteLecturerForm from "./InviteLecturerForm";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<any>;
}

export default function InviteLecturerModal(props: ModalProps) {
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
          Пригласить преподавателя
        </Typography>
        <InviteLecturerForm
          onSubmit={props.onSubmit}
          onSuccessSubmit={props.onClose}
        />
      </div>
    </Modal>
  );
}
