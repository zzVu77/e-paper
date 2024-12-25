document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".form")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Ngăn form gửi đi mặc định nếu có lỗi

      const password = document.querySelector('input[name="password"]');
      const fullname = document.querySelector('input[name="fullname"]');
      const email = document.querySelector('input[name="email"]');
      const birthday = document.querySelector('input[name="birthday"]');

      let isValid = true; // Biến kiểm tra toàn bộ form có hợp lệ hay không

      // Hàm hiển thị lỗi dưới input
      function showError(input, message) {
        const errorDiv = input.parentElement.nextElementSibling; // Tìm thẻ <div class="error-message">
        if (errorDiv) {
          errorDiv.textContent = message; // Đặt nội dung lỗi vào <div>
        }
        isValid = false; // Đánh dấu form không hợp lệ
      }

      // Hàm xóa lỗi
      function clearError(input) {
        const errorDiv = input.parentElement.nextElementSibling; // Tìm thẻ <div class="error-message">
        if (errorDiv) {
          errorDiv.textContent = ""; // Xóa nội dung lỗi
        }
      }

      // Kiểm tra Password
      if (!password.value.trim()) {
        showError(password, "Password is required.");
      } else if (password.value.length < 6) {
        showError(password, "Password must be at least 6 characters.");
      } else {
        clearError(password);
      }

      // Kiểm tra Full name
      if (!fullname.value.trim()) {
        showError(fullname, "Full name is required.");
      } else {
        clearError(fullname);
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

      // Kiểm tra Birthday
      if (!birthday.value) {
        showError(birthday, "Birthday is required.");
      } else {
        const today = new Date();
        const birthDate = new Date(birthday.value);
        if (birthDate > today) {
          showError(birthday, "Birthday cannot be in the future.");
        } else {
          clearError(birthday);
        }
      }

      // Nếu form hợp lệ, gửi form
      if (isValid) {
        const formData = new FormData(this); // Thu thập dữ liệu từ form
        const formObject = Object.fromEntries(formData.entries()); // Chuyển dữ liệu sang object

        try {
          const result = await fetch(
            `/account/is-available?email=${formObject.email}`
          );
          const isAvailable = await result.json(); // Chuyển đổi phản hồi thành JSON
          if (!isAvailable) {
            alert("Failed!\nEmail is available. Please choose another email !");
            return;
          } else {
            try {
              // Gửi yêu cầu POST đến server
              const response = await fetch("/account/signup", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formObject), // Chuyển dữ liệu sang JSON
              });

              const result = await response.json();

              if (response.status === 200) {
                alert(result.message);
                this.reset();
                window.location.href = "/account/login";
              } else {
                alert(result.message);
              }
            } catch (err) {
              console.error("Error:", err);
              alert("An unexpected error occurred.");
            }
          }
        } catch (error) {
          console.error("Error checking email availability:", error);
        }
      }
    });
});
