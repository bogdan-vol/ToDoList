const rootUrl = 'http://192.168.68.105:5000';
import authService from './auth.service';

export const request = async (route, method, body) =>
  await (await fetch(`${rootUrl}/${route}`, {
    body,
    method: method || 'GET',
    headers: {
      ...authService,
      'Content-Type': 'application/json'
    }
  })).json();
