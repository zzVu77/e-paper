document.addEventListener("DOMContentLoaded", function () {
  // Lấy CSRF token từ meta tag hoặc input hidden
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                   document.querySelector('input[name="_csrf"]')?.value;

  document.querySelector(".logout").addEventListener("click", function () {
    fetch("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken // Thêm CSRF token vào header
      },
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/"; // Chuyển hướng sau khi logout thành công
          alert("Logout success");
        } else {
          alert("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Logout failed: " + error.message);
      });
  });
});
