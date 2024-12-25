import db from "../../utils/db.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'; // Use import for bcrypt

export default {
    async getPersonsRole(role, page, itemsPerPage) {
        const users = await db('users')
            .select('id','password','status','name', 'pen_name', 'email', 'birthdate', 'role', 'subscription_expiry')
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
    },
    async updateEditorInfo(id, editorData) {
        const { name, email, birthdate } = editorData;
    
        try {
            // Step 1: Check if the new email is already in use (excluding the current editor's email)
            const existingEmail = await db("users")
                .select("id")
                .where("email", email)
                .andWhere("id", "<>", id) // Make sure the email is not the same as the current user's email
                .first();
    
            if (existingEmail) {
                throw new Error(`Email ${email} is already in use by another editor.`);
            }
    
            // Step 2: Update the editor's information
            const result = await db("users")
                .update({ name, email, birthdate })
                .where({ id });
    
            if (result === 0) {
                throw new Error('No rows updated, check if the ID exists');
            }
    
            return result; // Return the result of the update operation
        } catch (error) {
            console.error('Error updating editor info:', error);
            throw new Error('Error updating editor info: ' + error.message);
        }
    },
    async addUser({ name, pen_name, email, password, birthdate, role }) {
        try {
            const userId = uuidv4();
    
            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const newUser = {
                id: userId,
                name,
                pen_name,
                email,
                password: hashedPassword, 
                birthdate,
                role,
                created_at: new Date(),
                updated_at: new Date(),
            };
    
            const result = await db('users').insert(newUser);
    
            if (result) {
                return { success: true, message: 'User added successfully' };
            } else {
                return { success: false, message: 'Failed to add user' };
            }
        } catch (error) {
            console.error('Error adding user:', error);
            throw new Error('Error adding user');
        }
    },
    async approveUser(userId) {
        try {
            if (!userId) {
                throw new Error("User ID is required.");
            }
    
            const updatedRows = await db('users')
                .where('id', userId)
                .andWhere('status', 'pending')
                .andWhere('role', 'guest')
                .update({
                    role: 'subscriber',  
                    status: null,        
                    subscription_expiry: db.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'), 
                });
    
            if (updatedRows > 0) {
                return { success: true, message: 'User approved and subscription expiry updated.' };
            } else {
                return { success: false, message: 'User not found or not in pending status.' };
            }
        } catch (error) {
            console.error('Error approving user:', error);
            throw new Error('Error approving user');
        }
    },    
    async updateWriter(writerData) {
        const { id, name, pen_name, email, birthdate } = writerData;
    
        // Check if writer exists
        const writer = await db("users")
            .where({ id, role: "writer" })
            .first();
    
        if (!writer) {
            throw new Error("Writer not found");
        }
    
        // Update writer details
        await db("users")
            .where({ id })
            .update({
                name,
                pen_name,
                email,
                birthdate: new Date(birthdate),
                updated_at: db.fn.now(),
            });
    
        // Retrieve and return the updated record
        const updatedWriter = await db("users")
            .where({ id })
            .select("id", "name", "pen_name", "email", "birthdate", "updated_at")
            .first();
    
        return updatedWriter;
    },
    

    async updateUser(userData) {
        const { id, name, email, birthdate } = userData;

        // Check if user exists
        const user = await db("users")
            .where({ id })
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Update user details
        const updatedUser = await db("users")
            .where({ id })
            .update({
                name,
                email,
                birthdate: new Date(birthdate),
                updated_at: db.fn.now(),
            });

        return updatedUser;
    },
    async isCategoryAssignedToOther(categoryID, editorID) {
        const assignment = await db('editor_assignments')
            .where({ category_id: categoryID })
            .andWhereNot({ editor_id: editorID }) // Exclude the current editor
            .first();
    
        return !!assignment; // Return true if the category is assigned to another editor, otherwise false
    },
    async deleteUserById(userId) {
        try {
          const user = await db('users').where({ id: userId }).first();
          if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
          }
    
          await db('users').where({ id: userId }).del();
          return { success: true, message: 'User deleted successfully.' };
        } catch (error) {
          throw new Error(`Failed to delete user: ${error.message}`);
        }
    },
};