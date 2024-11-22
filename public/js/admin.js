document.addEventListener('DOMContentLoaded', function () {
    // Dropdown elements
    const dropdownButton = document.getElementById('dropdownActionButton');
    const dropdownMenu = document.getElementById('dropdownAction');
    const headerdropdownButton = document.getElementById('admin-header-dropdownActionButton');
    const headerdropdownMenu = document.getElementById('admin-header-dropdownAction');  // Fixed typo

    // Toggle visibility for the first dropdown
    if (dropdownButton && dropdownMenu){
        dropdownButton.addEventListener('click', function (event) {
            event.stopPropagation();  // Prevent click event from propagating to document
            if (dropdownMenu.classList.contains('tw-hidden')) {
                dropdownMenu.classList.remove('tw-hidden');
            } else {
                dropdownMenu.classList.add('tw-hidden');
            }
        });
    };

    // Toggle visibility for the header dropdown
    headerdropdownButton.addEventListener('click', function (event) {
        event.stopPropagation();  // Prevent click event from propagating to document
        if (headerdropdownMenu.classList.contains('tw-hidden')) {
            headerdropdownMenu.classList.remove('tw-hidden');
        } else {
            headerdropdownMenu.classList.add('tw-hidden');
        }
    });

    // Close both dropdowns if click occurs outside
    document.addEventListener('click', function (event) {
        // Check if the click is outside both dropdowns and their buttons
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('tw-hidden');
        }
        if (!headerdropdownButton.contains(event.target) && !headerdropdownMenu.contains(event.target)) {
            headerdropdownMenu.classList.add('tw-hidden');
        }
    });
});
