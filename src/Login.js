import React from 'react';

import { View, TextInput, TouchableOpacity, Text } from 'react-native';

import authService from './services/auth.service'
import { Actions } from 'react-native-router-flux';

export default class Login extends React.Component {
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
        return (<View style={{ width: '100%', height: '100%' }}>
            <TextInput
                value={user}
                onChangeText={usr => this.setState({ user: usr })}
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            />
            <TextInput
                value={password}
                onChangeText={pass => this.setState({ password: pass })}
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            />
            <TouchableOpacity onPress={this.login}>
                <Text>Login</Text>
            </TouchableOpacity>
        </View>)
    }
}