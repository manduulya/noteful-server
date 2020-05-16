function makeFoldersArray() {
  return [
    {
      id: 1,
      name: "Folder 1",
    },
    {
      id: 2,
      name: "Folder 2",
    },
    {
      id: 3,
      name: "Folder 3",
    },
  ];
}

function makeNewFolder() {
  return [
    {
      name: "New Folder 1",
    },
  ];
}

function makeUpdatedFolder() {
  return [
    {
      id: 1,
      name: "Updated folder 1",
    },
  ];
}

function makeShamFolder() {
  return [
    {
      id: 1,
      title: "sham folder",
    },
  ];
}

module.exports = {
  makeFoldersArray,
  makeNewFolder,
  makeUpdatedFolder,
  makeShamFolder,
};
