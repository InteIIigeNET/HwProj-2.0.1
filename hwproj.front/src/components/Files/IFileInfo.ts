import { CourseUnitType } from "./CourseUnitType";
import { FileStatus } from "./FileStatus";

export interface IFileInfo {
    id?: number;
    file?: File;
    type?: string;
    status: FileStatus;
    name: string;
    sizeInBytes: number;
    courseUnitType: CourseUnitType,
    courseUnitId: number;
}
