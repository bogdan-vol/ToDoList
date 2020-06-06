import React from 'react';

import {
  View,
  Text,
  Modal,
  Image,
  Picker,
  Animated,
  TextInput,
  StatusBar,
  PixelRatio,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  PermissionsAndroid
} from 'react-native';

import { CheckBox } from 'react-native-elements';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

import todoService from './services/todo.service';

let distances = [];
let selectedMarkers = [];
let speedCheckPoints = [];
const speedCheckInterval = 120000;
export default class ToDoList extends React.Component {
  translateMenuX = new Animated.Value(-1000);

  state = {
    speed: 0,
    todos: [],
    search: '',
    translatedCoords: [],
    showDatePicker: false,
    showTimePicker: false,
    map: { visible: false },
    addToDoModalState: { visible: false },
    showToDoModalState: { visible: false }
  };

  componentDidMount() {
    let promises = [];
    promises.push(todoService.getTodos(), todoService.getSpeed());
    Promise.all(promises).then(result => {
      this.setState({ todos: result[0], speed: result[1].speed || 0 });
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
    this.setState(
      ({ todos }) => {
        let index;
        for (var i = 0; i < todos.length; i++) {
          if (todos[i].rowid == id) {
            index = i;
          }
        }
        return todos.splice(index, 1);
      },
      () => {
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
    this.setState(({ addToDoModalState, showToDoModalState }) => ({
      showDatePicker: false,
      addToDoModalState: {
        ...addToDoModalState,
        date: this.formatDate(date.nativeEvent.timestamp)
      },
      showToDoModalState: {
        ...showToDoModalState,
        date: this.formatDate(date.nativeEvent.timestamp)
      }
    }));
  };

  onTimeChange = time => {
    if (time.type === 'dismissed')
      return this.setState({ showTimePicker: false });
    this.setState(({ addToDoModalState, showToDoModalState }) => ({
      showTimePicker: false,
      addToDoModalState: {
        ...addToDoModalState,
        time: this.formatTime(time.nativeEvent.timestamp)
      },
      showToDoModalState: {
        ...showToDoModalState,
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

  onUpdate = () => {
    let {
      name,
      type,
      date,
      time,
      rowid,
      location,
      latitude,
      longitude,
      importance,
      details,
      finished
    } = this.state.showToDoModalState;
    this.setState(({ todos }) => ({
      showToDoModalState: { visible: false },
      todos: todos.map(td =>
        td.rowid === rowid
          ? {
              ...td,
              name,
              type,
              date,
              time,
              location,
              importance,
              latitude,
              longitude,
              details,
              finished
            }
          : td
      )
    }));
    todoService.updateTodo(rowid, this.state.showToDoModalState);
  };

  showMap = () => {
    this.toggleMenu(-1000);
    this.setState({ map: { visible: true } });
  };

  onMapPress = ({
    nativeEvent: {
      coordinate: { latitude, longitude }
    }
  }) => {
    let { addToDoModalState, showToDoModalState } = this.state;
    if (addToDoModalState.visible) {
      this.setState(
        {
          map: { visible: false },
          addToDoModalState: { ...addToDoModalState, latitude, longitude }
        },
        () => delete this.mapCentered
      );
    }
    if (showToDoModalState.visible) {
      this.setState(
        {
          map: { visible: false },
          showToDoModalState: { ...showToDoModalState, latitude, longitude }
        },
        () => delete this.mapCentered
      );
    }
  };

  toggleFinished = todo => {
    this.setState(
      ({ todos }) => ({
        todos: todos.map(td => ({
          ...td,
          finished: todo.rowid === td.rowid ? !td.finished : td.finished
        }))
      }),
      () =>
        todoService.updateTodo(
          todo.rowid,
          this.state.todos.filter(td => td.rowid === todo.rowid)[0]
        )
    );
  };

  selectMarker = (toDo, position) => {
    if (selectedMarkers.length < 2)
      selectedMarkers = [...selectedMarkers, { ...toDo, ...position }];
    if (selectedMarkers.length === 2) this.polylinePointsFromXY();
  };

  distanceXY = () => {
    let m1 = selectedMarkers[0],
      m2 = selectedMarkers[1];
    return Math.sqrt(
      Math.pow(Math.abs(m1.x - m2.x), 2) + Math.pow(Math.abs(m1.y - m2.y), 2)
    );
  };

  distanceMeters = sms => {
    if (!sms) sms = selectedMarkers;
    let lat1 = sms[0].latitude, //first point on the map
      lon1 = sms[0].longitude, //first point on the map
      lat2 = sms[1].latitude, //second point on the map
      lon2 = sms[1].longitude; //second point on the map
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in meters
    return d;
  };

  deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  halfDistXY = () => {
    return this.distanceXY() / 2;
  };

  halfMarker = () => {
    return {
      x: (selectedMarkers[0].x + selectedMarkers[1].x) / 2,
      y: (selectedMarkers[0].y + selectedMarkers[1].y) / 2,
      latitude: (selectedMarkers[0].latitude + selectedMarkers[1].latitude) / 2,
      longitude:
        (selectedMarkers[0].longitude + selectedMarkers[1].longitude) / 2
    };
  };

  halfHalfMarker = () => {
    return {
      x: (selectedMarkers[0].x + this.halfMarker().x) / 2,
      y: (selectedMarkers[0].y + this.halfMarker().y) / 2,
      latitude: (selectedMarkers[0].latitude + this.halfMarker().latitude) / 2,
      longitude:
        (selectedMarkers[0].longitude + this.halfMarker().longitude) / 2
    };
  };

  polylinePointsFromXY = async () => {
    let sms = selectedMarkers;
    let { x: midX, y: midY } = this.halfMarker();
    let halfBase = this.halfDistXY() / Math.sqrt(3);
    let selAngle = Math.asin((sms[0].y - sms[1].y) / this.distanceXY());

    let orientationX;
    let orientationY;
    if (sms[0].x < sms[1].x && sms[0].y > sms[1].y) {
      orientationX = 1;
      orientationY = 1;
    } else if (sms[0].x > sms[1].x && sms[0].y < sms[1].y) {
      orientationX = 1;
      orientationY = -1;
    } else if (sms[0].x < sms[1].x && sms[0].y < sms[1].y) {
      orientationX = -1;
      orientationY = -1;
    } else if (sms[0].x > sms[1].x && sms[0].y > sms[1].y) {
      orientationX = -1;
      orientationY = 1;
    }

    let p0 = {
      ...(await this.map.coordinateForPoint({
        x: sms[0].x / PixelRatio.get(),
        y: sms[0].y / PixelRatio.get()
      })),
      x: sms[0].x / PixelRatio.get(),
      y: sms[0].y / PixelRatio.get()
    };
    let p1 = {
      ...(await this.map.coordinateForPoint({
        x:
          (midX + orientationX * Math.cos(Math.PI / 2 - selAngle) * halfBase) /
          PixelRatio.get(),
        y:
          (midY + orientationY * Math.sin(Math.PI / 2 - selAngle) * halfBase) /
          PixelRatio.get()
      })),
      x:
        (midX + orientationX * Math.cos(Math.PI / 2 - selAngle) * halfBase) /
        PixelRatio.get(),
      y:
        (midY + orientationY * Math.sin(Math.PI / 2 - selAngle) * halfBase) /
        PixelRatio.get()
    };
    let p2 = {
      ...(await this.map.coordinateForPoint({
        x:
          (midX +
            orientationX * Math.cos((3 * Math.PI) / 2 - selAngle) * halfBase) /
          PixelRatio.get(),
        y:
          (midY +
            orientationY * Math.sin((3 * Math.PI) / 2 - selAngle) * halfBase) /
          PixelRatio.get()
      })),
      x:
        (midX +
          orientationX * Math.cos((3 * Math.PI) / 2 - selAngle) * halfBase) /
        PixelRatio.get(),
      y:
        (midY +
          orientationY * Math.sin((3 * Math.PI) / 2 - selAngle) * halfBase) /
        PixelRatio.get()
    };
    this.setState(
      {
        translatedCoords: [[p0, p1], [p0, p2], [p1, p2]]
      },
      async () => {
        let promises = [];
        this.state.todos.map(td => promises.push(this.pointInTriangle(td)));
        let pointsInTr = await Promise.all(promises);
        console.log(pointsInTr);
        this.setState(({ todos }) => ({
          todos: todos.map((td, i) => ({ ...td, hidden: !pointsInTr[i] }))
        }));
      }
    );
  };

  sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  };

  pointInTriangle = async pt => {
    let { translatedCoords: trsc } = this.state;
    if (!trsc.length) return true;
    let d1, d2, d3;
    let has_neg, has_pos;
    let ptxy = await this.map.pointForCoordinate(pt);

    d1 = this.sign(ptxy, trsc[0][0], trsc[0][1]);
    d2 = this.sign(ptxy, trsc[0][1], trsc[1][1]);
    d3 = this.sign(ptxy, trsc[1][1], trsc[0][0]);

    has_neg = d1 < 0 || d2 < 0 || d3 < 0;
    has_pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(has_neg && has_pos);
  };

  calculateSpeed = ({ latitude, longitude }) => {
    speedCheckPoints.push({ latitude, longitude });
    if (speedCheckPoints.length > 1) {
      let pointsNo = speedCheckPoints.length;
      let time = speedCheckInterval * (pointsNo - 1);
      let distance = this.distanceMeters([
        speedCheckPoints[pointsNo - 2],
        speedCheckPoints[pointsNo - 1]
      ]);
      distances.push(distance);
      let totalDistance = distances.reduce((a, b) => a + b);
      this.setState({
        speed: totalDistance / (time / 1000)
      });
      todoService.postSpeed({
        latitude,
        longitude,
        speed: totalDistance / (time / 1000)
      });
    }
  };

  render() {
    let {
      map,
      speed,
      todos,
      search,
      showTimePicker,
      showDatePicker,
      translatedCoords,
      addToDoModalState,
      showToDoModalState
    } = this.state;
    console.log(todos);

    return (
      <>
        <ImageBackground
          source={require('../assets/images/todo.png')}
          style={{ width: '100%', height: '100%' }}
        >
          <StatusBar backgroundColor='#812A7B' animated={true} />
          <View
            style={{
              height: 60,
              backgroundColor: '#812A7B',
              flexDirection: 'row'
            }}
          >
            <TouchableOpacity
              style={{ paddingTop: 20, paddingLeft: 10 }}
              onPress={() => this.toggleMenu(0)}
            >
              <Icon name='bars' size={25} color='white' />
            </TouchableOpacity>
            <View
              style={{
                height: 30,
                width: 250,
                backgroundColor: '#ffffff',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 5,
                marginTop: 20,
                marginLeft: 50
              }}
            >
              <View>
                <Icon name='search' size={20} />
              </View>
              <TextInput
                placeholder='Search'
                onChangeText={text => this.setState({ search: text })}
                style={{
                  flex: 1,
                  fontSize: 17,
                  paddingTop: 0,
                  marginLeft: 10,
                  paddingBottom: 2
                }}
              />
            </View>
            <Image
              style={{ width: 50, height: 50, marginTop: 10, marginLeft: 20 }}
              source={require('../assets/icons/todo_logo.png')}
            />
          </View>
          <SafeAreaView style={{ flex: 1, padding: 10 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            />
            <ScrollView style={styles.content}>
              {todos.map(
                td =>
                  td.name.indexOf(search) >= 0 && (
                    <TouchableOpacity
                      key={td.rowid}
                      onPress={() => this.onTodoPress(td)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
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
                      <CheckBox
                        center
                        checked={!!td.finished}
                        checkedColor='#9747CF'
                        uncheckedColor={'white'}
                        onPress={() => this.toggleFinished(td)}
                      />
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
                  )
              )}
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
              <Image
                style={{ width: 70, height: 80, marginTop: 10, marginLeft: 50 }}
                source={require('../assets/icons/todo_logo_menu.png')}
              />
              <TouchableOpacity
                style={styles.sortTouchable}
                onPress={() => this.sortBy('date')}
              >
                <Text style={{ marginLeft: 2, marginTop: 20 }}>
                  Sort By Date
                </Text>
                <Icon name='caret-down' size={25} color='black' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortTouchable}
                onPress={() => this.sortBy('importance')}
              >
                <Text style={{ marginLeft: 2, marginRight: 5 }}>
                  Sort By Importance
                </Text>
                <Icon name='caret-down' size={25} color='black' />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.showMap}
                style={styles.sortTouchable}
              >
                <Text style={{ marginLeft: 2, marginRight: 5 }}>Map</Text>
                <Icon name='map-marker' size={25} color='black' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logOutButton}
                onPress={this.logOut}
              >
                <Text style={styles.logOutText}>Log out</Text>
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
        <Modal transparent={true} visible={map.visible} animationType={'slide'}>
          <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            ref={r => (this.map = r)}
            onPress={this.onMapPress}
            moveOnMarkerPress={false}
            onPoiClick={this.onMapPress}
            userLocationUpdateInterval={speedCheckInterval}
            onRegionChangeComplete={() => (selectedMarkers = [])}
            onMapReady={() => {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
              );
            }}
            onUserLocationChange={({
              nativeEvent: {
                coordinate: { latitude, longitude }
              }
            }) => {
              if (!this.mapCentered) {
                this.mapCentered = true;
                this.map.animateToRegion({
                  latitude,
                  longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                });
              }
              this.calculateSpeed({ latitude, longitude });
            }}
          >
            {todos.map(td => (
              <Marker
                key={td.rowid}
                title={td.name}
                description={td.date}
                opacity={
                  td.hidden && td.rowid !== selectedMarkers[1].rowid ? 0 : 1
                }
                onPress={({ nativeEvent: { position } }) =>
                  this.selectMarker(td, position)
                }
                coordinate={{
                  latitude: td.latitude,
                  longitude: td.longitude
                }}
              />
            ))}
            {!!translatedCoords.length && (
              <>
                <Circle
                  center={this.halfHalfMarker()}
                  radius={this.distanceMeters() / 4}
                />
                <Polyline
                  strokeWidth={6}
                  geodesic={false}
                  strokeColor='blue'
                  coordinates={translatedCoords[0]}
                />
                <Polyline
                  strokeWidth={6}
                  geodesic={false}
                  strokeColor='red'
                  coordinates={translatedCoords[1]}
                />
                <Polyline
                  strokeWidth={6}
                  geodesic={false}
                  strokeColor='green'
                  coordinates={translatedCoords[2]}
                />
                <Polyline
                  geodesic={false}
                  coordinates={[
                    {
                      latitude: selectedMarkers[0].latitude,
                      longitude: selectedMarkers[0].longitude
                    },
                    {
                      latitude: selectedMarkers[1].latitude,
                      longitude: selectedMarkers[1].longitude
                    }
                  ]}
                  strokeColor='#000'
                  strokeWidth={6}
                />
                <Marker pinColor={'blue'} coordinate={this.halfMarker()} />
                <Marker pinColor={'blue'} coordinate={translatedCoords[0][1]} />
                <Marker pinColor={'blue'} coordinate={translatedCoords[1][1]} />
              </>
            )}
          </MapView>
          <Text
            style={{
              left: 0,
              bottom: 0,
              padding: 10,
              fontSize: 15,
              borderWidth: 2,
              position: 'absolute',
              backgroundColor: 'white'
            }}
          >
            {speed.toFixed(2)} m/s
          </Text>
          <TouchableOpacity
            style={{
              top: 0,
              right: 0,
              width: 50,
              height: 50,
              padding: 10,
              position: 'absolute'
            }}
            onPress={() =>
              this.setState(
                ({ todos }) => ({
                  translatedCoords: [],
                  map: { visible: false },
                  todos: todos.map(td => ({ ...td, hidden: false }))
                }),
                () => delete this.mapCentered
              )
            }
          >
            <Icon name='times' size={30} color='black' />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              top: 0,
              left: 0,
              padding: 10,
              borderWidth: 2,
              position: 'absolute',
              backgroundColor: 'white'
            }}
            onPress={() => {
              selectedMarkers = [];
              this.setState(({ todos }) => ({
                translatedCoords: [],
                todos: todos.map(td => ({ ...td, hidden: false }))
              }));
            }}
          >
            <Text>Clear paths</Text>
          </TouchableOpacity>
        </Modal>
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
              onChangeText={text =>
                this.setState({
                  addToDoModalState: {
                    ...addToDoModalState,
                    name: text
                  }
                })
              }
            />
            <View
              style={{
                ...styles.addTodo,
                alignItems: 'center',
                flexDirection: 'row'
              }}
            >
              <Picker
                style={{ flex: 1 }}
                selectedValue={addToDoModalState.type}
                onValueChange={itemValue =>
                  this.setState({
                    addToDoModalState: {
                      ...addToDoModalState,
                      type: itemValue
                    }
                  })
                }
              >
                <Picker.Item label='Business' value='business' />
                <Picker.Item label='Casual' value='casual' />
                <Picker.Item label='Date' value='date' />
              </Picker>
            </View>
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
            </TouchableOpacity>
            <View
              style={{
                ...styles.addTodo,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <TextInput
                style={{ flex: 1 }}
                placeholder={'Location'}
                value={addToDoModalState.location}
                onChangeText={text =>
                  this.setState({
                    addToDoModalState: {
                      ...addToDoModalState,
                      location: text
                    }
                  })
                }
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={this.showMap}
                style={{ paddingHorizontal: 20 }}
              >
                <Icon name='map-marker' size={25} color='black' />
              </TouchableOpacity>
            </View>
            <View
              style={{
                ...styles.addTodo,
                alignItems: 'center',
                flexDirection: 'row'
              }}
            >
              <Picker
                style={{ flex: 1 }}
                selectedValue={addToDoModalState.importance}
                onValueChange={itemValue =>
                  this.setState({
                    addToDoModalState: {
                      ...addToDoModalState,
                      importance: itemValue
                    }
                  })
                }
              >
                <Picker.Item label='Very important' value='very' />
                <Picker.Item label='Less important' value='less' />
              </Picker>
            </View>
            <TextInput
              style={styles.addTodo}
              placeholder={'Details'}
              value={addToDoModalState.details}
              onChangeText={text =>
                this.setState({
                  addToDoModalState: {
                    ...addToDoModalState,
                    details: text
                  }
                })
              }
            />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={this.addTodo} style={styles.addButton}>
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
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)' }}>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Name:</Text>
              <TextInput
                placeholder={'Name'}
                style={{ ...styles.toDoModalDetailsRow, textAlign: 'right' }}
                value={showToDoModalState.name}
                onChangeText={text =>
                  this.setState({
                    showToDoModalState: {
                      ...showToDoModalState,
                      name: text
                    }
                  })
                }
              />
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Type:</Text>
              <Picker
                style={{ flex: 1 }}
                selectedValue={showToDoModalState.type}
                onValueChange={itemValue =>
                  this.setState({
                    showToDoModalState: {
                      ...showToDoModalState,
                      type: itemValue
                    }
                  })
                }
              >
                <Picker.Item label='Business' value='business' />
                <Picker.Item label='Casual' value='casual' />
                <Picker.Item label='Date' value='date' />
              </Picker>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Date:</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => this.setState({ showDatePicker: true })}
              >
                <TextInput
                  editable={false}
                  placeholder={'Date'}
                  value={showToDoModalState.date}
                  style={{ ...styles.addTodo, borderWidth: 0 }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Time:</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => this.setState({ showTimePicker: true })}
              >
                <TextInput
                  editable={false}
                  style={{ ...styles.addTodo, borderWidth: 0 }}
                  placeholder={'Time'}
                  value={showToDoModalState.time}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Location:</Text>
              <TextInput
                style={{ ...styles.toDoModalDetailsRow, textAlign: 'right' }}
                // placeholder={'Location'}
                value={showToDoModalState.location}
                onChangeText={text =>
                  this.setState({
                    showToDoModalState: {
                      ...showToDoModalState,
                      location: text
                    }
                  })
                }
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={this.showMap}
                style={{ paddingHorizontal: 20 }}
              >
                <Icon name='map-marker' size={25} color='black' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Importance:</Text>
              <Picker
                style={{ flex: 1 }}
                selectedValue={showToDoModalState.importance}
                onValueChange={itemValue =>
                  this.setState({
                    showToDoModalState: {
                      ...showToDoModalState,
                      importance: itemValue
                    }
                  })
                }
              >
                <Picker.Item label='Very important' value='very' />
                <Picker.Item label='Less important' value='less' />
              </Picker>
            </View>
            <View style={styles.modalItemContainer}>
              <Text style={styles.toDoModalDetailsRow}>Details:</Text>
              <TextInput
                placeholder={'Details'}
                style={{ ...styles.toDoModalDetailsRow, textAlign: 'right' }}
                value={showToDoModalState.details}
                onChangeText={text =>
                  this.setState({
                    showToDoModalState: {
                      ...this.state.showToDoModalState,
                      details: text
                    }
                  })
                }
              />
            </View>
            <TouchableOpacity
              onPress={this.onUpdate}
              style={{ backgroundColor: '#A269C5', padding: 10 }}
            >
              <Text style={{ textAlign: 'center' }}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#F59791', padding: 10 }}
              onPress={() => {
                [
                  'Name',
                  'Type',
                  'Date',
                  'Time',
                  'Location',
                  'Importance',
                  'Details',
                  'Finished'
                ].map(item => delete this[item.toLowerCase()]);
                this.setState({ showToDoModalState: { visible: false } });
              }}
            >
              <Text style={{ textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    );
  }
}
const styles = StyleSheet.create({
  modalItemContainer: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white'
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
    flex: 1,
    fontSize: 15,
    paddingTop: 10,
    paddingLeft: 5,
    color: '#FFFFFF',
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  todo: {
    flex: 1,
    fontSize: 15,
    paddingTop: 10,
    paddingLeft: 5,
    color: '#FFFFFF',
    paddingBottom: 10
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
    flex: 1,
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
  },
  logOutButton: {
    height: 30,
    marginRight: 50,
    marginLeft: 50,
    backgroundColor: '#D077CB',
    borderWidth: 0.5,
    borderColor: '#D077CB',
    borderRadius: 5,
    alignItems: 'center',
    paddingTop: 5,
    paddingLeft: 2,
    marginBottom: 10,
    marginTop: 290
  },
  logOutText: {
    color: '#fff',
    fontSize: 15
  }
});
