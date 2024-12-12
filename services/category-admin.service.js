import db from "../utils/db.js"; 

const categoryAdminService = {
    async getPageCategories(itemsPerPage, offset) {
      try {
        return await db('categories')
          .select('id', 'name', 'parent_id', 'created_at', 'updated_at')
          .offset(offset)
          .limit(itemsPerPage);
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Error fetching categories from the database.');
      }
    },
  
    async getTotalCategories() {
      try {
        const result = await db('categories').count('id as count').first();
        return result;
      } catch (error) {
        console.error('Error counting total categories:', error);
        throw new Error('Error counting categories.');
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
    async getCategoryNameByParentId(parentId) {
        try {
          const category = await db('categories')
            .select('name')
            .where('id', parentId)
            .first(); 
    
          if (!category) {
            throw new Error('Category not found for the provided parent_id');
          }
    
          return category.name; 
        } catch (error) {
          console.error('Error fetching category by parent_id:', error);
          throw new Error('Error fetching category name by parent_id');
        }
    },
    async updateCategory(id, name, parent_name) {
        try {
          // Check if the category exists first
          const category = await db('categories').where('id', id).first();
          if (!category) {
            throw new Error('Category not found');
          }
    
          // If parent_name is provided and not null/undefined, get the parent_id
          let parent_id = null;
          if (parent_name && parent_name !== 'None') {
            const parentCategory = await db('categories').where('name', parent_name).first();
            if (parentCategory) {
              parent_id = parentCategory.id;
            } else {
              throw new Error('Parent category not found');
            }
          }
    
          // Update the category details
          await db('categories')
            .where('id', id)
            .update({
              name: name,
              parent_id: parent_id,  // Will be null if no parent_name is provided or it's 'None'
              updated_at: db.fn.now(), // Set current time for updated_at
            });
    
          return { success: true, message: 'Category updated successfully' };
        } catch (error) {
          console.error('Error updating category:', error);
          throw new Error('Database error occurred while updating the category');
        }
    },
    async addCategory(name, parent_name) {
      try {
          const categories = await db('categories').select('id');
          const allIds = categories.map(category => parseInt(category.id, 10)); 
          
          let newId = 1;  
          if (allIds.length > 0) {
              newId = Math.max(...allIds) + 1; 
          }
  
          let parent_id = null;
          if (parent_name && parent_name !== 'None') {
              const parentCategory = await db('categories').where('name', parent_name).first();
              if (parentCategory) {
                  parent_id = parentCategory.id;
              } else {
                  throw new Error('Parent category not found');
              }
          }
  
          await db('categories').insert({
              id: newId.toString(),  
              name: name,
              parent_id: parent_id,  
              created_at: db.fn.now(),
              updated_at: db.fn.now(),
          });
  
          return { success: true, message: 'Category added successfully' };
      } catch (error) {
          console.error('Error adding category:', error);
          throw new Error('Database error occurred while adding the category');
      }
    },
    async deleteCategory(id) {
      try {
          const category = await db('categories').where('id', id).first();
          
          if (!category) {
              throw new Error('Category not found');
          }
  
          await db('editor_assignments').where('category_id', id).del();
  
          await db('articles').where('category_id', id).del();
  
          await db('categories').where('id', id).del();
  
          return { success: true, message: 'Category and related data deleted successfully' };
      } catch (error) {
          console.error('Error deleting category:', error);
          throw new Error('Database error occurred while deleting the category and its related data');
      }
    },
  
  
  };
  
  export default categoryAdminService;