import {
    AccountApi,
    ExpertsApi,
    NotificationsApi,
    CoursesApi,
    SolutionsApi,
    HomeworksApi,
    TasksApi,
    StatisticsApi,
    SystemApi,
    FilesApi
} from ".";
import AuthService from "../services/AuthService";
import CustomFilesApi from "./CustomFilesApi";

class Api {
    auth = new AuthService()
    readonly accountApi: AccountApi;
    readonly expertsApi: ExpertsApi;
    readonly coursesApi: CoursesApi;
    readonly solutionsApi: SolutionsApi;
    readonly notificationsApi: NotificationsApi;
    readonly homeworksApi: HomeworksApi;
    readonly tasksApi: TasksApi;
    readonly statisticsApi: StatisticsApi;
    readonly systemApi: SystemApi;
    readonly authService: AuthService;
    readonly customFilesApi: CustomFilesApi;
    readonly filesApi: FilesApi;

    constructor(
        accountApi: AccountApi,
        expertsApi: ExpertsApi,
        coursesApi: CoursesApi,
        solutionsApi: SolutionsApi,
        notificationsApi: NotificationsApi,
        homeworksApi: HomeworksApi,
        tasksApi: TasksApi,
        statisticsApi: StatisticsApi,
        systemApi: SystemApi,
        authService: AuthService,
        customFilesApi: CustomFilesApi,
        filesApi: FilesApi
    ) {
        this.accountApi = accountApi;
        this.expertsApi = expertsApi;
        this.coursesApi = coursesApi;
        this.solutionsApi = solutionsApi;
        this.notificationsApi = notificationsApi;
        this.homeworksApi = homeworksApi;
        this.tasksApi = tasksApi;
        this.statisticsApi = statisticsApi;
        this.systemApi = systemApi;
        this.authService = authService;
        this.customFilesApi = customFilesApi;
        this.filesApi = filesApi;
    }
}

const basePath = import.meta.env.VITE_BASE_PATH
const authService = new AuthService()

let ApiSingleton: Api;
ApiSingleton = new Api(
    new AccountApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new ExpertsApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new CoursesApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new SolutionsApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new NotificationsApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new HomeworksApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new TasksApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new StatisticsApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new SystemApi({basePath: basePath}),
    authService,
    new CustomFilesApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!}),
    new FilesApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()!})
);
export default ApiSingleton;