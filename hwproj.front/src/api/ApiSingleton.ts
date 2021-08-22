import { Configuration } from './configuration';
import { AccountApi, NotificationsApi, CoursesApi, SolutionsApi, HomeworksApi, TasksApi } from ".";
import AuthService from "../services/AuthService";


class Api {
  auth = new AuthService()
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

const currentToken = (new AuthService()).getToken()
const token = typeof currentToken === "string"
  ? currentToken
  : undefined
const basePath = "http://localhost:5000";

let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath }),
  new CoursesApi({ basePath: basePath, accessToken: token}),
  new SolutionsApi({ basePath: basePath }),
  new NotificationsApi({ basePath: basePath }),
  new HomeworksApi({basePath: basePath }),
  new TasksApi({ basePath: basePath }),
  new AuthService(),
);
export default ApiSingleton;
