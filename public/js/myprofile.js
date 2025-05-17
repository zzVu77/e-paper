document.addEventListener('DOMContentLoaded', function() {
  // Initialize Flatpickr
  flatpickr("#accountsetting-myprofile-dateofbirth", {
    dateFormat: "Y-m-d"
  });

  // Subscription button handler
  const subscriptionSubmitButton = document.getElementById("accountSetting-myprofile-subscriptionButton");
  if (subscriptionSubmitButton) {
    subscriptionSubmitButton.addEventListener("click", function (e) {
      e.preventDefault();
      Swal.fire({
        title: "Confirm subscription",
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
            title: "Changes saved successfully!",
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
              document.querySelector('.accountsetting-myprofile-subscriptionform-input').submit();
            }
          });
        }
      });
    });
  }

  // Save changes button handler
  const submitButton = document.getElementById("accountSetting-myprofile-button");
  if (submitButton) {
    submitButton.addEventListener("click", function (e) {
      e.preventDefault();
      const email = document.getElementById("accountsetting-myprofile-email").value;
      const fullName = document.getElementById("accountsetting-myprofile-name").value;
      const birthdate = document.getElementById("accountsetting-myprofile-dateofbirth").value;

      if (email === "" || fullName === "" || birthdate === "") {
        Swal.fire({
          title: "Error!",
          text: "All fields are required",
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
            title: "Changes saved successfully!",
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
              document.querySelector('.accountsetting-myprofile-form-input').submit();
            }
          });
        }
      });
    });
  }
}); 