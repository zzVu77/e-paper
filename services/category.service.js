import db from "../utils/db.js";

export default {
  async getCategoryName() {
    return db("categories as parent")
      .leftJoin("categories as child", "parent.id", "child.parent_id")
      .select("parent.name as parent_name", "child.name as child_name")
      .whereNull("parent.parent_id") // lấy parent categories (không có parent_id)
      .then((rows) => {
        const result = [];

        // Grouping the rows by parent category
        rows.forEach((row) => {
          let parentCategory = result.find(
            (item) => item.parent_name === row.parent_name
          );

          if (!parentCategory) {
            parentCategory = {
              parent_name: row.parent_name,
              child_categories: [],
            };
            result.push(parentCategory);
          }

          if (row.child_name) {
            parentCategory.child_categories.push(row.child_name);
          }
        });
        return result;
      });
  },
  getCategoryIdByName(categoryName) {
    return db("categories")
      .select("id")
      .where("name", categoryName)
      .first(); // Lấy 1 kết quả đầu tiên
  },
  getCategoryNameById(id){
    return db("categories")
    .select("name")
    .where("id", id)
    .first(); // Lấy 1 kết quả đầu tiên
  },
  getAll() {
    return db("categories")
      .select("name")
  }
};
