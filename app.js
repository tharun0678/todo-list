const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const intializeAndConnectDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message};`);
    process.exit(1);
  }
};

intializeAndConnectDB();

//API - 1
app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  const getData = `select * from todo
  where priority LIKE '%${priority}%' and status LIKE '%${status}%' and todo LIKE '%${search_q}%'`;

  const resultData = await db.all(getData);
  response.send(resultData);
});

//API - 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getData = `
    select * from todo where id = ${todoId};`;
  const resultData = await db.get(getData);
  response.send(resultData);
});

//API - 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const sendData = `
    insert into todo(id,todo,priority,status) values(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  const postData = await db.run(sendData);
  response.send(`Todo Successfully Added`);
});

//API - 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (priority === undefined && todo === undefined && status !== undefined) {
    const updateData = `update todo 
    set status = '${status}'
    where id = ${todoId}`;
    await db.run(updateData);
    response.send(`Status Updated`);
  } else if (
    priority !== undefined &&
    todo === undefined &&
    status === undefined
  ) {
    const updateData = `update todo 
    set priority = '${priority}'
    where id = ${todoId}`;
    await db.run(updateData);
    response.send(`Priority Updated`);
  } else if (
    priority === undefined &&
    todo !== undefined &&
    status === undefined
  ) {
    const updateData = `update todo 
    set todo = '${todo}'
    where id = ${todoId}`;
    await db.run(updateData);
    response.send(`Todo Updated`);
  }
});

//API - 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delData = `Delete from todo 
  where id=${todoId};`;
  await db.run(delData);
  response.send(`Todo Deleted`);
});

module.exports = app;
