function makeNotesArray() {
  return [
    {
      id: 1,
      name: "Test Note 1",
      content: "Test Note 1 Content",
      modified: "2019-01-22T16:28:32.615Z",
      folder_id: 1,
    },
    {
      id: 2,
      name: "Test Note 2",
      content: "Test Note 2 Content",
      modified: "2019-01-22T16:28:32.615Z",
      folder_id: 2,
    },
    {
      id: 3,
      name: "Test Note 3",
      content: "Test Note 3 Content",
      modified: "2019-01-22T16:28:32.615Z",
      folder_id: 1,
    },
  ];
}

function makeNewNote() {
  return [
    {
      name: "New Test Note 3",
      content: "New Test Note 3 Content",
      folder_id: 1,
    },
  ];
}

function makeUpdatedNote() {
  return [
    {
      id: 1,
      name: "Updated Test Note 3",
      content: "Updated Test Note 3 Content",
      folder_id: 2,
    },
  ];
}

function makeShamNote() {
  return [
    {
      id: 1,
      note_age: "fake note",
    },
  ];
}

module.exports = {
  makeNotesArray,
  makeNewNote,
  makeUpdatedNote,
  makeShamNote,
};
