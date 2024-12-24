import db from "../utils/db.js";

export default {
    async getPersonsRole(role, page, itemsPerPage) {
        const users = await db('users')
            .select('id', 'name', 'pen_name', 'email', 'birthdate', 'role', 'subscription_expiry')
            .where('role', role)
            .offset((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const currentDate = new Date();
        return users.map(user => {
            user.isExpired = new Date(user.subscription_expiry) < currentDate;
            return user;
        });
    },

    async getTotalUsersCount(role) {
        const result = await db('users')
            .count('id as count')
            .where('role', role);
        return result[0].count; 
    },
    async extendSubscription(id, days) {
        const updatedRows = await db('users')
            .where('id', id)
            .andWhere('role', 'subscriber')
            .update({
                subscription_expiry: db.raw('DATE_ADD(IF(subscription_expiry > NOW(), subscription_expiry, NOW()), INTERVAL ? DAY)', [days])
            });

        return updatedRows > 0; 
    },
    async getAllCategories() {
        try {
          const categories = await db("categories").select("id","name");
          return categories.map((category) => ({
            id: category.id,
            name: category.name
        }));
        } catch (error) {
          console.error("Error fetching categories:", error);
          throw error; 
        }
    },
    async getCategoryNameByEditor(editorId) {
        return db('editor_assignments')
            .join('categories', 'editor_assignments.category_id', '=', 'categories.id')
            .select('categories.name as category_name')
            .where('editor_assignments.editor_id', editorId);
    },
    async updateCategoryEditor(editorId, categoryID) {
        try {
            const existingAssignment = await db('editor_assignments')
                .where({ editor_id: editorId })
                .first();
    
            if (existingAssignment) {
                await db('editor_assignments')
                    .where({ id: existingAssignment.id })
                    .update({ category_id: categoryID });
    
                return { success: true, message: 'Category assignment updated successfully.' };
            
            } else {
                const maxIdRow = await db('editor_assignments')
                .max('id as maxId')
                .first();

                const newId = (maxIdRow?.maxId || 0) + 1; 
                await db('editor_assignments').insert({
                    id: newId,
                    editor_id: editorId,
                    category_id: categoryID,
                });
    
                return { success: true, message: 'Category assigned to editor successfully.' };
            }
        } catch (error) {
            console.error('Error updating/assigning category:', error);
            throw new Error('Database error occurred while assigning the category.');
        }
    },
    
};