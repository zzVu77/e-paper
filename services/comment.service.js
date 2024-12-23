import db from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
export default {
  async getCommentByArticleId(articleId) {
    return db("comments")
      .join("users", "comments.user_id", "=", "users.id")
      .select(
        "comments.id as comment_id",
        "comments.content",
        "comments.comment_date",
        "users.name as commenter_name"
      )
      .where("comments.article_id", articleId)
      .orderBy("comments.comment_date", "desc");
  },
  async addComment(articleId, userId, content) {
    const userName = await db("users")
      .select("name")
      .where("id", userId)
      .first();
    try {
      const newComment = {
        id: uuidv4(), // Tạo UUID cho comment
        article_id: articleId,
        user_id: userId,
        content: content,
        comment_date: new Date(), // Lấy thời gian hiện tại
      };

      // Chèn comment mới vào bảng comments
      await db("comments").insert(newComment);
      return {
        success: true,
        data: newComment, // Trả về thông tin comment vừa thêm
        userName: userName.name,
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      return {
        success: false,
        message: "Unable to add comment.",
        error: error.message, // Trả về chi tiết lỗi
      };
    }
  },
};
