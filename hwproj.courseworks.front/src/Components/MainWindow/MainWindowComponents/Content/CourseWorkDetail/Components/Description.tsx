import React from "react";
import { Typography } from "@material-ui/core";
import { Link, Toast } from "@skbkontur/react-ui";

interface Idata {
  title?: string;
  teacher?: string;
  deadline?: string;
  scienceArea?: string;
  description?: string;
  reportFile?: string;
  presentationFile?: string;
  consultantReportFile?: string;
  link?: string;
  teacherContacts?: string;
  consultant?: string;
  consultantContacts?: string;
  critic?: string;
  status?: string;
  teacherReview?: string;
  student?: string;
  course?: number;
  id?: number;
}

interface Props {
  data: Idata;
  role?: string;
}

function copyEmailAddress(event?: React.MouseEvent<HTMLAnchorElement>) {
  navigator.clipboard.writeText(event!.currentTarget.textContent!).then(() => {
    Toast.push("Адрес скопирован");
  });
}

function Description(props: Props) {
  switch (props.role) {
    case "student":
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
          <Typography variant="overline">
            Дедлайн: {props.data.deadline}
          </Typography>
          {props.data.consultant !== "" ? (
            <Typography variant="subtitle1">
              Консультант: {props.data.consultant},{" "}
              <Link use="default" onClick={copyEmailAddress}>
                {props.data.consultantContacts}
              </Link>
            </Typography>
          ) : null}
          {props.data.critic !== "" ? (
            <Typography variant="subtitle1">
              Рецензент: {props.data.critic}
            </Typography>
          ) : null}
          <Typography variant="button">
            Статус курсовой: {props.data.status}
          </Typography>
        </div>
      );
    case "teacher":
      return (
        <div className="descriptionDetail">
          <Typography variant="h6">{props.data.description}</Typography>
          <hr />
          <Typography variant="h5">Студент: {props.data.student}</Typography>
          <Typography variant="overline">
            Дедлайн: {props.data.deadline}
          </Typography>
          {props.data.consultant !== "" ? (
            <Typography variant="subtitle1">
              Консультант: {props.data.consultant},{" "}
              <Link use="default" onClick={copyEmailAddress}>
                {props.data.consultantContacts}
              </Link>
            </Typography>
          ) : null}
          {props.data.critic !== "" ? (
            <Typography variant="subtitle1">
              Рецензент: {props.data.critic}
            </Typography>
          ) : null}
          <Typography variant="button">
            Статус курсовой: {props.data.status}
          </Typography>
        </div>
      );
  }
  return null;
}

export default Description;
