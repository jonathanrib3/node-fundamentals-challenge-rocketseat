const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user =   users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ message: "User doesnt exists" });
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (!name || !username) {
    return response.status(400).send({ message: "Invalid data" });
  }

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).send({ error: "Username already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  return response.status(200).send(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const user = request.user;
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo); 
  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  todo_update = request.user.todos.find((todo) => todo.id === id);

  if(!todo_update) {
    return response.status(404).send({ error: 'Todo doesnt exists' });
  }

  todo_update.title = title;
  todo_update.deadline = deadline;

  return response.status(200).send(todo_update);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo_update = request.user.todos.find((todo) => todo.id === id);

  if (!todo_update) {
    return response.status(404).send({ error: 'Todo doesnt exists' })
  }

  todo_update.done = true;

  return response.status(200).send(todo_update);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoExists = request.user.todos.find((todo) => todo.id === id);

  if(!todoExists) {
    return response.status(404).send({ error: 'Todo doesnt exists' });
  }

  request.user.todos = request.user.todos.filter((todo) => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;