import React from 'react';

import {View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';

import todoService from './services/todo.service';

export default class ToDoList extends React.Component {
  state = {todos: []};

  componentDidMount() {
    todoService.getTodos().then(todos => this.setState({todos}));
  }

  delete = async () => {

  }

  render() {
    let {todos} = this.state;
    return (
      <ScrollView style={styles.content}>
        <SafeAreaView style={{flex: 1}}>
          <Text style={styles.title}>TO DO</Text>
          {/* maparea de care iti vorbeam pt afisarea rezultatelor din db.
          Aici le afisezi tu pe restu si le stilizezi cum doresti.
          Mai fa si butonul de delete pt care ai deja endpoint (uita-te in serverul node). */}
          {todos.map(td => (
            <React.Fragment>
              <Text style={styles.todo}>{td.name}</Text>
              {/* <Text style={styles.todo}>{td.type}</Text>
              <Text style={styles.todo}>{td.date}</Text>
              <Text style={styles.todo}>{td.time}</Text>
              <Text style={styles.todo}>{td.location}</Text>
              <Text style={styles.todo}>{td.importance}</Text>
              <Text style={styles.todo}>{td.finished}</Text> */}
            </React.Fragment>
          ))}
          <TouchableOpacity style={styles.deleteButton} onPress={this.delete}>
              <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'sans-serif-medium',
    paddingTop: 20,
    paddingBottom: 30,
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    letterSpacing: 5
  },
  todo: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  deleteButton: {
    height: 20,
    marginRight: 160,
    marginLeft: 160,
    backgroundColor: '#0489B1',
    borderWidth: 0.5,
    borderColor: '#0489B1',
    borderRadius: 5,
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 3,
  },
  deleteText: {
    color: '#fff',
    fontSize: 17,
  },
});
