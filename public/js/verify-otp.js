document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const otp_code = document.getElementById("otp");
      const newpsd = document.getElementById("newpsd");
      const confirmpsd = document.getElementById("confirmpsd");
      if (newpsd.value !== confirmpsd.value) {
        alert("Password does not match");
      } else {
        const url = new URL(window.location.href);
        const email = url.searchParams.get("email");
        console.log(email);
        try {
          const response = await fetch("/reset-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              otp: otp_code.value,
              password: newpsd.value,
              email: email,
            }),
          });
          const result = await response.json();
          if (result.status === "success") {
            alert(result.message);
            window.location.href = "/login";
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.log("Error:", error);
          alert("Failed to reset password");
        }
      }
    });
});
