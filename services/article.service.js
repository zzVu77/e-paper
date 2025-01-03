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
      .andWhere("a.status", "published") // Thêm điều kiện bài viết có status là "premium"
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
  findAll() {
    return db("articles")
      .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
      .leftJoin("article_tags", "articles.id", "article_tags.article_id")
      .leftJoin("tags", "article_tags.tag_id", "tags.id")
      .groupBy("articles.id");
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
      .then((rows) => {
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
      .then((rows) => {
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
      .then((rows) => {
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
    return db("articles").where("id", id).update(entity);
  },
  countByStatus(status) {
    return db("articles").where("status", status).count("* as total").first();
  },
  countByStatusAndAuthorID(status, author_id) {
    return db("articles")
      .where("status", status)
      .andWhere("author", author_id)
      .count("* as total")
      .first();
  },
  countAllArticles() {
    return db("articles").count("* as total").first();
  },
  countAllArticlesByAuthorID(author_id) {
    return db("articles")
      .where("author", author_id)
      .count("* as total")
      .first();
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
  findPageByStatus(limit, offset, status) {
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
  deleteById(id) {
    return db("articles").where("id", id).del();
  },
  // getArticlesByTags(tagIDs) {
  //   return db("articles")
  //     .select("articles.*", db.raw("GROUP_CONCAT(tags.name) as tags"))
  //     .join("article_tags", "articles.id", "=", "article_tags.article_id")
  //     .join("tags", "tags.id", "=", "article_tags.tag_id")
  //     .whereIn("article_tags.tag_id", tagIDs) // Lọc theo danh sách tagID
  //     .groupBy("articles.id");
  // },
  getArticlesByFilter(tagIDs, startDate, endDate, keyword, limit, offset, authorID, status) {
    let query = db("articles")
  .select(
    "articles.*",
    db.raw(
      `(
        SELECT GROUP_CONCAT(tags.name)
        FROM article_tags
        LEFT JOIN tags ON article_tags.tag_id = tags.id
        WHERE article_tags.article_id = articles.id
      ) as tags`
    )
  )
  .leftJoin("article_tags", "articles.id", "article_tags.article_id")
  .leftJoin("tags", "article_tags.tag_id", "tags.id")
  .where("articles.author", authorID);

  if (tagIDs && tagIDs.length > 0) {
    query = query.whereIn("article_tags.tag_id", tagIDs);
    // console.log("tags", tagIDs);
  }

  if (startDate && endDate) {
    query = query.whereBetween("articles.created_at", [startDate, endDate]);
    // console.log("date");
  }

  if (keyword && keyword.trim() !== "") {
    query = query.whereRaw(
      "MATCH(articles.title, articles.abstract, articles.content) AGAINST(? IN NATURAL LANGUAGE MODE)",
      [keyword]
    );
    // console.log("keyword", keyword);
  }
  if (status && status !== 'all') {
    query = query.where("articles.status", status);
    console.log("status", status);
  }
  return query.groupBy("articles.id")
  .limit(limit)
  .offset(offset);

  },

  countArticlesByFilter(tagIDs, startDate, endDate, keyword, authorID, status) {
    let query = db("articles")
      .select(db.raw("COUNT(DISTINCT articles.id) as count"))  // Sử dụng DISTINCT để đếm số bài viết duy nhất
      .leftJoin("article_tags", "articles.id", "article_tags.article_id")
      .leftJoin("tags", "article_tags.tag_id", "tags.id")
      .where("articles.author", authorID);
  
    if (tagIDs && tagIDs.length > 0) {
      query = query.whereIn("article_tags.tag_id", tagIDs);
      // console.log("tags", tagIDs);
    }
  
    if (startDate && endDate) {
      query = query.whereBetween("articles.created_at", [startDate, endDate]);
      console.log("date");
    }
  
    if (keyword && keyword.trim() !== "") {
      query = query.whereRaw(
        "MATCH(articles.title, articles.abstract, articles.content) AGAINST(? IN NATURAL LANGUAGE MODE)",
        [keyword]
      );
      console.log("keyword in count", keyword);
    }
  
    if (status && status !== 'all') {
      query = query.where("articles.status", status);
      console.log("status", status);
    }
  
    // Trả về kết quả đếm
    return query.then(result => result[0].count);  // Trả về số lượng bài viết
  },
   
  
  async getArticleById(articleId) {
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
      .where("a.id", articleId)
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
      .first()
      .then((row) => {
        // Chuyển đổi kết quả thành format phù hợp
        return {
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
        };
      }); // Lấy một bài viết duy nhất
  },
  async getArticlesByCategory(categoryName, limit, offset, isPremium) {
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
      .where("a.status", "published") // Lọc bài viết có trạng thái published
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
      .modify((queryBuilder) => {
        if (isPremium) {
          queryBuilder.orderBy("a.is_premium", "desc"); // Ưu tiên bài viết premium
        }
      })
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

  async getRelatedArticleByCategory(categoryName, articleId, limit) {
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

    // Lấy bài viết thuộc các category ID, trừ chính bài viết hiện tại, và sắp xếp ngẫu nhiên
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
      .where("a.status", "published") // Lọc bài viết có trạng thái published
      .whereIn("a.category_id", categoryIds) // Lọc theo các category ID
      .where("a.id", "!=", articleId) // Trừ bài viết hiện tại
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
      ) // Thêm các cột vào GROUP BY
      .orderByRaw("RAND()") // Sắp xếp ngẫu nhiên
      .limit(limit) // Giới hạn số lượng bài viết trả về
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
      .andWhere("status", "published") // Thêm điều kiện trạng thái bài viết là "premium"
      .count("id as count") // Đếm số lượng bài viết
      .first();

    return count ? count.count : 0; // Trả về số lượng bài viết
  },

  async getArticlesByTag(tagName, limit, offset, isPremium) {
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
        .andWhere("a.status", "published") // Điều kiện status là 'published'
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
      .andWhere("a.status", "published") // Điều kiện status là 'published'
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
      .modify((queryBuilder) => {
        if (isPremium) {
          queryBuilder.orderBy("a.is_premium", "desc"); // Ưu tiên bài viết premium
        }
      })
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
  async countArticlesByTagName(tagName) {
    try {
      let result;

      if (tagName.toLowerCase() === "premium") {
        // Trường hợp đặc biệt: đếm số lượng bài viết có article_is_premium = true
        result = await db("articles")
          .where("is_premium", true)
          .andWhere("status", "published") 
          .count("* as total")
          .first();
      } else {
        // Lấy thông tin tag từ tên
        const tag = await db("tags").where("name", tagName).first();

        if (!tag) {
          throw new Error("Tag không tồn tại");
        }

      // Đếm số lượng bài viết có tag_id khớp với tag.id và status = 'published'
      result = await db("article_tags as at")
        .innerJoin("articles as a", "at.article_id", "a.id") // Join bảng article_tags với articles
        .where("at.tag_id", tag.id)
        .andWhere("a.status", "published")  // Kiểm tra điều kiện status = 'published'
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
      .innerJoin("users as u", "a.author", "u.id")
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
        db.raw("GROUP_CONCAT(t.name) as article_tags"),
        "u.name as author_name"
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
      .innerJoin("users as u", "a.author", "u.id")
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

  // get latest articles of top categories
  async getLatestArticleOfTopCategories() {
    return db("categories as c")
      .leftJoin("articles as a", "c.id", "a.category_id")
      .leftJoin("article_tags as at", "a.id", "at.article_id")
      .leftJoin("tags as t", "at.tag_id", "t.id")
      .innerJoin("users as u", "a.author", "u.id")
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
        "u.name as author_name",
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
        "a.publish_date",
        "u.name"
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
  async searchArticlesByKeyword(keyword, limit, offset, isPremium) {
    if (!keyword || keyword.trim() === "") {
      throw new Error("Từ khóa tìm kiếm không được để trống");
    }
  
    let query = db("articles as a")
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
      .andWhere("a.status", "published") // Thêm điều kiện status = 'published'
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
      .offset(offset); // Bắt đầu từ vị trí offset
  
    // Nếu isPremium là true, sắp xếp bài viết ưu tiên bài có is_premium = true
    if (isPremium) {
      query = query.orderByRaw("a.is_premium desc, a.publish_date desc"); // Sắp xếp theo is_premium và publish_date
    }
  
    return query.then((rows) => {
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
        .andWhere("status", "published")  // Thêm điều kiện status = 'published'
        .count("* as total")
        .first();

      return result.total;
    } catch (error) {
      console.error("Error counting articles by keyword:", error);
      throw error;
    }
  },

  async getImageUrlOfTop3Article() {
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
      .limit(3)
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
