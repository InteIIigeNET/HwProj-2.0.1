import {IFileInfo} from "components/Files/IFileInfo";
import {FileInfoDTO} from "@/api"
import { CourseUnitType } from "../Files/CourseUnitType";
import { FileStatus } from "../Files/FileStatus";

export default class FileInfoConverter {
    public static fromFileInfoDTO(fileInfoDto: FileInfoDTO): IFileInfo {
        if (fileInfoDto.name === undefined
            || fileInfoDto.status === undefined
            || fileInfoDto.sizeInBytes === undefined) {
            throw new Error("Обнаружено пустое поле объекта FileInfoDTO")
        }

        return {
            id: fileInfoDto.id,
            status: fileInfoDto.status as FileStatus,
            name: fileInfoDto.name,
            sizeInBytes: fileInfoDto.sizeInBytes,
            courseUnitType: fileInfoDto.courseUnitType as CourseUnitType,
            courseUnitId: fileInfoDto.courseUnitId!
        };
    }
    
    public static fromFileInfoDTOArray(fileInfoDtos: FileInfoDTO[]): IFileInfo[] {
        return fileInfoDtos.map(fileInfoDto => this.fromFileInfoDTO(fileInfoDto));
    }

    public static getCourseUnitFilesInfo(filesInfo: FileInfoDTO[], courseUnitType: CourseUnitType, courseUnitId: number): IFileInfo[] {
        return FileInfoConverter.fromFileInfoDTOArray(
            filesInfo.filter(filesInfo => filesInfo.courseUnitType === courseUnitType
                && filesInfo.courseUnitId === courseUnitId)
        )
    }
}