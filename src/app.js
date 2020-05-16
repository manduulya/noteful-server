require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const app = express();
// const notefulNotesRouter = require("./notes/noteful-notes-router");
// const notefulFoldersRouter = require("./folders/noteful-folders-router");
const morganOption = NODE_ENV === "production";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
// app.use("/api/notes", notefulNotesRouter);
// app.use("/api/folders", notefulFoldersRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/xss", (req, res) => {
  res.cookie("secretToken", "12345679");
  req.sendFile(__dirname + "/xss-example.html");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
