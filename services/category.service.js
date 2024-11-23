import db from '../utils/db.js';

export default {
  // findAll() {
  //   return [
  //     { CatID: 1, CatName: 'Laptop' },
  //     { CatID: 2, CatName: 'Mobile Phone' },
  //     { CatID: 3, CatName: 'TV' },
  //   ];
  // }

  findAll() {
    return db('categories');
  },
};
