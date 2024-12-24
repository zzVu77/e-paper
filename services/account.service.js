import db from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";

// ...existing code...
export default {
  async getUserByEmail(email) {
    return await db("users").where("email", email).first();
  },
  async addUser(name, email, birthdate, password, role, subscription_expiry) {
    const id = uuidv4(); // Generate a new UUID
    try {
      await db("users").insert({
        id,
        name,
        email,
        birthdate,
        password,
        role: "guest",
        subscription_expiry,
      });
      return { success: true, id };
    } catch (error) {
      console.error("Error adding user:", error);
      return { success: false, error };
    }
  },
};
