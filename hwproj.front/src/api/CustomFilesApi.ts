import {BaseAPI} from "./api";

export default class CustomFilesApi extends BaseAPI {
    public uploadFile = async (file: File, courseId: number, homeworkId: number) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId.toString());
        formData.append('homeworkId', homeworkId.toString());

        const response = await fetch(this.basePath + '/api/Files/upload', {
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

    public getDownloadFileLink = async (fileKey: string) => {
        // Необходимо, чтобы символы & и др. не влияли на обработку запроса на бэкенде
        const encodedFileKey = encodeURIComponent(fileKey);
        const response = await fetch(this.basePath + `/api/Files/downloadLink?key=${encodedFileKey}`, {
            method: 'GET',
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

    public deleteFileByKey = async (fileKey: string) => {
        // Необходимо, чтобы символы & и др. не влияли на обработку запроса на бэкенде
        const encodedFileKey = encodeURIComponent(fileKey);
        const response = await fetch(this.basePath + `/api/Files?key=${encodedFileKey}`, {
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