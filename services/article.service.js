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
  
  async getArticlesByCategory(categoryName) {
    // Lấy thông tin category từ tên
    const category = await db("categories").where("name", categoryName).first();

    if (!category) {
      throw new Error("Category không tồn tại");
    }

    let categoryIds = [];
    if (category.parent_id === null) {
      // Nếu là parent, lấy tất cả các category con và chính nó
      const childCategories = await db("categories")
        .where("parent_id", category.id)
        .select("id");
      categoryIds = [category.id, ...childCategories.map((cat) => cat.id)];
    } else {
      // Nếu là child, chỉ lấy chính nó
      categoryIds = [category.id];
    }

    // Lấy bài viết thuộc các category ID
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
      .whereIn("a.category_id", categoryIds) // Lọc theo các category ID
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
  async getArticlesByTag(tagName) {
    if (tagName === "Premium") {
      // Trường hợp đặc biệt: Lấy các bài viết Premium
      return db("articles as a")
        .innerJoin("users as u", "a.author", "u.id")
        .innerJoin("categories as c", "a.category_id", "c.id")
        .leftJoin("article_tags as at", "a.id", "at.article_id")
        .leftJoin("tags as t", "at.tag_id", "t.id")
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
        .where("a.is_premium", true)
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
    }

    // Trường hợp bình thường: Lấy bài viết theo tag
    const tag = await db("tags").where("name", tagName).first();

    if (!tag) {
      throw new Error("Tag không tồn tại");
    }

    return db("articles as a")
      .innerJoin("article_tags as at", "a.id", "at.article_id")
      .innerJoin("tags as t", "at.tag_id", "t.id")
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
      .where("t.name", tagName) // Lọc bài viết theo tag name
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

  // get trending articles
  async getTopTrendingArticles() {
    const today = new Date();
    today.setDate(today.getDate());

    return db("articles as a")
      .leftJoin("comments as c", "a.id", "c.article_id")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
      .innerJoin("categories as cat", "a.category_id", "cat.id")
      .where("a.publish_date", "<=", today)
      .groupBy("a.id")
      .orderBy([
        { column: db.raw("COUNT(c.id)"), order: "desc" },
        { column: "a.views", order: "desc" },
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
        db.raw("COUNT(c.id) as comment_count"),
        "cat.name as category_name",
        db.raw("GROUP_CONCAT(t.name) as article_tags")
      )
      .limit(10)
      .then((rows) => {
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

  // get most viewed articles
  async getMostViewedArticles() {
    return db("articles as a")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
      .innerJoin("categories as c", "a.category_id", "c.id")
      .innerJoin("users as u", "a.author", "u.id")
      .orderBy("a.views", "desc")
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
      .limit(10)
      .then((rows) => {
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

  // get latest articles
  async getLatestArticles() {
    return db("articles as a")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
      .innerJoin("categories as c", "a.category_id", "c.id")
      .orderBy("a.publish_date", "desc")
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
        "c.name as category_name",
        db.raw("GROUP_CONCAT(t.name) as article_tags")
      )
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
        "c.name"
      )
      .limit(10)
      .then((rows) => {
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

  // get latest articles of top categories
  async getLatestArticleOfTopCategories() {
    return db("categories as c")
      .leftJoin("articles as a", "c.id", "a.category_id")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
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
        "a.publish_date as article_publish_date",
        db.raw("GROUP_CONCAT(t.name) as article_tags")
      )
      .groupBy(
        "c.id",
        "c.name",
        "a.id",
        "a.title",
        "a.abstract",
        "a.content",
        "a.image_url",
        "a.status",
        "a.is_premium",
        "a.views",
        "a.publish_date"
      )
      .limit(10)
      .then((rows) => {
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
  // search article by word
  async searchArticlesByKeyword(keyword) {
    if (!keyword || keyword.trim() === "") {
      throw new Error("Từ khóa tìm kiếm không được để trống");
    }

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
      .whereRaw(
        "MATCH(a.title, a.abstract, a.content) AGAINST(? IN NATURAL LANGUAGE MODE)",
        [keyword]
      )
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
};
