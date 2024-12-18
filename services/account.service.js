import db from "../utils/db.js";

// ...existing code...
export default {
  async getUserByEmail(email) {
    return await db("users").where("email", email).first();
  },
};
