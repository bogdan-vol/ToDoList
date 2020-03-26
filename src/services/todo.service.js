import authService from './auth.service';
import {request} from './commons.service';

const getTodos = () => request('todo/todos', 'GET', null, authService);

const postTodo = async (body, cred) =>
  request('todo/todos', 'POST', body, cred);

export default {
  getTodos,
  postTodo,
};
