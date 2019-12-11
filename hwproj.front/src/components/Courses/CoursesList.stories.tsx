import * as React from "react";
import { storiesOf } from "@storybook/react";
import { CourseViewModel } from "../../api/courses/api";
import { CoursesList } from "./CoursesList";

const data : CourseViewModel[] = [{id: 0, name: "Programming", groupName: "241", }];

storiesOf("Courses list page", module)
  .add("simple", () =>
    <CoursesList courses={data}/>
    );