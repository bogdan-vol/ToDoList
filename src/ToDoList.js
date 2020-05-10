import React from 'react';

import {
  View,
  Text,
  Modal,
  Image,
  ToolbarAndroid,
  Animated,
  TextInput,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

import todoService from './services/todo.service';

export default class ToDoList extends React.Component {
  translateMenuX = new Animated.Value(-1000);

  state = {
    todos: [],
    showDatePicker: false,
    showTimePicker: false,
    addToDoModalState: { visible: false },
    showToDoModalState: { visible: false }
  };

  componentDidMount() {
    todoService.getTodos().then(todos => {
      console.log(todos);
      this.setState({ todos });
    });
  }

  onTodoPress = td => {
    this.setState({ showToDoModalState: { visible: true, ...td } });
  };

  addTodo = () => {
    this.setState(
      ({ todos, addToDoModalState }) => ({
        addToDoModalState: { ...addToDoModalState, visible: false },
        todos: [addToDoModalState, ...todos]
      }),
      () => {
        todoService.postTodo(this.state.addToDoModalState).then(() => {});
      }
    );
  };

  deleteTodo = id => {
    console.log(id);
    console.log(this.state.todos.rowid);
    console.log('before', this.state.todos); //log inainte sa stergi din todos
    this.setState(
      ({ todos }) => {
        /* aici trebuie sa stergi din arrayul todos obiectul cu idul care iti vine in functie ca parametru */
        let index;
        for (var i = 0; i < todos.length; i++) {
          if (todos[i].rowid == id) {
            index = i;
          }
        }
        return todos.splice(index, 1);
      },
      () => {
        console.log('after', this.state.todos); //log dupa ce ai sters din todos
        todoService.deleteTodo(id).then(() => {});
      }
    );
  };

  toggleMenu = toValue => {
    Animated.timing(this.translateMenuX, {
      toValue,
      speed: 100,
      useNativeDriver: true
    }).start();
  };

  sortBy = key => {
    this.setState(({ todos }) => ({
      todos: todos.sort((a, b) => {
        return a[key] < b[key] ? -1 : 1;
      })
    }));
  };

  onDateChange = date => {
    if (date.type === 'dismissed')
      return this.setState({ showDatePicker: false });
    this.setState(({ addToDoModalState }) => ({
      showDatePicker: false,
      addToDoModalState: {
        ...addToDoModalState,
        date: this.formatDate(date.nativeEvent.timestamp)
      }
    }));
  };

  onTimeChange = time => {
    if (time.type === 'dismissed')
      return this.setState({ showTimePicker: false });
    this.setState(({ addToDoModalState }) => ({
      showTimePicker: false,
      addToDoModalState: {
        ...addToDoModalState,
        time: this.formatTime(time.nativeEvent.timestamp)
      }
    }));
  };

  formatDate = date => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
  };

  formatTime = time => {
    const t = new Date(time);
    let h = t.getHours();
    let m = t.getMinutes();
    if (h < 10) h = `0${h}`;
    if (m < 10) m = `0${m}`;
    return `${h}:${m}`;
  };

  render() {
    let {
      todos,
      addToDoModalState,
      showToDoModalState,
      showDatePicker,
      showTimePicker
    } = this.state;

    return (
      <>
        <ImageBackground
          source={require('../assets/images/todo.png')}
          style={{ width: '100%', height: '100%' }}
        >
          <StatusBar
            backgroundColor='#812A7B'
            animated={true}>
          </StatusBar>
          <View style={{height: 60, backgroundColor: '#812A7B', flexDirection: 'row'}}>
            <TouchableOpacity
                  style={{ paddingTop: 20, paddingLeft: 10}}
                  onPress={() => this.toggleMenu(0)}
                >
                  <Icon name='bars' size={25} color='white' />
            </TouchableOpacity>
            <View animationType={'slide'} style={{height: 30, width: 250, backgroundColor: '#ffffff', 
              alignItems: 'center', flexDirection: 'row', paddingHorizontal: 5, marginTop: 20,
              marginLeft: 50}}>
                <View>
                  <Icon name='search' size={20}></Icon>
                </View>
                <TextInput placeholder="Search" style={{fontSize: 20, marginLeft: 10, 
                  paddingTop: 0, paddingBottom: 2}}></TextInput>
            </View>
              <Image
                style={{ width: 50, height: 50, marginTop: 10, marginLeft: 20}}
                source={require('../assets/icons/todo_logo.png')}
              />
          </View>
          <SafeAreaView style={{ flex: 1, padding: 10 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
            </View>
            <ScrollView style={styles.content}>
              {todos.map(td => (
                <TouchableOpacity
                  key={td.rowid}
                  onPress={() => this.onTodoPress(td)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'row',
                    // justifyContent: 'center',
                    justifyContent: 'space-between',
                    // justifyContent: 'space-around',
                    backgroundColor:
                      td.importance === 'high'
                        ? '#A81996'
                        : td.importance === 'medium'
                        ? '#D077CB'
                        : '#F5AEF1',
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    marginTop: 10
                  }}
                >
                  <Text style={styles.todoName}>{td.name}</Text>
                  <Text style={styles.todo}>{td.time}</Text>
                  <TouchableOpacity
                    onPress={() => this.deleteTodo(td.rowid)}
                    style={{
                      padding: 10,
                      alignContent: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name='trash-o' size={25} color='white' />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <View style={{ height: 60 }} />
            </ScrollView>
            <TouchableOpacity
              style={styles.addContainer}
              onPress={() =>
                this.setState({ addToDoModalState: { visible: true } })
              }
            >
              <Image
                style={{
                  width: 60,
                  height: 60,
                  marginBottom: 30,
                  marginRight: 30
                }}
                source={require('../assets/icons/add_icon2.png')}
              />
            </TouchableOpacity>
            <Modal
              transparent={true}
              animationType={'slide'}
              visible={addToDoModalState.visible}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)' }}>
                <TextInput
                  style={styles.addTodo}
                  placeholder={'Name'}
                  value={addToDoModalState.name}
                  onChangeText={name =>
                    this.setState({
                      addToDoModalState: { ...addToDoModalState, name }
                    })
                  }
                />
                <TextInput
                  style={styles.addTodo}
                  placeholder={'Type'}
                  value={addToDoModalState.type}
                  onChangeText={type =>
                    this.setState({
                      addToDoModalState: { ...addToDoModalState, type }
                    })
                  }
                />
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={async () => this.setState({ showDatePicker: true })}
                >
                  <TextInput
                    editable={false}
                    style={styles.addTodo}
                    placeholder={'Date'}
                    value={addToDoModalState.date}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={async () => this.setState({ showTimePicker: true })}
                >
                  <TextInput
                    editable={false}
                    style={styles.addTodo}
                    placeholder={'Time'}
                    value={addToDoModalState.time}
                  />
                  <TextInput
                    style={styles.addTodo}
                    placeholder={'Location'}
                    value={addToDoModalState.location}
                    onChangeText={location =>
                      this.setState({
                        addToDoModalState: { ...addToDoModalState, location }
                      })
                    }
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.addTodo}
                  placeholder={'Importance'}
                  value={addToDoModalState.importance}
                  onChangeText={importance =>
                    this.setState({
                      addToDoModalState: { ...addToDoModalState, importance }
                    })
                  }
                />
                <TextInput
                  style={styles.addTodo}
                  placeholder={'Finished'}
                  value={addToDoModalState.finished}
                  onChangeText={finished =>
                    this.setState({
                      addToDoModalState: { ...addToDoModalState, finished }
                    })
                  }
                />
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={this.addTodo}
                    style={styles.addButton}
                  >
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ addToDoModalState: { visible: false } })
                    }
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              transparent={true}
              animationType={'slide'}
              visible={showToDoModalState.visible}
            >
              <TouchableOpacity
                onPress={() =>
                  this.setState({ showToDoModalState: { visible: false } })
                }
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)' }}
              >
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Name:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.name}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Type:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.type}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Date:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.date}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Time:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.time}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Location:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.location}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Importance:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.importance}
                  </Text>
                </View>
                <View style={styles.modalItemContainer}>
                  <Text style={styles.toDoModalDetailsRow}>Finished:</Text>
                  <Text style={styles.toDoModalDetailsRow}>
                    {showToDoModalState.finished}
                  </Text>
                </View>
              </TouchableOpacity>
            </Modal>
          </SafeAreaView>
        </ImageBackground>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transform: [{ translateX: this.translateMenuX }]
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.toggleMenu(-1000)}
            style={{ width: '100%', height: '100%' }}
          >
            <View
              style={{
                height: '100%',
                position: 'absolute',
                backgroundColor: 'white'
              }}
            >
              <TouchableOpacity
                style={styles.sortTouchable}
                onPress={() => this.sortBy('date')}
              >
                <Text style={{ marginLeft: 2 }}>Sort By Date</Text>
                <Icon name='caret-down' size={25} color='black' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortTouchable}
                onPress={() => this.sortBy('importance')}
              >
                <Text style={{ marginLeft: 2, marginRight: 5}}>Sort By Importance</Text>
                <Icon name='caret-down' size={25} color='black' />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              timeZoneOffsetInMinutes={0}
              value={new Date()}
              is24Hour={true}
              display='default'
              mode={'date'}
              onChange={this.onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              timeZoneOffsetInMinutes={0}
              value={new Date()}
              is24Hour={true}
              display='default'
              mode={'time'}
              onChange={this.onTimeChange}
            />
          )}
        </Animated.View>
      </>
    );
  }
}
const styles = StyleSheet.create({
  modalItemContainer: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between'
  },
  addContainer: {
    right: 10,
    width: 40,
    bottom: 10,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    alignItems: 'center',
    // backgroundColor: 'white',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  title: {
    fontFamily: 'sans-serif-medium',
    paddingTop: 20,
    paddingBottom: 30,
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 5
  },
  todoTitle: {
    fontSize: 17,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    fontWeight: 'bold'
  },
  todoName: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  todo: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    color: '#FFFFFF'
  },
  details: {
    height: 30,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
    alignItems: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    paddingTop: 5,
    marginBottom: 5
  },
  detailsText: {
    color: '#fff',
    fontSize: 15
  },
  done: {
    height: 30,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: '#A269C5',
    borderWidth: 0.5,
    borderColor: '#A269C5',
    borderRadius: 5,
    alignItems: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    paddingTop: 5,
    marginBottom: 5
  },
  doneText: {
    color: '#fff',
    fontSize: 15
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
    paddingRight: 10
  },
  importanceMedium: {
    backgroundColor: '#F3F75F',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  importanceLow: {
    backgroundColor: '#95EE90',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20
  },
  addButton: {
    flex: 1,
    backgroundColor: '#DA8FDF',
    alignItems: 'center',
    padding: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8E3AC0',
    alignItems: 'center',
    padding: 10
  },
  toDoModalDetailsRow: {
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    color: 'black'
  },
  sortTouchable: {
    padding: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});
