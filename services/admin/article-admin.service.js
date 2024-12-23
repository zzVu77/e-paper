import db from "../../utils/db.js";

export default {
    async getPageArticles(limit = 10, offset = 0) {
        return db("articles as a")
          .leftJoin("article_tags as at", "a.id", "at.article_id")
          .leftJoin("tags as t", "at.tag_id", "t.id")
          .innerJoin("users as u", "a.author", "u.id")
          .innerJoin("categories as c", "a.category_id", "c.id")
          .leftJoin("rejection_notes as rn", "a.id", "rn.article_id") // Join with rejection_notes
          .select(
            "a.id as article_id",
            "a.title as article_title",
            "a.status as article_status",
            "a.is_premium as article_is_premium",
            "a.publish_date as article_publish_date",
            "u.name as author_name",
            "c.name as category_name",
            db.raw("GROUP_CONCAT(t.name) as article_tags"),
            "rn.note as rejection_note" 
          )
          .where("u.role", "writer")
          .groupBy(
            "a.id",
            "a.title",
            "a.status",
            "a.is_premium",
            "a.publish_date",
            "u.name",
            "c.name",
            "rn.note" 
          )
          .limit(limit)
          .offset(offset)
          .then((rows) => {
            return rows.map((row) => ({
              article_id: row.article_id,
              article_title: row.article_title,
              article_status: row.article_status,
              article_is_premium: row.article_is_premium,
              article_publish_date: row.article_publish_date,
              author_name: row.author_name,
              category_name: row.category_name,
              article_tags: row.article_tags ? row.article_tags.split(",") : [],
              rejection_note: row.rejection_note || null, 
            }));
          });
    },
    async getTotalArticles() {
        return db("articles").count("id as count").first();
    },
    async getAllCategories() {
        try {
          const categories = await db("categories").select("name");
          return categories.map((category) => category.name);
        } catch (error) {
          console.error("Error fetching categories:", error);
          throw error; 
        }
    },
    async updateArticle(admin_id,article_id, tag, categories, reason, decision) {
        try {
            const category = await db('categories').where('name', categories).first();
            if (!category) {
                throw new Error(`Category '${categories}' does not exist.`);
            }
            const category_id = category.id;
    
            await db("articles")
                .where("id", article_id)
                .update({
                    status: decision,
                    category_id: category_id,  
                    
                });
    
            if (tag) {
                // Delete existing tags for the article
                await db("article_tags")
                    .where("article_id", article_id)
                    .del();
    
                // Step 2: Get or create tags 
                const tags = tag.split(',');  // Assuming tags are comma-separated
                for (const tagName of tags) {
                    const trimmedTagName = tagName.trim();
                    if (trimmedTagName) {
                        let tagRecord = await db('tags').where('name', trimmedTagName).first();
                        if (!tagRecord) {
                            // If the tag doesn't exist, create it
                            tagRecord = await db('tags').insert({ name: trimmedTagName }).returning('id');
                        }
                        await db('article_tags').insert({
                            article_id: article_id,
                            tag_id: tagRecord.id,
                        });
                    }
                }
            }
    
            if (reason) {
                try {
                    const existingNote = await db("rejection_notes")
                        .where("article_id", article_id)
                        .first();  
            
                    if (existingNote) {
                        await db("rejection_notes")
                            .where("article_id", article_id)
                            .update({
                                note: reason.trim(),  
                                editor_id: admin_id,  
                                created_at: db.fn.now(), 
                            });
                    } else {
                            const maxIdResult = await db("rejection_notes")
                            .max("id as max_id"); 
                            const newId = maxIdResult[0].max_id + 1 || 1; 

                            await db("rejection_notes")
                            .insert({
                                id: newId,  
                                article_id: article_id,
                                note: reason.trim(),  
                                editor_id: admin_id,  
                                created_at: db.fn.now(), 
                            });
                    }
                } catch (error) {
                    console.error("Error updating rejection note:", error);
                    throw error;  
                }
            }
        } catch (error) {
            console.error("Error updating article:", error);
            throw error;
        }
    },
    async deleteArticle(articleId) {
        try {
          const deleted = await db('articles')
            .where('id', articleId)
            .del();
    
          if (deleted) {
            return { success: true, message: 'Article deleted successfully' };
          } else {
            return { success: false, message: 'Article not found' };
          }
        } catch (error) {
          console.error('Error deleting article:', error);
          throw new Error('Error deleting article');
        }
      },
};