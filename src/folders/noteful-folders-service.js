const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("folders")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getFolderById(knex, id) {
    return knex.from("folders").where("id", id).first();
  },
  deleteFolder(knex, folderToDelete) {
    return knex("folders").where("id", folderToDelete).delete();
  },
  updateFolder(knex, folderToUpdate, updatedFolder) {
    return knex("folders").where("id", folderToUpdate).update(updatedFolder);
  },
};

module.exports = FoldersService;
