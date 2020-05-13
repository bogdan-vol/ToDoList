import { request } from './commons.service';

const getTodos = () => request('todo/todos');

const deleteTodo = id => request(`todo/todos/${id}`, 'DELETE');

const postTodo = body => request('todo/todos', 'POST', JSON.stringify(body));

const updateTodo = (id, body) =>
  request(`todo/todos/${id}`, 'PUT', JSON.stringify(body));

export default {
  getTodos,
  postTodo,
  updateTodo,
  deleteTodo
};
