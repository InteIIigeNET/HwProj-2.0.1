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

function getApiBase(): string {
    const {protocol, hostname, port} = window.location;

    const isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1";

    const effectivePort = isLocal ? "5000" : (port || "");

    return `${protocol}//${hostname}${effectivePort ? `:${effectivePort}` : ""}`
}

let skipRedirect = false;

export async function runWithoutAuthRedirect(functionToRun: () => Promise<any>) {
    skipRedirect = true;
    try {
        return await functionToRun();
    } finally {
        skipRedirect = false;
    }
}

const cookieFetch = async (url: string, init: any) => {
    const response = await fetch(url, {
        ...init,
        credentials: "include"
    });

    const path = window.location.pathname;

    if (response.status === 401 &&
        !path.includes("login") &&
        !path.includes("register") &&
        !skipRedirect){
        window.location.href = `/login?returnUrl=${window.location.pathname}`;
    }

    return response;
}

const basePath = getApiBase()
const authService = new AuthService()
const apiConfig = {
    basePath: basePath,
}

let ApiSingleton: Api;
ApiSingleton = new Api(
    new AccountApi(apiConfig, undefined, cookieFetch),
    new ExpertsApi(apiConfig, undefined, cookieFetch),
    new CoursesApi(apiConfig, undefined, cookieFetch),
    new SolutionsApi(apiConfig, undefined, cookieFetch),
    new NotificationsApi(apiConfig, undefined, cookieFetch),
    new HomeworksApi(apiConfig, undefined, cookieFetch),
    new TasksApi(apiConfig, undefined, cookieFetch),
    new StatisticsApi(apiConfig, undefined, cookieFetch),
    new SystemApi(apiConfig, undefined, cookieFetch),
    authService,
    new CustomFilesApi(apiConfig, undefined, cookieFetch),
    new FilesApi(apiConfig, undefined, cookieFetch)
);
export default ApiSingleton;