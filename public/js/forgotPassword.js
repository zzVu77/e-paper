document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      let isValid = true; // Biến kiểm tra toàn bộ form có hợp lệ hay không
      const email = document.querySelector('input[name="email"]');
      // Hàm hiển thị lỗi dưới input
      function showError(input, message) {
        const errorDiv = input.nextElementSibling; // Tìm thẻ <div
        if (errorDiv) {
          errorDiv.textContent = message;
        }
        isValid = false;
      }
      function clearError(input) {
        const errorDiv = input.nextElementSibling; // Tìm thẻ <div class="error-message">
        if (errorDiv) {
          errorDiv.textContent = ""; // Xóa nội dung lỗi
        }
      }
      // Kiểm tra Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        showError(email, "Email is required.");
      } else if (!emailPattern.test(email.value.trim())) {
        showError(email, "Invalid email format.");
      } else {
        clearError(email);
      }

      try {
        if (isValid) {
          const response = await fetch("/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.value,
            }),
          });
          const result = await response.json();
          if (result.success) {
            alert("Email sent successfully");
            this.reset();
            window.location.href = "/verify-otp";
          } else {
            alert("Failed to send email");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to send email.");
      }
    });
});
