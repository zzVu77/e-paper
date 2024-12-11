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
  findAll(){
    return db("articles")
      .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
      .leftJoin("article_tags", "articles.id", "article_tags.article_id")
      .leftJoin("tags", "article_tags.tag_id", "tags.id")
      .groupBy("articles.id")
  },
  findAllByAuthorID(author_id) {
    return db("articles")
        .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
        .leftJoin("article_tags", "articles.id", "article_tags.article_id")
        .leftJoin("tags", "article_tags.tag_id", "tags.id")
        .where("articles.author", author_id)
        .groupBy("articles.id");
  },
  findByStatus(status) {
    return db("articles")
      .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
      .leftJoin("article_tags", "articles.id", "article_tags.article_id")
      .leftJoin("tags", "article_tags.tag_id", "tags.id")
      .where("articles.status", status)
      .groupBy("articles.id")
      .then(rows => {
        if (rows.length === 0) return null;
        const article = rows[0];
        article.tags = article.tags ? article.tags.split(",") : [];
        return article;
      });
  },
  findByStatusAndAuthorID(status, author_id) {
    return db("articles")
        .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
        .leftJoin("article_tags", "articles.id", "article_tags.article_id")
        .leftJoin("tags", "article_tags.tag_id", "tags.id")
        .where("articles.status", status)
        .andWhere("articles.author", author_id)
        .groupBy("articles.id")
        .then(rows => {
            if (rows.length === 0) return null;
            const article = rows[0];
            article.tags = article.tags ? article.tags.split(",") : [];
            return article;
        });
  },
  findById(id) {
    return db("articles")
      .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
      .leftJoin("article_tags", "articles.id", "article_tags.article_id")
      .leftJoin("tags", "article_tags.tag_id", "tags.id")
      .where("articles.id", id)
      .groupBy("articles.id")
      .then(rows => {
        if (rows.length === 0) return null;
        const article = rows[0];
        article.tags = article.tags ? article.tags.split(",") : [];
        return article;
      });
  },
  
  add(entity) {
    return db("articles").insert(entity);
  },
  patch(id, entity) {
    return db('articles').where('id', id).update(entity);
  },
  countByStatus(status) {
    return db('articles').where('status', status).count('* as total').first();
  },
  countByStatusAndAuthorID(status, author_id) {
    return db("articles").where("status", status).andWhere("author", author_id).count("* as total").first();
  },
  countAllArticles() {
    return db('articles').count('* as total').first();
  },
  countAllArticlesByAuthorID(author_id) {
    return db("articles").where("author", author_id).count("* as total").first();
  },
  findPage(limit, offset) {
    return db("articles")
      .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags")) // Gom tất cả tên thẻ vào một cột
      .leftJoin("article_tags", "articles.id", "article_tags.article_id") // Thực hiện left join với article_tags
      .leftJoin("tags", "article_tags.tag_id", "tags.id") // Thực hiện left join với tags
      .groupBy("articles.id") // Nhóm theo id bài viết để loại bỏ trùng lặp
      .limit(limit)
      .offset(offset);
  },
  findPageByAuthorID(limit, offset, author_id) {
    return db("articles")
        .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags")) // Gom tất cả tên thẻ vào một cột
        .leftJoin("article_tags", "articles.id", "article_tags.article_id") // Thực hiện left join với article_tags
        .leftJoin("tags", "article_tags.tag_id", "tags.id") // Thực hiện left join với tags
        .where("articles.author", author_id)
        .groupBy("articles.id") // Nhóm theo id bài viết để loại bỏ trùng lặp
        .limit(limit)
        .offset(offset);
  },
  findPageByStatus(limit,offset,status){
    return db("articles")
    .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags")) // Gom tất cả tên thẻ vào một cột
    .leftJoin("article_tags", "articles.id", "article_tags.article_id") // Thực hiện left join với article_tags
    .leftJoin("tags", "article_tags.tag_id", "tags.id") // Thực hiện left join với tags
    .where("articles.status", status) // Thêm điều kiện lọc theo status
    .groupBy("articles.id") // Nhóm theo id bài viết để loại bỏ trùng lặp
    .limit(limit)
    .offset(offset);
  },
  findPageByStatusAndAuthorID(limit, offset, status, author_id) {
    return db("articles")
        .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags")) // Gom tất cả tên thẻ vào một cột
        .leftJoin("article_tags", "articles.id", "article_tags.article_id") // Thực hiện left join với article_tags
        .leftJoin("tags", "article_tags.tag_id", "tags.id") // Thực hiện left join với tags
        .where("articles.status", status) // Thêm điều kiện lọc theo status
        .andWhere("articles.author", author_id)
        .groupBy("articles.id") // Nhóm theo id bài viết để loại bỏ trùng lặp
        .limit(limit)
        .offset(offset);
  },
  deleteById(id){
    return db("articles").where('id', id).del();
  },
  // getArticlesByTags(tagIDs) {
  //   return db("articles")
  //     .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
  //     .join("article_tags", "articles.id", "=", "article_tags.article_id")
  //     .join("tags", "tags.id", "=", "article_tags.tag_id")
  //     .whereIn("article_tags.tag_id", tagIDs) // Lọc theo danh sách tagID
  //     .groupBy("articles.id");
  // },
  // getArticlesByFilter(tagIDs, startDate, endDate) {
  //   return db("articles")
  //     .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
  //     .join("article_tags", "articles.id", "=", "article_tags.article_id")
  //     .join("tags", "tags.id", "=", "article_tags.tag_id")
  //     // .whereIn("article_tags.tag_id", tagIDs)
  //     .whereBetween("articles.created_at", [startDate, endDate])
  //     .groupBy("articles.id"); // Nhóm theo id bài viết
  // },
  
};
