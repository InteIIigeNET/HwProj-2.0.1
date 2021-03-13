import React from "react";
import { Typography } from "@material-ui/core";
import { Link, Toast } from "@skbkontur/react-ui";

// -_-  ...

interface Props {
  data: {
    teacher?: string;
    teacherContacts?: string;
    description?: string;
  };
}

function copyEmailAddress(event?: React.MouseEvent<HTMLAnchorElement>) {
  navigator.clipboard.writeText(event!.currentTarget.textContent!).then(() => {
    Toast.push("Адрес скопирован");
  });
}

function Description(props: Props) {
  return (
    <div className="descriptionDetail">
      <Typography variant="h6">{props.data.description}</Typography>
      <hr />
      <Typography variant="subtitle2">
        Преподаватель: {props.data.teacher},{" "}
        <Link use="default" onClick={copyEmailAddress}>
          {props.data.teacherContacts}
        </Link>
      </Typography>
    </div>
  );
}

export default Description;
