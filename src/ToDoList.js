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
  };

  componentDidMount() {
    todoService.getTodos().then(todos => this.setState({todos}));
  }

  delete = async () => {};

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

  render() {
    let {todos, addToDoModalState, showToDoModalState} = this.state;

    return (
      <SafeAreaView style={{flex: 1, padding: 10}}>
        <Text style={styles.title}>TO DO</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.todo}>Name</Text>
          <Text style={styles.todo}>Date</Text>
          <Text style={styles.todo}>Location</Text>
          <Text style={styles.todo}>...</Text>
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
                    ? 'red'
                    : td.importance === 'medium'
                    ? 'yellow'
                    : 'green',
              }}>
              <Text style={styles.todo}>{td.name}</Text>
              <Text style={styles.todo}>{td.date}</Text>
              <Text style={styles.todo}>{td.location}</Text>
              <TouchableOpacity
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
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Name'}
              value={addToDoModalState.name}
              onChangeText={name =>
                this.setState({addToDoModalState: {...addToDoModalState, name}})
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Type'}
              value={addToDoModalState.type}
              onChangeText={type =>
                this.setState({addToDoModalState: {...addToDoModalState, type}})
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Date'}
              value={addToDoModalState.date}
              onChangeText={date =>
                this.setState({addToDoModalState: {...addToDoModalState, date}})
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Time'}
              value={addToDoModalState.time}
              onChangeText={time =>
                this.setState({addToDoModalState: {...addToDoModalState, time}})
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Location'}
              value={addToDoModalState.location}
              onChangeText={location =>
                this.setState({
                  addToDoModalState: {...addToDoModalState, location},
                })
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
              placeholder={'Importance'}
              value={addToDoModalState.importance}
              onChangeText={importance =>
                this.setState({
                  addToDoModalState: {...addToDoModalState, importance},
                })
              }
            />
            <TextInput
              style={{backgroundColor: 'white', borderWidth: 1}}
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
                style={{flex: 1, backgroundColor: 'lightblue', padding: 10}}>
                <Text>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.setState({addToDoModalState: {visible: false}})
                }
                style={{flex: 1, backgroundColor: 'red', padding: 10}}>
                <Text>Cancel</Text>
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
