import { request } from './commons.service';

const login = (user, password) =>
  request('user/login', 'POST', JSON.stringify({ user, password }));

const register = (user, password) =>
  request('user/register', 'POST', JSON.stringify({ user, password }));

export default {
  login,
  register
};
