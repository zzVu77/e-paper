document.querySelectorAll("#article-manage-delBtn").forEach((deleteBtn) => {
  deleteBtn.addEventListener("click", function (e) {
    e.preventDefault();
    Swal.fire({
      title: "Confirm delete this article",
      text: "This can be undo, be careful",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        let timerInterval;
        Swal.fire({
          title: "Delete Successful!",
          html: "Autoclose after <b></b> seconds.",
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
              // Hiển thị số giây còn lại (làm tròn xuống)
              timer.textContent = Math.floor(Swal.getTimerLeft() / 1000);
            }, 100); // Cập nhật mỗi 100ms để đảm bảo đồng bộ
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            e.target.closest("form").submit();
          }
        });
      }
    });
  });
});

const submitButton = document.getElementById("article-manage-searchBtn");

submitButton.addEventListener("click", function (e) {
  e.preventDefault(); // Ngăn chặn hành động mặc định của nút click
  document.getElementById("article-manage-filterForm").submit(); // Gửi form thủ công
});
