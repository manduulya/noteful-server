const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("noteful_folders");
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("noteful_folders")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getFolderById(knex, id) {
    return knex.from("noteful_folders").where("id", id).first();
  },
  deleteFolder(knex, folderToDelete) {
    return knex("noteful_folders").where("id", folderToDelete).delete();
  },
  updateFolder(knex, folderToUpdate, updatedFolder) {
    return knex("noteful_folders")
      .where("id", folderToUpdate)
      .update(updatedFolder);
  },
};

module.exports = FoldersService;
