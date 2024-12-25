document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".logout").addEventListener("click", function () {
    fetch("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/"; // Chuyển hướng sau khi logout thành công
        } else {
          alert("Logout failed");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
});
