import db from "../utils/db.js";

export default {
    async getPageArticles(limit = 10, offset = 0, editor_id = null, status = null) {
        return db("articles as a")
            .leftJoin("article_tags as at", "a.id", "at.article_id")
            .leftJoin("tags as t", "at.tag_id", "t.id")
            .innerJoin("users as u", "a.author", "u.id")
            .innerJoin("categories as c", "a.category_id", "c.id")
            .leftJoin("rejection_notes as rn", "a.id", "rn.article_id") // Join with rejection_notes
            .modify((query) => {
                // Filter based on editor_id and category
                if (editor_id) {
                    query.whereIn("c.id", function () {
                        this.select("category_id")
                            .from("editor_assignments")
                            .where("editor_id", editor_id); // Filter categories based on editor_id
                    });
                }
    
                // Filter based on status if provided
                if (status) {
                    query.where("a.status", status); // Filter articles by status (e.g., 'pending', 'draft')
                }
            })
            .select(
                "a.id as article_id",
                "a.title as article_title",
                "a.status as article_status",
                "a.is_premium as article_is_premium",
                "a.publish_date as article_publish_date",
                "u.name as author_name",
                "c.name as category_name",
                db.raw("GROUP_CONCAT(DISTINCT t.name) as article_tags"), // Use DISTINCT to avoid duplicate tags
                "rn.note as rejection_note" // Include rejection note
            )
            .groupBy(
                "a.id",
                "a.title",
                "a.status",
                "a.is_premium",
                "a.publish_date",
                "u.name",
                "c.name",
                "rn.note" // Group by article-level fields only
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
    async getTotalArticles(id_editor, status = null) {
        try {
            const query = db("articles as a")
                .innerJoin("categories as c", "a.category_id", "c.id")
                .innerJoin("editor_assignments as ea", "c.id", "ea.category_id")
                .where("ea.editor_id", id_editor)
                .count("a.id as count")
                .first();
    
            // Apply status filter if provided
            if (status) {
                query.andWhere("a.status", status);
            }
    
            return await query;
        } catch (error) {
            console.error("Error fetching total articles:", error);
            throw error;
        }
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
    async updateArticle(admin_id, article_id, tag, categories, reason, decision,publish_date) {
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
                    publish_date: publish_date,
                });
    
            if (tag) {
                // Delete existing tags for the article
                await db("article_tags")
                    .where("article_id", article_id)
                    .del();
    
                // Step 2: Get or create tags 
                const tags = tag.split(',');  
                for (const tagName of tags) {
                    const trimmedTagName = tagName.trim();
                    if (trimmedTagName) {
                        let tagRecord = await db('tags').where('name', trimmedTagName).first();
    
                        if (!tagRecord) {
                            // If the tag doesn't exist, we need to calculate the next available id
                            const tags = await db('tags').select('id');
                            
                            // Filter out any non-numeric ID values and convert valid ones to integers
                            const allIds = tags
                                .map(tag => parseInt(tag.id, 10))
                                .filter(id => !isNaN(id));  // Filter out any NaN values
    
                            let newId = 1;  // Default to 1 if no valid IDs exist
                            if (allIds.length > 0) {
                                newId = Math.max(...allIds) + 1;  // Find the maximum ID and increment by 1
                            }
    
                            // Insert the new tag with the incremented ID
                            tagRecord = await db('tags').insert({
                                id: newId.toString(),  
                                name: trimmedTagName,
                                created_at: db.fn.now(),
                                updated_at: db.fn.now(),
                            }).returning('id');
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
    
};