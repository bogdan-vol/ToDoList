import React from 'react';

import {
  Scene,
  Router,
} from 'react-native-router-flux';

import Login from './src/Login';
import Register from './src/Register';
import ToDoList from './src/ToDoList';

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Scene
          lazy={true}
          key='root'
          drawerLockMode='locked-closed'
          gesturesEnabled={false}
        >
          <Scene
            hideNavBar
            key='login'
            lazy={true}
            component={Login}
            gesturesEnabled={false}
            drawerLockMode='locked-closed'
          />
          <Scene
            hideNavBar
            lazy={true}
            key='toDoList'
            component={ToDoList}
            gesturesEnabled={false}
            drawerLockMode='locked-closed'
          />
        </Scene>
      </Router >
    );
  }
};