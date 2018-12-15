import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Course from './components/Course'
import Courses from './components/Courses'

class App extends React.Component {
  public render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact={true} path='courses/' component={Courses} />
          <Route exact={true} path='course/:id' component={Course} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
