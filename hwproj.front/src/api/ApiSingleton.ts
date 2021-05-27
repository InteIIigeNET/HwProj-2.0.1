import { AccountApi } from "./auth";
import { CoursesApi } from "./courses";
import { HomeworksApi, TasksApi } from "./homeworks";
import { SolutionsApi } from "./solutions";
import AuthService from "../services/AuthService";
import CourseService from "../services/CourseService";

class Api {
  readonly accountApi: AccountApi;
  readonly coursesApi: CoursesApi;
  readonly homeworksApi: HomeworksApi;
  readonly tasksApi: TasksApi;
  readonly solutionsApi: SolutionsApi;
  readonly authService: AuthService;
  readonly courseService: CourseService;

  constructor(
    accountApi: AccountApi,
    coursesApi: CoursesApi,
    homeworksApi: HomeworksApi,
    tasksApi: TasksApi,
    solutionsApi: SolutionsApi,
    authService: AuthService,
    courseService: CourseService
  ) {
    this.accountApi = accountApi;
    this.coursesApi = coursesApi;
    this.homeworksApi = homeworksApi;
    this.tasksApi = tasksApi;
    this.solutionsApi = solutionsApi;
    this.authService = authService;
    this.courseService = courseService;
  }
}

const basePath = "http://localhost:5000";

let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath }),
  new CoursesApi({ basePath: basePath }),
  new HomeworksApi({ basePath: basePath }),
  new TasksApi({ basePath: basePath }),
  new SolutionsApi({ basePath: basePath }),
  new AuthService(),
  new CourseService()
);
export default ApiSingleton;
