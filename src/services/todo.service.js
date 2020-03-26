import {request} from './commons.service';

const getTodos = () => request('todo/todos');

const postTodo = async body => request('todo/todos', 'POST', body);

export default {
  getTodos,
  postTodo,
};
