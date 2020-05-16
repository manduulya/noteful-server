const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const {
  makeFoldersArray,
  makeNewFolder,
  makeUpdatedFolder,
  makeShamFolder,
} = require("./folders-fixtures");

describe("Folders Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());
  before("clean the table", () =>
    db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
  );
  afterEach("cleanup", () =>
    db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/folders`, () => {
    context(`Given no folders in the database`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/folders")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it(`responds with 200 and all of the folders`, () => {
        return supertest(app).get("/api/folders").expect(200, testFolders);
      });
    });
  });

  describe(`POST /api/folders`, () => {
    it(`responds with 200 and the created folder`, () => {
      const testFolder = makeNewFolder()[0]; //get object from array

      return supertest(app)
        .post("/api/folders")
        .send(testFolder)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(testFolder.name);
        });
    });
  });

  describe(`DELETE /api/folders`, () => {
    context(`Given no folders in the database`, () => {
      it(`responds with 400 error when you try to delete folder that doesn't exist`, () => {
        const shamfolder_id = 878787;
        return supertest(app)
          .delete(`/api/folder/${shamfolder_id}`)
          .expect(404);
      });
    });

    context(`Given folders in the database`, () => {
      const testFolders = makeFoldersArray();

      before("insert folders", () => {
        //change to beforeeach if other tests are added
        return db.into("folders").insert(testFolders);
      });

      it(`responds with 200 when folder in database is deleted`, () => {
        const deletefolder_id = testFolders[0].folder_id;
        const currentFolders = testFolders.filter((folder) => {
          folder.folder_id !== deletefolder_id;
        });

        return supertest(app)
          .delete(`/api/folders/${deletefolder_id}`)
          .expect(204)
          .then(() => {
            supertest(app).get(`/api/folders`).expect(currentFolders);
          });
      });
    });
  });

  describe(`PATCH /api/folders`, () => {
    context(`Given no folders in the database`, () => {
      it(`responds with 400 error when non-existent folder is patched`, () => {
        const shamfolder_id = 6363;

        return supertest(app)
          .patch(`/api/folders/${shamfolder_id}`)
          .expect(404);
      });
    });

    context(`Given folders in the database`, () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it(`responds with 400 error when required folder name field is missing`, () => {
        const shamfolder = makeShamFolder()[0]; //extract folder for object

        return supertest(app)
          .patch(`/api/folders/${shamfolder.folder_id}`)
          .send(shamfolder)
          .expect(400);
      });

      it(`responds with 200 message when folder is updated succesfully`, () => {
        const updatedFolder = makeUpdatedFolder()[0];

        return supertest(app)
          .patch(`/api/folders/${updatedFolder.folder_id}`)
          .send(updatedFolder)
          .expect(204)
          .then(() => {
            supertest(app)
              .get(`/api/folders/${updatedFolder.folder_id}`)
              .expect(201)
              .expect((res) => {
                expect(res.name).to.eql(updatedFolder.name);
              });
          });
      });
    });
  });
});
