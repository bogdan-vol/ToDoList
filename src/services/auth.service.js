import {request} from './commons.service';

const login = async (user, password) =>
  request('user/login', 'POST', JSON.stringify({user, password}));

const register = async (user, password) =>
  request('user/register', 'POST', JSON.stringify({user, password}));

export default {
  login,
  register,
};
