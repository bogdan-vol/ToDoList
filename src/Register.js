import React from 'react';
import {ScrollView, Text, TextInput, SafeAreaView, TouchableOpacity, StyleSheet, ImageBackground} from 'react-native';
import authService from './services/auth.service'
import { Actions } from 'react-native-router-flux';

export default class Register extends React.Component {
    state = {
        user: '',
        password: ''
    };

    login = async () => {
        let { user, password } = this.state;
        let auth = await authService.login(user, password);
        if (auth.authenticated) Actions.toDoList();
    }

    render() {
        let { user, password } = this.state;
        return (
            <ImageBackground 
                source={require("../assets/images/login9.jpg")}
                style={{width: '100%', height: '100%'}}>
                <ScrollView style={styles.content}>
                    <SafeAreaView>
                        <Text style={styles.loginTitle}>Login</Text>
                        <TextInput
                            value={user}
                            style={styles.inputField}
                            onChangeText={usr => this.setState({ user: usr })}
                            placeholder={"Username"}
                        />
                        <TextInput
                            secureTextEntry={true}
                            value={password}
                            style={styles.inputField}
                            onChangeText={pass => this.setState({ password: pass })}
                            placeholder={"Password"}
                        />
                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={this.login}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.registerButton}
                            onPress={this.register}>
                            <Text style={styles.loginText}>Register</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </ScrollView>
            </ImageBackground>
        )
    }
}


const styles = StyleSheet.create({
    content: {
      flex: 1,
      flexDirection: 'column'
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
      textShadowColor: '#F5A9BC'
    },
    loginButton: {
      height: 50,
      marginRight: 20,
      marginLeft: 20,
      backgroundColor: "#0489B1",
      borderWidth: 0.5,
      borderColor: '#0489B1',
      borderRadius: 5,
      alignItems: 'center',
      paddingTop: 10,
      marginBottom: 10
    },
    registerButton: {
      height: 50,
      marginRight: 20,
      marginLeft: 20,
      backgroundColor: "#FA5882",
      borderWidth: 0.5,
      borderColor: '#FA5882',
      borderRadius: 5,
      alignItems: 'center',
      paddingTop: 10,
      marginBottom: 10
    },
    loginText: {
      color: '#fff',
      fontSize: 20,
    },
    inputField: {
      fontSize: 18,
      height: 40,
      color: '#ffffff',
      marginRight: 20,
      marginLeft: 20,
      borderWidth: 0.5,
      borderColor: '#ffffff',
      borderRadius: 5,
      marginBottom: 30
    }
  });