import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Courses from './components/Courses'

class App extends React.Component {
  public render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact={true} path='/' component={Courses} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
