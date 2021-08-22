import { AccountApi, NotificationsApi, CoursesApi, SolutionsApi, HomeworksApi, TasksApi } from ".";

import AuthService from "../services/AuthService";

class Api {
  readonly accountApi: AccountApi;
  readonly coursesApi: CoursesApi;
  readonly solutionsApi: SolutionsApi;
  readonly notificationsApi: NotificationsApi;
  readonly homeworksApi: HomeworksApi;
  readonly tasksApi: TasksApi;
  readonly authService: AuthService;

  constructor(
    accountApi: AccountApi,
    coursesApi: CoursesApi,
    solutionsApi: SolutionsApi,
    notificationsApi: NotificationsApi,
    homeworksApi: HomeworksApi,
    tasksApi: TasksApi,
    authService: AuthService,
  ) {
    this.accountApi = accountApi;
    this.coursesApi = coursesApi;
    this.solutionsApi = solutionsApi;
    this.notificationsApi = notificationsApi;
    this.homeworksApi = homeworksApi;
    this.tasksApi = tasksApi;
    this.authService = authService;
  }
}

const basePath = "http://localhost:5000";

const aService = new AuthService();
let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  new CoursesApi({ basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  new SolutionsApi({ basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  new NotificationsApi({basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  new HomeworksApi({basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  new TasksApi({ basePath: basePath, apiKey: () => "Bearer " + aService.getToken()! }),
  aService,
);
export default ApiSingleton;
