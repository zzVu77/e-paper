import db from "../utils/db.js";

export default {
  async getPageTags(itemsPerPage, offset) {
    try {
      return await db('tags')
        .select('id', 'name', 'created_at', 'updated_at')
        .offset(offset)
        .limit(itemsPerPage);
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Error fetching tags from the database.');
    }
  },

  async getTotalTags() {
    try {
      const result = await db('tags').count('id as count').first();
      return result;
    } catch (error) {
      console.error('Error counting total tags:', error);
      throw new Error('Error counting tags.');
    }
  },
  async updateTag(id, name) {
    try {
        const updatedRows = await db('tags')
            .where('id', id)
            .update({
                name: name,
                updated_at: db.fn.now(),  
            });

        if (updatedRows > 0) {
            return { success: true, message: 'Tag updated successfully' };
        } else {
            throw new Error('Tag update failed');
        }
    } catch (error) {
        console.error('Error updating tag:', error);
        throw new Error('Error updating tag');
    }
    },
    async addTag(name) {
      try {
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
          await db('tags').insert({
              id: newId.toString(),  // Store ID as string in the database
              name: name,
              created_at: db.fn.now(),
              updated_at: db.fn.now(),
          });
  
          return { success: true, message: 'Tag added successfully' };
      } catch (error) {
          console.error('Error adding tag:', error);
          throw new Error('Database error occurred while adding the tag');
      }
    },
    async deleteTag(id) {
      try {
          const tag = await db('tags').where('id', id).first();
          
          if (!tag) {
              throw new Error('Tag not found');
          }
  
          await db('article_tags').where('tag_id', id).del();
  
          await db('tags').where('id', id).del();
  
          return { success: true, message: 'Tag and related article associations deleted successfully' };
      } catch (error) {
          console.error('Error deleting tag:', error);
          throw new Error('Database error occurred while deleting the tag and its associations');
      }
    },
  
};