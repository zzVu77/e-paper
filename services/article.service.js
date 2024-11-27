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
      );
  },

  async getTopTrendingArticles() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return db("articles as a")
      .leftJoin("comments as c", "a.id", "c.article_id")
      .where("a.publish_date", ">=", oneWeekAgo)
      .groupBy("a.id")
      .orderBy([
        { column: db.raw("COUNT(c.id)"), order: "desc" },
        { column: "a.views", order: "desc" }
      ])
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
        db.raw("COUNT(c.id) as comment_count")
      )
      .limit(10);
  },

  //get 10 most viewed articles in all time:

  async getMostViewedArticles() {
    return db("articles")
      .orderBy("views", "desc")
      .select(
        "id as article_id",
        "title as article_title",
        "abstract as article_abstract",
        "content as article_content",
        "image_url as article_image_url",
        "status as article_status",
        "is_premium as article_is_premium",
        "views as article_views",
        "publish_date as article_publish_date"
      )
      .limit(10);
  },

  //get 10 latest articles: 

  async getLatestArticles() {
    return db("articles")
      .orderBy("publish_date", "desc")
      .select(
        "id as article_id",
        "title as article_title",
        "abstract as article_abstract",
        "content as article_content",
        "image_url as article_image_url",
        "status as article_status",
        "is_premium as article_is_premium",
        "views as article_views",
        "publish_date as article_publish_date"
      )
      .limit(10);
  },

  //from top 10 categories, get 1 latest articles of each category:

  async getLatestArticleOfTopCategories() {
    return db("categories as c")
      .leftJoin("articles as a", "c.id", "a.category_id")
      .orderBy("a.publish_date", "desc")
      .select(
        "c.id as category_id",
        "c.name as category_name",
        "a.id as article_id",
        "a.title as article_title",
        "a.abstract as article_abstract",
        "a.content as article_content",
        "a.image_url as article_image_url",
        "a.status as article_status",
        "a.is_premium as article_is_premium",
        "a.views as article_views",
        "a.publish_date as article_publish_date"
      )
      .limit(10);
  },
};