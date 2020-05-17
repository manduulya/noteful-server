const path = require("path");
const express = require("express");
const xss = require("xss");
const notefulNotesService = require("./noteful-notes-service");
const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  name: xss(note.note_name),
  modified: note.modified,
  folderId: note.folder_id,
  content: xss(note.content),
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    notefulNotesService
      .getAllNotes(knexInstance)
      .then((note) => {
        res.json(note.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { note_name, modified, content, folder_id } = req.body;
    const newNote = { note_name, modified, content, folder_id };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` },
        });
    notefulNotesService
      .insertNote(knexInstance, newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    notefulNotesService
      .getById(knexInstance, req.params.note_id)
      .then((note) => {
        if (!note) {
          return res.status(400).json({
            error: { message: `Note doesn't exist` },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");
    const deleteNoteId = res.note.id;

    notefulNotesService
      .deleteNote(knexInstance, deleteNoteId)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { note_name, modified, content, folder_id } = req.body;
    const noteToUpdate = { note_name, modified, content, folder_id };
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'style' or 'content'`,
        },
      });

    notefulNotesService
      .updateNote(req.app.get("db"), req.params.note_id, articleToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
