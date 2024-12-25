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
  async updatePassword(email, password) {
    try {
      // Kiểm tra xem email có tồn tại hay không
      const user = await db("users").where("email", email).first();

      if (!user) {
        return { success: false, errorMessage: "Account does not exist" };
      }

      // Cập nhật mật khẩu
      await db("users").where("email", email).update("password", password);
      return { success: true };
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, error };
    }
  },
};
