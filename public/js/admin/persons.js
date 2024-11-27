
document.querySelectorAll('.popup-trigger').forEach(button => {
button.addEventListener('click', function () {
    const id = this.getAttribute('data-id');
    const popup = document.getElementById('admin-persons-popup-' + id);
    popup.classList.remove('tw-invisible'); // Show the popup
});
});

document.querySelectorAll('.close-popup').forEach(button => {
    button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const popup = document.getElementById('admin-persons-popup-' + id);
        popup.classList.add('tw-invisible'); // Hide the popup
    });
});