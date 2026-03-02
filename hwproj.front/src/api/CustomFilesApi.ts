import {BaseAPI, ScopeDTO} from "./api";
import { IProcessFilesDto } from "../components/Files/IProcessFilesDto";

export default class CustomFilesApi extends BaseAPI {
    public processFiles = async (processFilesDto: IProcessFilesDto) => {
        const formData = new FormData();

        // Добавляем идентификаторы удаляемых файлов
        processFilesDto.deletingFileIds.forEach((fileId) => {
            formData.append(`DeletingFileIds`, fileId.toString());
        });

        // Добавляем новые файлы
        processFilesDto.newFiles.forEach((file) => {
            formData.append(`NewFiles`, file);
        });
        
        // Добавляем информацию о области нахождения файлов (Scope)
        formData.append('FilesScope.CourseId', processFilesDto.courseId.toString());
        formData.append('FilesScope.CourseUnitType', processFilesDto.courseUnitType.toString());
        formData.append('FilesScope.CourseUnitId', processFilesDto.courseUnitId.toString());

        const response = await fetch(this.basePath + '/api/Files/process', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': this.getApiKeyValue(),
            },
        });
        
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            throw response;
        }
    }

    public getDownloadFileLink = async (fileKey: number) => {
        const response = await fetch(this.basePath + `/api/Files/downloadLink?fileId=${fileKey}`, {
            method: 'GET',
            headers: {
                'Authorization': this.getApiKeyValue(),
            }
        });
        
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            throw response;
        }
    }

    public deleteFileByKey = async (courseId: number, fileId: number) => {
        const response = await fetch(this.basePath + `/api/Files?courseId=${courseId}&key=${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.getApiKeyValue(),
            },
        });

        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            throw response;
        }
    }

    private getApiKeyValue = (): string => {
        if (this.configuration?.apiKey == undefined) {
            throw new Error("Не задана конфигурация CustomFilesApi");
        }
        
        return typeof this.configuration.apiKey === 'function'
            ? this.configuration.apiKey('Authorization')
            : this.configuration.apiKey;
    }
}
