import * as React from "react";
import { storiesOf } from "@storybook/react";
import { CoursesList } from "./CoursesList";

const data = [{id: 0, name: "Programming", groupName: "241", }];

storiesOf("Courses list page", module)
  .add("simple", () =>
    <CoursesList courses={data}/>
    );