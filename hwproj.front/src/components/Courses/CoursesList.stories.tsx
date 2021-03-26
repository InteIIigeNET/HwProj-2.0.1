import * as React from "react";
import { storiesOf } from "@storybook/react";
import { CourseViewModel } from "../../api/courses/api";
import { CoursesList } from "./CoursesList";

const data : CourseViewModel[] = [];

storiesOf("Courses list page", module)
  .add("simple", () =>
    <CoursesList courses={data}/>
    );