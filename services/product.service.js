import db from "../utils/db.js";
export default {
  findAll() {
    return db("papers");
  },
};
