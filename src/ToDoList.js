import React from 'react';

import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import todoService from './services/todo.service';

export default class ToDoList extends React.Component {
  state = {
    todos: [],
    addToDoModalState: {visible: false},
    showToDoModalState: {visible: false},
    deleteToDoState: {visible: false},
  };

  componentDidMount() {
    todoService.getTodos().then(todos => this.setState({todos}));
  }

  onTodoPress = td => {
    this.setState({showToDoModalState: {visible: true, ...td}});
  };

  addTodo = () => {
    this.setState(
      ({todos, addToDoModalState}) => ({
        addToDoModalState: {...addToDoModalState, visible: false},
        todos: [addToDoModalState, ...todos],
      }),
      () => {
        todoService.postTodo(this.state.addToDoModalState).then(() => {});
      },
    );
  };

  deleteTodo = () => {
    this.setState(
      ({todos, deleteToDoState}) => ({
        deleteToDoState: {...deleteToDoState, visible: false},
        todos: [deleteToDoState, ...todos],
      }),
      () => {
        todoService.deleteTodo(this.state.deleteToDoState).then(() => {});
      },
    );
  };

  render() {
    let {todos, addToDoModalState, showToDoModalState} = this.state;

    return (
      <SafeAreaView style={{flex: 1, padding: 10}}>
        <Text style={styles.title}>TO DO</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.todoTitle}>Name</Text>
          <Text style={styles.todoTitle}>Date</Text>
          <Text style={styles.todoTitle}>Location</Text>
          <Text style={styles.todoTitle}>...</Text>
        </View>
        <ScrollView style={styles.content}>
          {/* maparea de care iti vorbeam pt afisarea rezultatelor din db.
          Aici le afisezi tu pe restu si le stilizezi cum doresti.
          Mai fa si butonul de delete pt care ai deja endpoint (uita-te in serverul node). */}
          {todos.map(td => (
            <TouchableOpacity
              key={td.rowid}
              onPress={() => this.onTodoPress(td)}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                justifyContent: 'space-between',
                backgroundColor:
                  td.importance === 'high'
                    ? '#F59791'
                    : td.importance === 'medium'
                    ? '#F3F75F'
                    : '#95EE90',
                    borderWidth: 5,
                    borderRadius: 10,
                    borderColor: '#FFFFFF'
              }}>
              <Text style={styles.todo}>{td.name}</Text>
              <Text style={styles.todo}>{td.date}</Text>
              <Text style={styles.todo}>{td.location}</Text>
              <TouchableOpacity
                onPress={this.deleteTodo}
                style={{
                  padding: 10,
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="trash-o" size={25} color="black" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{height: 60}} />
        </ScrollView>
        <TouchableOpacity
          style={styles.addContainer}
          onPress={() => this.setState({addToDoModalState: {visible: true}})}>
          <Icon name="plus" size={30} color="black" />
        </TouchableOpacity>
        <Modal
          transparent={true}
          animationType={'slide'}
          visible={addToDoModalState.visible}>
          <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.5)'}}>
            <TextInput
              style={styles.addTodo}
              placeholder={'Name'}
              value={addToDoModalState.name}
              onChangeText={name =>
                this.setState({addToDoModalState: {...addToDoModalState, name}})
              }
            />
            <TextInput
              style={styles.addTodo}
              placeholder={'Type'}
              value={addToDoModalState.type}
              onChangeText={type =>
                this.setState({addToDoModalState: {...addToDoModalState, type}})
              }
            />
            <TextInput
              style={styles.addTodo}
              placeholder={'Date'}
              value={addToDoModalState.date}
              onChangeText={date =>
                this.setState({addToDoModalState: {...addToDoModalState, date}})
              }
            />
            <TextInput
              style={styles.addTodo}
              placeholder={'Time'}
              value={addToDoModalState.time}
              onChangeText={time =>
                this.setState({addToDoModalState: {...addToDoModalState, time}})
              }
            />
            <TextInput
              style={styles.addTodo}
              placeholder={'Location'}
              value={addToDoModalState.location}
              onChangeText={location =>
                this.setState({
                  addToDoModalState: {...addToDoModalState, location},
                })
              }
            />
            <TextInput
              style={styles.addTodo}
              placeholder={'Importance'}
              value={addToDoModalState.importance}
              onChangeText={importance =>
                this.setState({
                  addToDoModalState: {...addToDoModalState, importance},
                })
              }
            />

            <View style={{flexDirection: 'row'}}>
              <Text>Importance</Text>
              <TouchableOpacity 
                style={styles.importanceHigh}> 
                <Text style={{color: '#FFFFFF'}}>high</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                style={styles.importanceMedium}>
                <Text>medium</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity>
                style={styles.importanceLow}>
                <Text>low</Text>
              </TouchableOpacity> */}
            </View>
            <TextInput
              style={styles.addTodo}
              placeholder={'Finished'}
              value={addToDoModalState.finished}
              onChangeText={finished =>
                this.setState({
                  addToDoModalState: {...addToDoModalState, finished},
                })
              }
            />
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={this.addTodo}
                style={styles.addButton}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.setState({addToDoModalState: {visible: false}})
                }
                style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          animationType={'slide'}
          visible={showToDoModalState.visible}>
          <TouchableOpacity
            onPress={() =>
              this.setState({showToDoModalState: {visible: false}})
            }
            style={{flex: 1, backgroundColor: 'rgba(0,0,0,.5)'}}>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Name:</Text>
              <Text style={styles.todo}>{showToDoModalState.name}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Type:</Text>
              <Text style={styles.todo}>{showToDoModalState.type}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Date:</Text>
              <Text style={styles.todo}>{showToDoModalState.date}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Time:</Text>
              <Text style={styles.todo}>{showToDoModalState.time}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Location:</Text>
              <Text style={styles.todo}>{showToDoModalState.location}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Importance:</Text>
              <Text style={styles.todo}>{showToDoModalState.importance}</Text>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.todo}>Finished:</Text>
              <Text style={styles.todo}>{showToDoModalState.finished}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  modalItemContainer: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  addContainer: {
    right: 10,
    width: 40,
    bottom: 10,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'red',
    justifyContent: 'center',
  },
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
    letterSpacing: 5,
  },
  todoTitle: {
    fontSize: 17,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    fontWeight: 'bold'
  },
  todo: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5
  },
  addTodo: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  importanceHigh: {
    backgroundColor: '#F59791',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  importanceMedium: {
    backgroundColor: '#F3F75F',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  importanceLow: {
    backgroundColor: '#95EE90',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20
  },
  addButton: {
    flex: 1,
    backgroundColor: '#CF6ED3',
    alignItems: 'center',
    padding: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#923BAF',
    alignItems: 'center',
    padding: 10
  }
});
