import AuthService from '../services/AuthService';
import { AccountApi } from './auth';
import { CourseWorksApi } from './courseWorks';

class Api {
    readonly authService: AuthService;
    readonly accountApi: AccountApi;
    readonly courseWorksApi: CourseWorksApi;

    constructor(authService: AuthService, accountApi: AccountApi, courseWorksApi: CourseWorksApi) {        
        this.authService = authService;
        this.accountApi = accountApi;
        this.courseWorksApi = courseWorksApi;
    }
}

const basePath = "http://localhost:5000";

let ApiSingleton : Api;
ApiSingleton = new Api(new AuthService(), new AccountApi({basePath: basePath}), new CourseWorksApi({basePath: basePath}));
export default ApiSingleton;