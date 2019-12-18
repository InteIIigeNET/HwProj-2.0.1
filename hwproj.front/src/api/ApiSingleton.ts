import { AccountApi } from "./auth/api";
import { CoursesApi } from "./courses/api";
import { HomeworksApi, TasksApi } from "./homeworks/api";
import { SolutionsApi } from "./solutions/api"
import AuthService from "../services/AuthService";

class Api {
    readonly accountApi: AccountApi;
    readonly coursesApi: CoursesApi;
    readonly homeworksApi: HomeworksApi;
    readonly tasksApi: TasksApi;
    readonly solutionsApi: SolutionsApi;
    readonly authService: AuthService;

    constructor(accountApi: AccountApi, coursesApi: CoursesApi, homeworksApi: HomeworksApi,
        tasksApi: TasksApi, solutionsApi: SolutionsApi, authService: AuthService) {
        this.accountApi = accountApi;
        this.coursesApi = coursesApi;
        this.homeworksApi = homeworksApi;
        this.tasksApi = tasksApi;
        this.solutionsApi = solutionsApi;
        this.authService = authService;
    }
}

const basePath = "http://localhost:5000";

let ApiSingleton : Api;
ApiSingleton = new Api(new AccountApi({basePath: basePath}), 
new CoursesApi({basePath: basePath}), 
new HomeworksApi({basePath: basePath}), 
new TasksApi({basePath: basePath}), 
new SolutionsApi({basePath: basePath}), 
new AuthService);
export default ApiSingleton;
