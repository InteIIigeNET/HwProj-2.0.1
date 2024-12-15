import * as React from "react";
import { storiesOf } from "@storybook/react";
import { CourseViewModel } from "../../api/";
import { CoursesList } from "./CoursesList";
import {useNavigate} from "react-router-dom";

const data : CourseViewModel[] = [];

const navigate = useNavigate();

storiesOf("Courses list page", module)
  .add("simple", () =>
    <CoursesList courses={data} isExpert={false} navigate={navigate} />
    );