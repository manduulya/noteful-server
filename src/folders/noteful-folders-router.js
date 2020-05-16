const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const FoldersService = require("./noteful-folders-service");
const foldersRouter = express.Router();
const bodyParser = express.json();
const { v4: uuidv4 } = require("uuid");

//serialize folder- xss
const serializeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.name),
});

//Add a new folder
foldersRouter
  .route("/api/folders")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");

    FoldersService.getAllFolders(knexInstance)
      .then((folders) => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { name } = req.body;
    const newFolder = { name, id: uuidv4() };

    if (!name) {
      return res.status(400).json({
        error: { message: `Missing Folder Name in request body` },
      });
    }

    FoldersService.insertFolder(knexInstance, newFolder)
      .then((folder) => {
        logger.info(`Folder with id ${folder.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/api/folders/:id")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;

    FoldersService.getFolderById(knexInstance, id)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder Not Found` },
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");
    const folderToDelete = req.params.id;

    FoldersService.deleteFolder(knexInstance, folderToDelete)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const folderToUpdate = req.params.id;
    const { name } = req.body;
    const updatedFolder = { name };

    if (!name) {
      return res.status(400).json({
        error: { message: `Request body must contain Folder Name` },
      });
    }

    FoldersService.updateFolder(knexInstance, folderToUpdate, updatedFolder)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
