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
  async getArticlesByCategory(categoryName, limit, offset) {
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
      .limit(limit) // Giới hạn số lượng bài viết trả về
      .offset(offset) // Bắt đầu từ vị trí offset
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
  async countArticlesByCategory(categoryName) {
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

    // Đếm số lượng bài viết thuộc các category ID
    const count = await db("articles")
      .whereIn("category_id", categoryIds) // Lọc theo các category ID
      .count("id as count") // Đếm số lượng bài viết
      .first();

    return count ? count.count : 0; // Trả về số lượng bài viết
  },

  async getArticlesByTag(tagName, limit, offset) {
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
        .limit(limit) // Giới hạn số lượng bài viết trả về
        .offset(offset) // Bắt đầu từ vị trí offset
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
  async countArticlesByTagName(tagName) {
    try {
      let result;

      if (tagName.toLowerCase() === "premium") {
        // Trường hợp đặc biệt: đếm số lượng bài viết có article_is_premium = true
        result = await db("articles")
          .where("is_premium", true)
          .count("* as total")
          .first();
      } else {
        // Lấy thông tin tag từ tên
        const tag = await db("tags").where("name", tagName).first();

        if (!tag) {
          throw new Error("Tag không tồn tại");
        }

        // Đếm số lượng bài viết có tag_id khớp với tag.id
        result = await db("article_tags")
          .where("tag_id", tag.id)
          .count("* as total")
          .first();
      }

      return result.total;
    } catch (error) {
      console.error("Error counting articles by tag name:", error);
      throw error;
    }
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
  async searchArticlesByKeyword(keyword, limit, offset) {
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
      .limit(limit) // Giới hạn số lượng bài viết trả về
      .offset(offset) // Bắt đầu từ vị trí offset

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
  async countArticlesByKeyword(keyword) {
    try {
      if (!keyword || keyword.trim() === "") {
        throw new Error("Từ khóa tìm kiếm không được để trống");
      }

      // Đếm số lượng bài viết sử dụng Full-Text Search
      const result = await db("articles")
        .whereRaw(
          "MATCH(title, abstract, content) AGAINST(? IN NATURAL LANGUAGE MODE)",
          [keyword]
        )
        .count("* as total")
        .first();

      return result.total;
    } catch (error) {
      console.error("Error counting articles by keyword:", error);
      throw error;
    }
  },
};
