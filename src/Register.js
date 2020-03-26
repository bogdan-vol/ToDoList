import React from 'react';
import {
  Text,
  Alert,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import {Actions} from 'react-native-router-flux';

import authService from './services/auth.service';

export default class Register extends React.Component {
  state = {
    user: '',
    password: '',
    passwordRepeated: '',
  };

  register = async () => {
    let {user, password} = this.state;
    let reg = await authService.register(user, password);
    if (reg.err)
      return Alert.alert('Sorry but...', reg.err, [{text: 'OK'}], {
        cancelable: false,
      });
    if (reg.authenticated) {
      authService.user = user;
      authService.password = password;
      Actions.toDoList();
    }
  };

  render() {
    let {user, password, passwordRepeated} = this.state;
    let registerDisabled =
      !user || password.length < 8 || password !== passwordRepeated;
    return (
      <ImageBackground
        source={require('../assets/images/login9.jpg')}
        style={{width: '100%', height: '100%'}}>
        <SafeAreaView style={{padding: 20, flex: 1}}>
          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.loginTitle}>Register</Text>
            <TextInput
              value={user}
              style={styles.inputField}
              onChangeText={usr => this.setState({user: usr})}
              placeholder={'Username'}
            />

            {!!password && password.length < 8 && (
              <Text
                style={{
                  color: 'rgba(255, 50, 100, 1)',
                }}>
                The password must have at least 8 characters!
              </Text>
            )}
            <TextInput
              secureTextEntry={true}
              value={password}
              style={styles.inputField}
              onChangeText={pass => this.setState({password: pass})}
              placeholder={'Password'}
            />

            {password !== passwordRepeated && !!passwordRepeated && (
              <Text
                style={{
                  color: 'rgba(255, 50, 100, 1)',
                }}>
                Passwords musth match!
              </Text>
            )}
            <TextInput
              secureTextEntry={true}
              value={passwordRepeated}
              style={styles.inputField}
              onChangeText={pass => this.setState({passwordRepeated: pass})}
              placeholder={'Repeat password'}
            />
            <TouchableOpacity
              disabled={registerDisabled}
              style={[
                styles.registerButton,
                registerDisabled ? {opacity: 0.5} : {},
              ]}
              onPress={this.register}>
              <Text style={styles.loginText}>Register</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  loginTitle: {
    fontFamily: 'sans-serif-medium',
    paddingTop: 50,
    paddingBottom: 50,
    fontSize: 50,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    letterSpacing: 5,
    textShadowOffset: {width: 4, height: 4},
    textShadowRadius: 4,
    textShadowColor: '#F5A9BC',
  },
  registerButton: {
    height: 50,
    backgroundColor: '#FA5882',
    borderWidth: 0.5,
    borderColor: '#FA5882',
    borderRadius: 5,
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 20,
  },
  inputField: {
    fontSize: 18,
    height: 40,
    color: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 30,
  },
});
