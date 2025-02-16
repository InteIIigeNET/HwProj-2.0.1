import ApiSingleton from "api/ApiSingleton";
import { IFileInfo } from "components/Files/IFileInfo";
import { enqueueSnackbar } from "notistack";
import ErrorsHandler from "./ErrorsHandler";

export default class UpdateFilesUtils {
    public static async uploadFileWithErrorsHadling(file: File, courseId: number, homeworkId: number) {
        try {
            await ApiSingleton.customFilesApi.uploadFile(file, courseId, homeworkId);
        } catch (e) {
            const response = e as Response
            let errors: string[];
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const json = await response.json();
                errors = [json.File?.[0]] || [json.message];
            } else {
                errors = await ErrorsHandler.getErrorMessages(response);
            }

            enqueueSnackbar(`Проблема при загрузке файла ${file.name}: ${errors[0]}`, {
                variant: "error",
                autoHideDuration: 5000
            });
        }
    }

    public static async deleteFileWithErrorsHadling(file: IFileInfo) {
        try {
            await ApiSingleton.customFilesApi.deleteFileByKey(file.key!);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            enqueueSnackbar(`Проблема при удалении файла ${file.name}: ${errors[0]}`, {
                variant: "error",
                autoHideDuration: 5000
            });
        }
    }
}