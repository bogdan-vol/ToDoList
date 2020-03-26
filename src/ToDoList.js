import React from 'react';

import {View, ScrollView, SafeAreaView, StyleSheet, Text} from 'react-native';

import todoService from './services/todo.service';

export default class ToDoList extends React.Component {
  state = {todos: []};

  componentDidMount() {
    todoService.getTodos().then(todos => {
      this.setState({todos});
    });
  }

  render() {
    let {todos} = this.state;
    return (
      <ScrollView style={styles.content}>
        <SafeAreaView style={{flex: 1}}>
          {todos.map(td => (
            <React.Fragment>
              <Text>{td.name}</Text>
            </React.Fragment>
          ))}
        </SafeAreaView>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
