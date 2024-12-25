import db from "../utils/db.js";

export default {
  async getAllArticles() {
    return db("articles as a")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
      .innerJoin("users as u", "a.author", "u.id")
      .innerJoin("categories as c", "a.category_id", "c.id")
      .select(
        "a.id as article_id",
        "a.title as article_title",
        "a.abstract as article_abstract",
        "a.content as article_content",
        "a.image_url as article_image_url",
        "a.status as article_status",
        "a.is_premium as article_is_premium",
        "a.views as article_views",
        "a.publish_date as article_publish_date",
        "u.name as author_name",
        "c.name as category_name",
        db.raw("GROUP_CONCAT(t.name) as article_tags")
      )
      .where("u.role", "writer")
      .groupBy(
        "a.id",
        "a.title",
        "a.abstract",
        "a.content",
        "a.image_url",
        "a.status",
        "a.is_premium",
        "a.views",
        "a.publish_date",
        "u.name",
        "c.name"
      )
      .then((rows) => {
        // Chuyển đổi kết quả thành format phù hợp
        return rows.map((row) => ({
          article_id: row.article_id,
          article_title: row.article_title,
          article_abstract: row.article_abstract,
          article_content: row.article_content,
          article_image_url: row.article_image_url,
          article_status: row.article_status,
          article_is_premium: row.article_is_premium,
          article_views: row.article_views,
          article_publish_date: row.article_publish_date,
          author_name: row.author_name,
          category_name: row.category_name,
          article_tags: row.article_tags ? row.article_tags.split(",") : [],
        }));
      });
  },
  getById(id) {
    return db("users")
      .select("users.*")
      .where("id", id)
  },
  patch(id, entity) {
    return db("users").where("id", id).update(entity);
  },
};