import {Dispatch, SetStateAction} from "react"
import {CoursePreviewView} from "api";

export enum CreateCourseStep {
  SelectBaseCourseStep = 0,
  AddCourseInfoStep = 1,
}

export const stepLabels = [
  "Выберите шаблон",
  "Заполните данные",
]

export const stepIsOptional = (step: CreateCourseStep) =>
  step === CreateCourseStep.SelectBaseCourseStep

export interface ICreateCourseState {
  activeStep: CreateCourseStep;
  skippedSteps: Set<CreateCourseStep>;

  baseCourses?: CoursePreviewView[];
  baseCourseIndex?: number;

  courseName: string;
  groupName: string;

  courseIsLoading: boolean;
}

export interface IStepComponentProps {
  state: ICreateCourseState;
  setState: Dispatch<SetStateAction<ICreateCourseState>>;
}
