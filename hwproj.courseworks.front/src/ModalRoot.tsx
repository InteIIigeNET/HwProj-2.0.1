import React from "react";
import { ModalContext } from "./App";

import InviteLecturerModal from "modals/InviteLecturer";
import CourseWorkCreateModal from "modals/CourseWorkCreate";

export default function ModalRoot() {
  return (
    <ModalContext.Consumer>
      {(value) => {
        switch (value.state.type) {
          case "INVITE_LECTURER":
            return (
              <InviteLecturerModal
                open={true}
                onClose={value.closeModal}
                {...value.state.props}
              />
            );
          case "COURSE_WORK_CREATE":
            return (
              <CourseWorkCreateModal open={true} onClose={value.closeModal} />
            );
        }
      }}
    </ModalContext.Consumer>
  );
}
