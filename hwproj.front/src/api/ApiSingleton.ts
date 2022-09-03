import { AccountApi, NotificationsApi, CoursesApi, SolutionsApi, HomeworksApi, TasksApi, StatisticsApi} from ".";
import { Configuration } from './configuration';
import AuthService from "../services/AuthService";
import Utils from "../services/Utils";


class Api {
  auth = new AuthService()
  readonly accountApi: AccountApi;
  readonly coursesApi: CoursesApi;
  readonly solutionsApi: SolutionsApi;
  readonly notificationsApi: NotificationsApi;
  readonly homeworksApi: HomeworksApi;
  readonly tasksApi: TasksApi;
  readonly statisticsApi: StatisticsApi;
  readonly authService: AuthService;
  readonly utils: Utils

  constructor(
    accountApi: AccountApi,
    coursesApi: CoursesApi,
    solutionsApi: SolutionsApi,
    notificationsApi: NotificationsApi,
    homeworksApi: HomeworksApi,
    tasksApi: TasksApi,
    statisticsApi: StatisticsApi,
    authService: AuthService,
    utils: Utils
  ) {
    this.accountApi = accountApi;
    this.coursesApi = coursesApi;
    this.solutionsApi = solutionsApi;
    this.notificationsApi = notificationsApi;
    this.homeworksApi = homeworksApi;
    this.tasksApi = tasksApi;
    this.statisticsApi = statisticsApi;
    this.authService = authService;
    this.utils = utils;
  }
}

const basePath = process.env.REACT_APP_BASE_PATH!
const authService = new AuthService()

let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new CoursesApi({ basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new SolutionsApi({ basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new NotificationsApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new HomeworksApi({basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new TasksApi({ basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  new StatisticsApi({ basePath: basePath, apiKey: () => "Bearer " + authService.getToken()! }),
  authService,
  new Utils(),
);
export default ApiSingleton;
