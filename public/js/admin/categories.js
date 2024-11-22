 // Get references to the elements
 const addButton = document.getElementById('admin-categories-add');
 const popup = document.getElementById('admin-categories-popup');
 const closeButton = document.getElementById('admin-categories-close-popup');

 addButton.addEventListener('click', () => {
     popup.classList.remove('tw-invisible'); 
 });

 closeButton.addEventListener('click', () => {
     popup.classList.add('tw-invisible'); 
 });

 window.addEventListener('click', (event) => {
     if (event.target === popup) {
         popup.classList.add('tw-invisible'); 
     }
 });