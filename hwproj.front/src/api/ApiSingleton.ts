import { AccountApi } from "./auth";
import { CoursesApi } from "./courses";
import { HomeworksApi, TasksApi } from "./homeworks";
import { SolutionsApi } from "./solutions";
import AuthService from "../services/AuthService";

class Api {
  readonly accountApi: AccountApi;
  readonly coursesApi: CoursesApi;
  readonly homeworksApi: HomeworksApi;
  readonly tasksApi: TasksApi;
  readonly solutionsApi: SolutionsApi;
  readonly authService: AuthService;

  constructor(
    accountApi: AccountApi,
    coursesApi: CoursesApi,
    homeworksApi: HomeworksApi,
    tasksApi: TasksApi,
    solutionsApi: SolutionsApi,
    authService: AuthService
  ) {
    this.accountApi = accountApi;
    this.coursesApi = coursesApi;
    this.homeworksApi = homeworksApi;
    this.tasksApi = tasksApi;
    this.solutionsApi = solutionsApi;
    this.authService = authService;
  }
}

/*
import * as Api from '../../api/src';
const configParameters: Api.ConfigurationParameters = {
  headers: {
    'Authorization': 'Bearer ' + myToken,
  },
};
const configuration = new Api.Configuration(configParameters);
const myService = new Api.MyApi(configuration);
 */

const basePath = "http://localhost:5000";

let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath: "https://localhost:5001" }),
  new CoursesApi({ basePath: "https://localhost:5002" }),
  new HomeworksApi({ basePath: basePath }),
  new TasksApi({ basePath: basePath }),
  new SolutionsApi({ basePath: basePath }),
  new AuthService()
);
export default ApiSingleton;
