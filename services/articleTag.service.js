import db from "../utils/db.js";

export default {
    add(entity){
        return db("article_tags").insert(entity);
    },
    deleteByArticleId(id){
        return db('article_tags').where('article_id', id).del();
    },
};
