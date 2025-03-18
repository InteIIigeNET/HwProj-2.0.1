import ApiSingleton from "api/ApiSingleton";
import { IFileInfo } from "components/Files/IFileInfo";
import { enqueueSnackbar } from "notistack";
import ErrorsHandler from "./ErrorsHandler";

export default class UpdateFilesUtils {
    public static async uploadFileWithErrorsHadling(file: File, courseId: number, homeworkId: number) {
        try {
            await ApiSingleton.customFilesApi.uploadFile(file, courseId, homeworkId);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            const errorDescription = errors[0] == undefined ? `: ${errors[0]}` : ''
            enqueueSnackbar(`Проблема при загрузке файла ${file.name, errorDescription}`, {
                variant: "error",
                autoHideDuration: 3000
            });
        }
    }

    public static async deleteFileWithErrorsHadling(courseId: number, file: IFileInfo) {
        try {
            await ApiSingleton.customFilesApi.deleteFileByKey(courseId, file.key!);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            const errorDescription = errors[0] == undefined ? `: ${errors[0]}` : ''
            enqueueSnackbar(`Проблема при удалении файла ${file.name, errorDescription}`, {
                variant: "error",
                autoHideDuration: 3000
            });
        }
    }
}