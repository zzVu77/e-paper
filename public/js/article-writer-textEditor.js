//tagInput
const ulTags = document.querySelector(".article-writer-textEditor-tagInput ul");
const initialTags = ulTags.querySelectorAll("li");

const tagInput = document.querySelector(
  ".article-writer-textEditor-tagInput input"
);
const tagNumb = document.querySelector(
  ".article-writer-textEditor-tagsDetail span"
);

let maxTags = 5;
let tags = Array.from(initialTags).map(li => li.getAttribute("name"));
function countTags() {
  tagInput.focus();
  tagNumb.innerText = maxTags - tags.length;
}
// Thêm input ẩn vào form để gửi giá trị của tag
function createTag() {
  ulTags.querySelectorAll("li").forEach((li) => li.remove());
  tags
    .slice()
    .reverse()
    .forEach((tag) => {
      let liTag = `<li name="${tag}">${tag} 
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" onclick="removeTag(this, '${tag}')">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg> 
    </li>`;

      ulTags.insertAdjacentHTML("afterbegin", liTag);
    });
  countTags();
}

function removeTag(element, tag) {
  let index = tags.indexOf(tag);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  element.parentElement.remove();
  countTags();
}
function addTag(e) {
  if (tags.length < 5) {
    if (e.key == "Enter") {
      // e.preventDefault(); // Ngừng hành vi gửi form khi nhấn Enter
      let tag = e.target.value.replace(/\s+/g, " ");
      if (tag.length > 1 && !tags.includes(tag)) {
        if (tags.length < 10) {
          tag.split(",").forEach((tag) => {
            tags.push(tag);
            createTag();
          });
        }
      }
      e.target.value = "";
    }
    // console.log(tags);
  }
}
tagInput.addEventListener("keyup", addTag);

const form = document.getElementById("article-writer-textEditor-createForm"); // Lấy form đúng cách
const submitButton = document.getElementById(
  "article-writer-textEditor-publish-button"
);

submitButton.addEventListener("click", function (e) {
  // console.log("hello");
  e.preventDefault();

  const categoryName = document.getElementById("article-writer-textEditor-categoryName").value;
  if (categoryName.length === 0) {
    // console.log(categoryName); // Kiểm tra giá trị
    Swal.fire({
      title: "Error!",
      text: "Category is required" + categoryName.length,
      icon: "error",
    });
    return;
  }
  const abstract = $("#article-writer-textEditor-abstract").val();
  if (abstract.length === 0) {
    Swal.fire({
      title: "Error!",
      text: "Abstract is required",
      icon: "error",
    });
    return;
  }

  // Thêm các input ẩn với giá trị của tags

  // console.log(tags.length);
  if (tags.length === 0) {
    Swal.fire({
      title: "Error!",
      text: "Input at least 1 tag for your article",
      icon: "error",
    });
    return;
  }
  // Lấy nội dung từ Summernote (code view) nếu cần
  var content = $("#summernote").summernote("code");
  $("#article-writer-textEditor-articleContent").val(content); // Đưa nội dung vào trường ẩn trong form
  

  var contentText = $("#summernote").summernote("code").replace(/<[^>]+>/g, "").trim();
  if (contentText.length === 0) {
    Swal.fire({
      title: "Error!",
      text: "Content of the article is required",
      icon: "error",
    });
    return;
  }
  console.log(categoryName);
  console.log(categories);
  if (!categories.some(category => category.name === categoryName)) {
    Swal.fire({
      title: "Error!",
      text: "Category is not available",
      icon: "error",
    });
    return;
  }
  Swal.fire({
    title: "Confirm changes for article",
    // text: "!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes"
  }).then((result) => {
    if (result.isConfirmed) {
      tags.forEach((tag) => {
        let hiddenInput = `<input type="hidden" name="tags[]" value="${tag}">`;
        form.insertAdjacentHTML("beforeend", hiddenInput); // Thêm input ẩn vào form
      });
      let timerInterval;
      Swal.fire({
        title: "Sent Successful!",
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
        }
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          $("#article-writer-textEditor-createForm").off("submit").submit();
        }
      });
    }
  });
  //Gửi form
});

//thumbnailInput
const openPopupBtn = document.getElementById(
  "article-writer-textEditor-openImagePopup"
);
const imagePopup = document.getElementById(
  "article-writer-textEditor-imagePopup"
);
const popupOverlay = document.getElementById(
  "article-writer-textEditor-popupOverlay"
);
const closePopupBtn = document.getElementById(
  "article-writer-textEditor-closePopupBtn"
);
const fileInput = document.getElementById(
  "article-writer-textEditor-imageFileInput"
);
const thumbnailPreview = document.getElementById(
  "article-writer-textEditor-thumbnailPreview"
);

// Hiển thị popup
openPopupBtn.addEventListener("click", () => {
  imagePopup.style.display = "block";
  popupOverlay.style.display = "block";
});

// Đóng popup
closePopupBtn.addEventListener("click", () => {
  imagePopup.style.display = "none";
  popupOverlay.style.display = "none";
});

popupOverlay.addEventListener("click", () => {
  imagePopup.style.display = "none";
  popupOverlay.style.display = "none";
});

// Xử lý khi chọn file
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      thumbnailPreview.src = e.target.result;
      thumbnailPreview.style.display = "block"; // Hiển thị ảnh
    };
    reader.readAsDataURL(file);
  }
});
