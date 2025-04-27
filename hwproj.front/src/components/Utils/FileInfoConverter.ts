import {IFileInfo} from "components/Files/IFileInfo";
import {FileInfoDTO} from "@/api"

export default class FileInfoConverter {
    public static fromFileInfoDTO(fileInfoDto: FileInfoDTO): IFileInfo {
        if (fileInfoDto.name === undefined
            || fileInfoDto.size === undefined
            || fileInfoDto.key === undefined
            || fileInfoDto.homeworkId === undefined) {
            throw new Error("Обнаружено пустое поле объекта FileInfoDTO")
        }

        return {
            name: fileInfoDto.name,
            size: fileInfoDto.size,
            key: fileInfoDto.key,
            homeworkId: fileInfoDto.homeworkId,
        };
    }

    public static fromFileInfoDTOArray(fileInfoDtos: FileInfoDTO[]): IFileInfo[] {
        return fileInfoDtos.map(fileInfoDto => this.fromFileInfoDTO(fileInfoDto));
    }

    public static getHomeworkFilesInfo(filesInfo: FileInfoDTO[], homeworkId: number): IFileInfo[] {
        return FileInfoConverter.fromFileInfoDTOArray(
            filesInfo.filter(filesInfo => filesInfo.homeworkId === homeworkId)
        )
    }
}