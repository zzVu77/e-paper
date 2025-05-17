document.addEventListener('DOMContentLoaded', function() {
    // Login button handler
    const loginButton = document.querySelector('.client-header-loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = '/account/login';
        });
    }

    // Login form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            // Lấy CSRF token từ input hidden
            const csrfToken = formData.get('_csrf');

            try {
                const response = await fetch('/auth/local/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken // Thêm header CSRF
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    const errorData = await response.json();
                    console.log('Error:', errorData.error);
                    alert(errorData.error);
                }
            } catch (error) {
                console.log('Error:', error);
                alert('Login failed. Error: ' + error);
            }
        });
    }

    // Navigation handlers for admin menu
    const adminDashboard = document.querySelector('.admin-dashboard');
    if (adminDashboard) {
        adminDashboard.addEventListener('click', function() {
            window.location.href = '/admin/categories';
        });
    }

    // // Navigation handlers for editor menu
    // const editorDashboard = document.querySelector('.editor-dashboard');
    // if (editorDashboard) {
    //     editorDashboard.addEventListener('click', function() {
    //         window.location.href = '/editor';
    //     });
    // }

    // // Navigation handlers for writer menu
    // const writerArticles = document.querySelector('.writer-articles');
    // if (writerArticles) {
    //     writerArticles.addEventListener('click', function() {
    //         window.location.href = '/writer/article/manage/AllArticle';
    //     });
    // }

    // const writerCreate = document.querySelector('.writer-create');
    // if (writerCreate) {
    //     writerCreate.addEventListener('click', function() {
    //         window.location.href = '/writer/article/create';
    //     });
    // }

    // // Profile navigation for all roles
    // const profileLinks = document.querySelectorAll('.profile-link');
    // profileLinks.forEach(link => {
    //     link.addEventListener('click', function() {
    //         window.location.href = '/account-setting/myprofile';
    //     });
    // });
}); 