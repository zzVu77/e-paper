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

      // Nếu form hợp lệ, tiến hành gửi email
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
        console.log(result);
        if (result.success) {
          alert("Email sent successfully!");
          this.reset();
          window.location.href = "/verify-otp";
        } else {
          alert("Failed to send email.");
        }
        // try {
        //   emailjs.init({
        //     publicKey: "FhN3nVUbb808XWXhm", // Khóa công khai của bạn
        //   });

        //   // Tạo tham số template
        //   const templateParams = {
        //     otp_code: "1234", // Mã OTP (có thể thay đổi theo yêu cầu)
        //     valid_minutes: "5", // Thời gian hợp lệ (có thể thay đổi theo yêu cầu)
        //     user: email.value.trim(), // Email người dùng nhập vào
        //   };

        //   // Gửi email qua EmailJS
        //   const response = await emailjs.send(
        //     "service_v92x03b", // Service ID của bạn
        //     "template_ue8v0qs", // Template ID của bạn
        //     templateParams
        //   );

        //   if (response.status === 200) {
        //     console.log("SUCCESS!", response.status, response.text);
        //     alert("Email sent successfully!");
        //     this.reset();
        //     window.location.href = "/verify-otp";
        //     // Thông báo thành công
        //   } else {
        //     console.log("FAILED!", response);
        //     alert("Failed to send email."); // Thông báo thất bại
        //   }
        // } catch (error) {
        //   console.error("Error sending email:", error);
        //   alert("Error sending email, please try again later.");
        // }
      }
    });
});
