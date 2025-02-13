import {IFileInfo} from "components/Files/IFileInfo";
import {CourseFileInfoDTO, HomeworkFileInfoDTO} from "../../api"

export default class FileInfoConverter {
    public static FromHomeworkFileInfo(homeworkFileInfo: HomeworkFileInfoDTO): IFileInfo {
        if (homeworkFileInfo.name === undefined
            || homeworkFileInfo.size === undefined
            || homeworkFileInfo.key === undefined) {
            throw new Error("Обнаружено пустое поле объекта HomeworkFileInfoDTO")
        }

        return {
            name: homeworkFileInfo.name,
            sizeInBytes: homeworkFileInfo.size,
            s3Key: homeworkFileInfo.key
        };
    }

    public static FromCourseFileInfo(courseFileInfo: CourseFileInfoDTO): IFileInfo {
        if (courseFileInfo.name === undefined
            || courseFileInfo.size === undefined
            || courseFileInfo.key === undefined
            || courseFileInfo.homeworkId === undefined) {
            throw new Error("Обнаружено пустое поле объекта CourseFileInfoDTO")
        }

        return {
            name: courseFileInfo.name,
            sizeInBytes: courseFileInfo.size,
            s3Key: courseFileInfo.key
        };
    }

    public static FromHomeworkFileInfoArray(homeworkFileInfoDtos: HomeworkFileInfoDTO[]): IFileInfo[] {
        return homeworkFileInfoDtos.map(homeworkFileInfo => this.FromHomeworkFileInfo(homeworkFileInfo));
    }

    public static FromCourseFileInfoArray(courseFileInfoDtos: CourseFileInfoDTO[]): IFileInfo[] {
        return courseFileInfoDtos.map(courseFileInfo => this.FromCourseFileInfo(courseFileInfo));
    }

    public static GetHomeworkFilesInfo(courseFilesInfo: CourseFileInfoDTO[], homeworkId: number): IFileInfo[] {
        return FileInfoConverter.FromCourseFileInfoArray(
            courseFilesInfo.filter(
                courseFilesInfo => courseFilesInfo.homeworkId === homeworkId))
    }
}