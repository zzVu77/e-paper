document.addEventListener('DOMContentLoaded', function() {
  // Change password button handler
  const submitButton = document.getElementById("accountSetting-security-button");
  if (submitButton) {
    submitButton.addEventListener("click", function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById("currentpassword").value;
      const newPassword = document.getElementById("newpassword").value;
      const confirmNewPassword = document.getElementById("confirmnewpassword").value;

      if (currentPassword === "" || newPassword === "" || confirmNewPassword === "") {
        Swal.fire({
          title: "Error!",
          text: "All fields are required",
          icon: "error",
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        Swal.fire({
          title: "Error!",
          text: "New password and confirm new password do not match",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Confirm changes",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {
          let timerInterval;
          Swal.fire({
            title: "Processing...",
            html: "Autoclose after <b></b> seconds.",
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {
                timer.textContent = Math.floor(Swal.getTimerLeft() / 1000);
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
              document.querySelector('.accountsetting-security-form-input').submit();
            }
          });
        }
      });
    });
  }

  // Create password button handler
  const createPasswordButton = document.getElementById("accountSetting-security-createPassword-button");
  if (createPasswordButton) {
    createPasswordButton.addEventListener("click", function (e) {
      e.preventDefault();

      const newPassword = document.getElementById("newpassword").value;
      const confirmNewPassword = document.getElementById("confirmnewpassword").value;

      if (newPassword === "" || confirmNewPassword === "") {
        Swal.fire({
          title: "Error!",
          text: "All fields are required",
          icon: "error",
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        Swal.fire({
          title: "Error!",
          text: "New password and confirm new password do not match",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Confirm changes",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {
          let timerInterval;
          Swal.fire({
            title: "Processing...",
            html: "Autoclose after <b></b> seconds.",
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {
                timer.textContent = Math.floor(Swal.getTimerLeft() / 1000);
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
              document.querySelector('.accountsetting-security-createPasswordForm-input').submit();
            }
          });
        }
      });
    });
  }
}); 