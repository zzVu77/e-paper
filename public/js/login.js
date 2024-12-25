document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/auth/local/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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