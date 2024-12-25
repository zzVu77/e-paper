 // Get references to the elements
 const addButton = document.getElementById('admin-persons-add');
 const popup = document.getElementById('admin-persons-popup');
 const closeButton = document.getElementById('admin-persons-close-popup');

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



document.querySelectorAll('.popup-trigger-editor').forEach(button => {
    button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const popup = document.getElementById('admin-editor-popup-' + id);
        const selectedCategoriesElement = popup.querySelector(`#selectedCategories-${id}`);
        const dropdownMenu = popup.querySelector(`#dropdownMenu-${id}`);
        

        // Show the popup
        popup.classList.remove('tw-invisible');

 
        selectedCategoriesElement.addEventListener('click', () => {
            dropdownMenu.classList.remove('tw-hidden');
        });

        // Handle remove category button click
        selectedCategoriesElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-category')) {
                const categoryId = event.target.dataset.id; // Get categoryId which is a combination of editorId and categoryId

                // Find the checkbox using editorId and categoryId
                const checkbox = document.getElementById(categoryId);
                if (checkbox) {
                    checkbox.checked = false;  
                }

                updateSelectedCategories();
            }
        });

        // Show the popup
        popup.classList.remove('tw-invisible');
        
        // Fetch selected categories from the server
        fetch(`/admin/persons/selected-categories/${id}`)
            .then(response => response.json())
            .then(categories => {
                categories.forEach(category => {
                    const categoryName = category.category_name ;
                    const categoryId = category.id; 
                    const categoryElement = document.createElement('span');
                    categoryElement.className = 'tw-text-gray-500';
                    categoryElement.innerHTML = `
                        ${categoryName}
                        <button type="button" class="tw-border-none tw-ml-2 tw-text-red-500 tw-font-bold tw-text-sm remove-category" data-id="editor-${id}-category-${category.id}">
                            &times;
                        </button>
                    `;
                    selectedCategoriesElement.appendChild(categoryElement);

                    checkboxes.forEach(checkbox => {
                        // The checkbox id is assumed to be in the format category-11
                        if (checkbox.id === `editor-${id}-category-${categoryId}`) {
                            checkbox.checked = true;
                        }
                    });
                });

                if (selectedCategoriesElement.children.length === 0) {
                    selectedCategoriesElement.innerHTML = `<span class="tw-text-gray-500">Choose category</span>`;
                }
            })
            .catch(error => console.error('Error fetching selected categories:', error));


        const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');

        const updateSelectedCategories = () => {
            // Clear existing displayed categories
            selectedCategoriesElement.innerHTML = '';

            // Add selected categories
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    const categoryName = checkbox.nextElementSibling.textContent;
                    const category = document.createElement('span');
                    category.className = 'tw-text-gray-500';

                    category.innerHTML = `
                        ${categoryName}
                        <button type="button" class="tw-border-none tw-ml-2 tw-text-red-500 tw-font-bold tw-text-sm remove-category" data-id="${checkbox.id}">
                            &times;
                        </button>
                    `;
                    selectedCategoriesElement.appendChild(category);
                }
            });

            // Add placeholder if no categories are selected
            if (selectedCategoriesElement.children.length === 0) {
                selectedCategoriesElement.innerHTML = `<span class="tw-text-gray-500">Chọn thể loại</span>`;
            }
        };


        // Handle checkbox change
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', updateSelectedCategories);
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!selectedCategoriesElement.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('tw-hidden');
            }
        });
    });
});

document.querySelectorAll('.close-popup').forEach(button => {
    button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const popup = document.getElementById('admin-editor-popup-' + id);
        const selectedCategoriesElement = popup.querySelector(`#selectedCategories-${id}`);
        const dropdownMenu = popup.querySelector(`#dropdownMenu-${id}`);

        const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectedCategoriesElement.innerHTML = '';
        
        selectedCategoriesElement.addEventListener('click', () => {
            dropdownMenu.classList.add('tw-hidden');
        });
        popup.classList.add('tw-invisible'); // Hide the popup
    });
});



document.addEventListener("DOMContentLoaded", function () {
    // Helper Function to Show Popup
    function showPopup(trigger, prefix) {
        const id = trigger.getAttribute("data-id");
        const popup = document.querySelector(`#${prefix}${id}`);
        if (popup) {
            popup.classList.remove("tw-invisible");
            popup.classList.add("tw-visible");
        }
    }

    // Helper Function to Hide Popup
    function hidePopup(trigger, prefix) {
        const id = trigger.getAttribute("data-id");
        const popup = document.querySelector(`#${prefix}${id}`);
        if (popup) {
            popup.classList.remove("tw-visible");
            popup.classList.add("tw-invisible");
        }
    }

    // Handle Popups for Writers
    const popupTriggersWriter = document.querySelectorAll(".popup-trigger-writer");
    const closeButtonsWriter = document.querySelectorAll(".close-popup-writer");

    popupTriggersWriter.forEach(trigger => {
        trigger.addEventListener("click", function (e) {
            const button = e.target.closest(".popup-trigger-writer"); // Ensure the button is detected
            if (button) showPopup(button, "admin-writer-popup-");
        });
    });

    closeButtonsWriter.forEach(button => {
        button.addEventListener("click", function () {
            hidePopup(this, "admin-writer-popup-");
        });
    });

    // Handle Popups for Users
    const popupTriggersUser = document.querySelectorAll(".popup-trigger-user");
    const closeButtonsUser = document.querySelectorAll(".close-popup-user");

    popupTriggersUser.forEach(trigger => {
        trigger.addEventListener("click", function (e) {
            const button = e.target.closest(".popup-trigger-user"); // Ensure the button is detected
            if (button) showPopup(button, "admin-user-popup-");
        });
    });

    closeButtonsUser.forEach(button => {
        button.addEventListener("click", function () {
            hidePopup(this, "admin-user-popup-");
        });
    });

    // Close Popups When Clicking Outside
    document.addEventListener("click", function (event) {
        const openPopups = document.querySelectorAll(".tw-visible");
        openPopups.forEach(popup => {
            if (!popup.contains(event.target) &&
                !event.target.closest(".popup-trigger-writer") &&
                !event.target.closest(".popup-trigger-user")) {
                popup.classList.remove("tw-visible");
                popup.classList.add("tw-invisible");
            }
        });
    });

    // Handle Backdrop Clicks
    document.querySelectorAll(".tw-backdrop-blur-sm").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                overlay.classList.remove("tw-visible");
                overlay.classList.add("tw-invisible");
            }
        });
    });
});


