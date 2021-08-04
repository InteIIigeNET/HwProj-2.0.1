import { AccountApi, NotificationsApi, CoursesApi } from ".";

// Fake api
import { SolutionsApi } from "./solutions";

import AuthService from "../services/AuthService";
import CourseService from "../services/CourseService";
import TaskService from "../services/TaskService";
import HomeworkService from "../services/HomeworkService";
import SolutionService from "../services/SolutionService";

class Api {
  readonly accountApi: AccountApi;
  readonly coursesApi: CoursesApi;
  readonly solutionsApi: SolutionsApi;
  readonly notificationsApi: NotificationsApi;
  readonly authService: AuthService;
  readonly courseService: CourseService;
  readonly taskService: TaskService;
  readonly homeworkService: HomeworkService;
  readonly solutionService: SolutionService;

  constructor(
    accountApi: AccountApi,
    coursesApi: CoursesApi,
    solutionsApi: SolutionsApi,
    notificationsApi: NotificationsApi,
    authService: AuthService,
    courseService: CourseService,
    taskService: TaskService,
    homeworkService: HomeworkService,
    solutionService: SolutionService,
  ) {
    this.accountApi = accountApi;
    this.coursesApi = coursesApi;
    this.solutionsApi = solutionsApi;
    this.notificationsApi = notificationsApi;
    this.authService = authService;
    this.courseService = courseService;
    this.taskService = taskService;
    this.homeworkService = homeworkService;
    this.solutionService = solutionService;
  }
}

const basePath = "http://localhost:5000";

let ApiSingleton: Api;
ApiSingleton = new Api(
  new AccountApi({ basePath }),
  new CoursesApi({ basePath: basePath }),
  new SolutionsApi({ basePath: basePath }),
  new NotificationsApi({basePath: basePath}),
  new AuthService(),
  new CourseService(),
  new TaskService(),
  new HomeworkService(),
  new SolutionService(),
);
export default ApiSingleton;
