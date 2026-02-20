import ApiSingleton from "api/ApiSingleton";
import { enqueueSnackbar } from "notistack";
import ErrorsHandler from "./ErrorsHandler";
import { IProcessFilesDto } from "../Files/IProcessFilesDto";

export default class ProcessFilesUtils {
    public static async processFilesWithErrorsHadling(processFilesDto: IProcessFilesDto) {
        try {
            await ApiSingleton.customFilesApi.processFiles(processFilesDto);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            var errorDescription = errors[0] == undefined ? `` : `${errors[0]}`
            if (errorDescription.length > 300) errorDescription = ``
            enqueueSnackbar(`Проблема при обработке файлов ${errorDescription}`, {
                variant: "warning",
                autoHideDuration: 2000
            });
        }
    }
}