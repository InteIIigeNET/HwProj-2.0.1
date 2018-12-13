import * as React from 'react';
import CoursesApi from '../api/CoursesApi'
import ICourse from '../models/Course'

interface IState {
    isLoaded: boolean;
    courses: ICourse[];
}

export default class Courses extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = { isLoaded: false, courses: [] };
    }

    public render() {
        if (this.state.isLoaded) {
            const listItems = this.state.courses.map(course => (<li>{course.name}</li>));
            
            return (
                <ul>
                    {listItems}
                </ul>
            );
        }
        else {
            return (<div/>);
        }
    }

    public componentDidMount() {
        CoursesApi.getAllCourses().then(data => {
            this.setState({ isLoaded: true, courses: data })
        });
      }
}