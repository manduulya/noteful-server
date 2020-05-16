const knex = require("knex");
const app = require("../src/app");

const { makeFoldersArray } = require("./folders-fixtures");
const {
  makeNotesArray,
  makeNewNote,
  makeUpdatedNote,
  makeShamNote,
} = require("./notes-fixtures");

describe(`Notes Endpoints`, function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /api/notes`, () => {
    context(`Given no notes in the database`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/notes").expect(200, []);
      });
    });
    context(`Given there are notes in the database`, () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("folders")
          .insert(testFolders)
          .then(() => {
            return db.into("notes").insert(testNotes);
          });
      });

      it(`responds with 200 and all of the notes`, () => {
        return supertest(app).get("/api/notes").expect(200, testNotes);
      });
    });
  });

  describe(`POST /api/notes`, () => {
    const testFolders = makeFoldersArray();

    before("insert folders and notes", () => {
      //change to beforeeach if more tests are added for post
      return db.into("folders").insert(testFolders);
    });

    it(`responds with 200 and the created note`, () => {
      const testNote = makeNewNote()[0]; //get object from array

      return supertest(app)
        .post("/api/notes")
        .send(testNote)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(testNote.name);
          expect(res.body.content).to.eql(testNote.content);
          expect(res.body.folder_id).to.eql(testNote.folder_id);
        });
    });
  });

  describe(`DELETE /api/notes`, () => {
    context(`Given no notes in the database`, () => {
      it(`responds with 400 error when you try to delete note that doesn't exist`, () => {
        const shamNoteId = 989898;
        return supertest(app).delete(`/api/notes/${shamNoteId}`).expect(404);
      });
    });

    context(`Given notes in the database`, () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("folders")
          .insert(testFolders)
          .then(() => {
            return db.into("notes").insert(testNotes);
          });
      });

      it(`responds with 200 when note in database is deleted`, () => {
        const deleteNoteId = testNotes[0].id;
        const remainingNotes = testNotes.filter((note) => {
          note.id !== deleteNoteId;
        });

        return supertest(app)
          .delete(`/api/notes/${deleteNoteId}`)
          .expect(204)
          .then(() => {
            supertest(app).get(`/api/notes`).expect(remainingNotes);
          });
      });
    });
  });

  describe(`PATCH /api/notes`, () => {
    context(`Given no notes in the database`, () => {
      it(`responds with 400 error when non-existent note is patched`, () => {
        const shamNoteId = 8696886;

        return supertest(app).patch(`/api/notes/${shamNoteId}`).expect(404);
      });
    });

    context(`Given notes in the database`, () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("folders")
          .insert(testFolders)
          .then(() => {
            return db.into("notes").insert(testNotes);
          });
      });

      it(`responds with 400 error when wrong field is sent`, () => {
        const shamNote = makeShamNote()[0]; //extract note for object

        return supertest(app)
          .patch(`/api/notes/${shamNote.id}`)
          .send(shamNote)
          .expect(400);
      });

      it(`responds with 200 message when note is updated succesfully`, () => {
        const updatedNote = makeUpdatedNote()[0];

        return supertest(app)
          .patch(`/api/notes/${updatedNote.id}`)
          .send(updatedNote)
          .expect(204)
          .then(() => {
            supertest(app)
              .get(`/api/notes/${updatedNote.id}`)
              .expect(201)
              .expect((res) => {
                //test case when all fields were updated
                expect(res.body.name).to.eql(testNote.name);
                expect(res.body.content).to.eql(testNote.content);
                expect(res.body.folder_id).to.eql(testNote.folder_id);
              });
          });
      });
    });
  });
});
