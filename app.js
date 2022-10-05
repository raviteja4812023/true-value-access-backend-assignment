const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    firstName: dbObject.first_name,
    lastName: dbObject.last_name,
    companyName: dbObject.company_name,
    city: dbObject.city,
    state: dbObject.state,
    zip: dbObject.zip,
    email: dbObject.email,
    web: dbObject.web,
    age: dbObject.age,
  };
};

app.get("/users/", async (request, response) => {
  const { page, priority, sort } = request.query;
  if (!page) {
    page = 1;
  }
  const getUsersQuery = `
    SELECT
      *
    FROM
      user
    LIMIT 10;`;
  const usersArray = await database.all(getUsersQuery);
  response.send(
    usersArray.map((eachUser) => convertDbObjectToResponseObject(eachUser))
  );
});

app.get("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const getUserQuery = `
    SELECT 
      * 
    FROM 
      user 
    WHERE 
      id = ${Id};`;
  const user = await database.get(getUserQuery);
  response.send(convertDbObjectToResponseObject(user));
});

app.post("/users/", async (request, response) => {
  const {
    id,
    firstName,
    lastName,
    companyName,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = request.body;
  const postUserQuery = `
  INSERT INTO
    user (first_name,last_name,company_name,city,state,zip,email,web,age)
  VALUES
    ('${firstName}', ${lastName},${companyName},
    ${city},${state},${zip},${email},${web},'${age}');`;

  const user = await database.run(postUserQuery);
  response.send("User Created Successfully");
});

app.put("/users/:id/", async (request, response) => {
  const { firstName, lastName, age } = request.body;
  const { Id } = request.params;
  const updateUserQuery = `
  UPDATE
    user
  SET
    first_name = '${firstName}',
    last_name = ${lastName},
    age = '${age}'
  WHERE
    id = ${Id};`;

  await database.run(updateUserQuery);
  response.send("User Details Updated");
});

app.delete("/users/:id/", async (request, response) => {
  const { Id } = request.params;
  const deleteUserQuery = `
  DELETE FROM
    user
  WHERE
    id = ${Id};`;
  await database.run(deleteUserQuery);
  response.send("User Removed");
});
module.exports = app;

