import {request} from './commons.service';

const getTodos = () => request('todo/todos');

const postTodo = async body =>
  request('todo/todos', 'POST', JSON.stringify(body));

const deleteTodo = async body =>
  request('todo/todos/:id', 'DELETE', JSON.stringify(body));  

export default {
  getTodos,
  postTodo,
  deleteTodo
};
