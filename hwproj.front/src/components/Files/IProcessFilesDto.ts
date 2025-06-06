import { CourseUnitType } from "./CourseUnitType";

export interface IProcessFilesDto {
    courseId: number,
    courseUnitType: CourseUnitType,
    courseUnitId: number,
    deletingFileIds: number[],
    newFiles: File[]
}