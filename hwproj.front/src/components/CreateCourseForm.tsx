import * as React from 'react'
import { Redirect } from 'react-router-dom'
import CoursesApi from 'src/api/CoursesApi';
import { isUndefined } from 'util';
import {ICreateCourseModel} from '../models/Course'


interface IState {
    createCourseModel: ICreateCourseModel,
    id?: number
}
export default class CreateCourseFrom extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
    
        this.handleSubmit = this.handleSubmit.bind(this);
      }

      public render() {
        return (
            <div>
                {this.handleRedirect()}
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Название курса:
                    <input type="text" value={this.state.createCourseModel.name}/>
                    </label>
                    <label>
                    Группа:
                    <input type="text" value={this.state.createCourseModel.groupName}/>
                    </label>
                    <label>
                        Открыт ли курс?
                        <input type="checkbox" checked={this.state.createCourseModel.isOpen}/>
                    </label>
                    <button type="submit" value="Создать курс" />
                </form>
            </div>
        );
      }
    
      private handleSubmit(event : React.FormEvent<HTMLFormElement>) {
        CoursesApi.createCourse(this.state.createCourseModel, "admin")
            .then(res => this.setState({ id: res }))
      }

      private handleRedirect() {
        if (!isUndefined(this.state.id)) {
            const to = `/course/${this.state.id}`;
            return (<Redirect to={to} />);
          }
      }
}