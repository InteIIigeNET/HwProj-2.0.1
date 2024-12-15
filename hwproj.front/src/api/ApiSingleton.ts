import {
    AccountApi,
    ExpertsApi,
    NotificationsApi,
    CoursesApi,
    SolutionsApi,
    HomeworksApi,
    TasksApi,
    StatisticsApi,
    SystemApi
} from ".";
import AuthService from "../services/AuthService";


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
        authService: AuthService
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
    }
}

const basePath = process.env.REACT_APP_BASE_PATH!
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
);
export default ApiSingleton;
