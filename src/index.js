const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user)
    return response.status(400).json({
      error: "Usuário não encontrado",
    });

  request.user = user;
  next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo)
    return response.status(404).json({
      error: "Todo não encontrado",
    });

  request.todo = todo;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists)
    return response.status(400).json({
      error: "Usuário já existe",
    });

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = deadline;
  return response.status(200).send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, checksExistsTodo, (request, response) => {

  const { todo } = request;

  todo.done = true;
  return response.status(200).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request;
  const index = user.todos.indexOf(todo);
  user.todos.splice(index,1);
  return response.status(204).send();
});

module.exports = app;
