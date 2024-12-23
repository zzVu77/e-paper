import db from "../../utils/db.js";
import { v4 as uuidv4 } from 'uuid';

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
            .select('categories.name as category_name', 'categories.id as id')
            .where('editor_assignments.editor_id', editorId);
    },

    async deleteAssignmentsByEditor(editorId) {
        return db('editor_assignments')
            .where('editor_id', editorId)
            .del();
    },
    async insertCategoryEditor(editorId, categoryId) {
        try {
            // Generate a new UUID for the new record
            const newId = uuidv4();
    
            // Insert the new editor-category assignment with the new UUID
            await db('editor_assignments').insert({
                id: newId,  // Use the newly generated UUID
                editor_id: editorId,
                category_id: categoryId,
            });
    
            return { success: true, message: 'Category assigned to editor successfully.' };
        } catch (error) {
            console.error('Error inserting category assignment:', error);
            throw new Error('Error inserting category assignment');
        }
    }
};