import db from "../utils/db.js";

export default {
    getTagByName(tagName) {
    return db("tags")
        .select("*")
        .where("name", tagName)
        .first(); // Lấy 1 kết quả đầu tiên
    },
    add(entity){
        return db("tags").insert(entity);
    }
};
