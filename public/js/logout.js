document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".client-header-loginButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/";
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }
});
