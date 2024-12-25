import db from "../utils/db.js";

export default {
    getByArticleId(id) {
      return db("rejection_notes").where("article_id", id);
    },
  };
  