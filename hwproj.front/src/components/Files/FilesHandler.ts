import {IFileInfo} from "@/components/Files/IFileInfo";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import ApiSingleton from "@/api/ApiSingleton";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {useState} from "react";
import {enqueueSnackbar} from "notistack";

export interface IEditFilesState {
    initialFilesInfo: IFileInfo[]
    selectedFilesInfo: IFileInfo[]
    isLoadingInfo: boolean
}

export const FilesHandler = (selectedFilesInfo: IFileInfo[]) => {
    const [filesState, setFilesState] = useState<IEditFilesState>({
        initialFilesInfo: selectedFilesInfo.filter(x => x.id !== undefined),
        selectedFilesInfo: selectedFilesInfo,
        isLoadingInfo: false
    });

    const handleFilesChange = async (courseId: number,
        courseUnitType: CourseUnitType,
        courseUnitId: number,
        onStartProcessing: (courseUnitId: number,
            courseUnitType: CourseUnitType,
            previouslyExistingFilesCount: number,
            waitingNewFilesCount: number,
            deletingFilesIds: number[]) => void,
        onComplete: () => void,
    ) => {
        // Если какие-то файлы из ранее добавленных больше не выбраны, их потребуется удалить
        const deletingFileIds = filesState.initialFilesInfo.filter(initialFile =>
            initialFile.id && !filesState.selectedFilesInfo.some(sf => sf.id === initialFile.id))
            .map(fileInfo => fileInfo.id!)

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, они новые
        const newFiles = filesState.selectedFilesInfo.filter(selectedFile =>
            selectedFile.file && selectedFile.id == undefined).map(fileInfo => fileInfo.file!)

        // Если требуется, отправляем запрос на обработку файлов
        if (deletingFileIds.length + newFiles.length > 0) {
            try {
                await ApiSingleton.customFilesApi.processFiles({
                    courseId: courseId!,
                    courseUnitType: courseUnitType,
                    courseUnitId: courseUnitId!,
                    deletingFileIds,
                    newFiles,
                });
            } catch (e) {
                const errors = await ErrorsHandler.getErrorMessages(e as Response);
                enqueueSnackbar(errors[0], {
                    variant: "warning",
                    autoHideDuration: 2000
                });
            }
        }
        if (deletingFileIds.length === 0 && newFiles.length === 0) {
            onComplete();
        } else {
            try {
                onComplete();
                onStartProcessing(
                    courseUnitId!,
                    courseUnitType,
                    filesState.initialFilesInfo.length,
                    newFiles.length,
                    deletingFileIds,
                );
            } catch (e) {
                const responseErrors = await ErrorsHandler.getErrorMessages(e as Response);
                enqueueSnackbar(responseErrors[0], {
                    variant: "warning",
                    autoHideDuration: 4000
                });
                onComplete();
            }
        }
    }
    return {
        filesState,
        setFilesState,
        handleFilesChange,
    }
}
