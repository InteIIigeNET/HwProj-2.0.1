import {Dispatch, SetStateAction} from "react"
import {CoursePreviewView} from "api";

export enum CreateCourseStep {
    SelectBaseCourseStep = 0,
    AddCourseInfoStep = 1
}

export const stepLabels = [
    "Выберите шаблон",
    "Заполните данные",
]

export const stepIsOptional = (step: CreateCourseStep) =>
    step === CreateCourseStep.SelectBaseCourseStep

export interface ICreateCourseState {
    activeStep: CreateCourseStep;
    completedSteps: Set<CreateCourseStep>;

    baseCourses?: CoursePreviewView[];
    selectedBaseCourse?: CoursePreviewView;

    courseName: string;

    programNames: string[];
    programName: string;

    groupNames: string[];
    selectedGroups: string[];
    isGroupFromList: boolean;
    fetchStudents: boolean;

    fetchingGroups: boolean;
    isOpen: boolean;
    courseIsLoading: boolean;
}

export interface IStepComponentProps {
    state: ICreateCourseState;
    setState: Dispatch<SetStateAction<ICreateCourseState>>;
}