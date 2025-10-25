import {useState, useEffect, useRef} from "react";
import {ICourseFilesState} from "@/components/Courses/Course";
import {FileInfoDTO, ScopeDTO} from "@/api";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {enqueueSnackbar} from "notistack";
import ApiSingleton from "@/api/ApiSingleton";
import {FileStatus} from "@/components/Files/FileStatus";
import ErrorsHandler from "@/components/Utils/ErrorsHandler";

export const FilesAccessService = (courseId: number, isOwner?: boolean) => {
    const intervalsRef = useRef<Record<number, {
        interval: NodeJS.Timeout | number,
        timeout: NodeJS.Timeout | number;
    }>>({});

    const [courseFilesState, setCourseFilesState] = useState<ICourseFilesState>({
        processingFilesState: {},
        courseFiles: []
    })

    // Останавливаем все активные интервалы при размонтировании
    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach(({interval, timeout}) => {
                clearInterval(interval);
                clearTimeout(timeout);
            });
            intervalsRef.current = {};
        };
    }, []);

    const stopProcessing = (courseUnitId: number) => {
        if (intervalsRef.current[courseUnitId]) {
            const {interval, timeout} = intervalsRef.current[courseUnitId];
            clearInterval(interval);
            clearTimeout(timeout);
            delete intervalsRef.current[courseUnitId];
        }
    };

    const setCommonLoading = (courseUnitId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            processingFilesState: {
                ...prev.processingFilesState,
                [courseUnitId]: {isLoading: true}
            }
        }));
    }

    const unsetCommonLoading = (courseUnitId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            processingFilesState: {
                ...prev.processingFilesState,
                [courseUnitId]: {isLoading: false}
            }
        }));
    }

    const updCourseFiles = async () => {
        let courseFilesInfo = [] as FileInfoDTO[]
        try {
            courseFilesInfo = isOwner
                ? await ApiSingleton.filesApi.filesGetFilesInfo(+courseId!)
                : await ApiSingleton.filesApi.filesGetUploadedFilesInfo(+courseId!)
        } catch (e) {
            const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
            enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 1990});
        }
        setCourseFilesState(prevState => ({
            ...prevState,
            courseFiles: courseFilesInfo
        }))
    }

    useEffect(() => {
        updCourseFiles();
    }, [courseId, isOwner]);

    const updateCourseUnitFilesInfo = (files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        setCourseFilesState(prev => ({
            ...prev,
            courseFiles: [
                ...prev.courseFiles.filter(
                    f => !(f.courseUnitType === unitType && f.courseUnitId === unitId)),
                ...files
            ]
        }));
    };

    // Запускает получение информации о файлах элемента курса с интервалом в 1 секунду и 5 попытками
    const updCourseUnitFiles =
        (courseUnitId: number,
         courseUnitType: CourseUnitType,
         previouslyExistingFilesCount: number,
         waitingNewFilesCount: number,
         deletingFilesIds: number[]
        ) => {
            // Очищаем предыдущие таймеры
            stopProcessing(courseUnitId);

            let attempt = 0;
            const maxAttempts = 10;
            let delay = 1000; // Начальная задержка 1 сек

            const scopeDto: ScopeDTO = {
                courseId: +courseId!,
                courseUnitType: courseUnitType,
                courseUnitId: courseUnitId
            }

            const fetchFiles = async () => {
                if (attempt >= maxAttempts) {
                    stopProcessing(courseUnitId);
                    enqueueSnackbar("Превышено допустимое количество попыток получения информации о файлах", {
                        variant: "warning",
                        autoHideDuration: 2000
                    });
                    return;
                }

                attempt++;
                try {
                    const files = await ApiSingleton.filesApi.filesGetStatuses(scopeDto);
                    console.log(`Попытка ${attempt}:`, files);

                    // Первый вариант для явного отображения всех файлов
                    if (waitingNewFilesCount === 0
                        && files.filter(f => f.status === FileStatus.ReadyToUse).length === previouslyExistingFilesCount - deletingFilesIds.length) {
                        updateCourseUnitFilesInfo(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                        unsetCommonLoading(courseUnitId)
                    }

                    // Второй вариант для явного отображения всех файлов
                    if (waitingNewFilesCount > 0
                        && files.filter(f => !deletingFilesIds.some(dfi => dfi === f.id)).length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount) {
                        updateCourseUnitFilesInfo(files, scopeDto.courseUnitType as CourseUnitType, scopeDto.courseUnitId!)
                        unsetCommonLoading(courseUnitId)
                    }

                    // Условие прекращения отправки запросов на получения записей файлов
                    if (files.length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount
                        && files.every(f => f.status !== FileStatus.Uploading && f.status !== FileStatus.Deleting)) {
                        stopProcessing(courseUnitId);
                        unsetCommonLoading(courseUnitId)
                    }

                } catch (error) {
                    console.error(`Ошибка (попытка ${attempt}):`, error);
                }
            }
            // Создаем интервал с задержкой
            const interval = setInterval(fetchFiles, delay);

            // Создаем таймаут для автоматической остановки
            const timeout = setTimeout(() => {
                stopProcessing(courseUnitId);
                unsetCommonLoading(courseUnitId);
            }, 10000);

            // Сохраняем интервал и таймаут в ref
            intervalsRef.current[courseUnitId] = {interval, timeout};

            // Сигнализируем о начале загрузки через состояние
            setCommonLoading(courseUnitId);
        }

    return {
        courseFilesState,
        updCourseFiles,
        updCourseUnitFiles,
    }
}
