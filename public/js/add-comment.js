document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const content = document.querySelector('textarea[name="comment"]').value;
      console.log(content);

      if (!content) {
        alert("Content is required");
        return;
      }

      const comment_date = new Date().toLocaleString();
      const articleDetail = document.getElementById("article-detail");
      const articleId = articleDetail.getAttribute("data-article-id");

      if (!articleId) {
        console.error("Article ID is missing");
        return;
      }

      try {
        const response = await fetch("/posts/add-comment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId: articleId,
            content: content,
            comment_date: comment_date,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const commentList = document.querySelector(".list-comment");
          const commentItem = document.createElement("div");
          commentItem.className =
            "comment-container tw-w-[99%] tw-h-[180px] tw-flex tw-justify-start tw-items-center tw-border-[0.5px] tw-border-solid tw-rounded-lg tw-border-gray-300 tw-m-auto tw-mt-5";
          commentItem.innerHTML = `
                <div class="user-avatar tw-w-[15%] tw-ml-5">
                  <img
                    class="tw-object-cover tw-object-top tw-w-[100px] tw-h-[100px] tw-block tw-rounded-[100%]"
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    alt=""
                  />
                </div>
               
                <div class="comment-detail tw-ml-2 tw-mt-2 flex tw-flex-col tw-w-[80%]">
                  <div class="flex tw-justify-between tw-items-center">
                    <span
                      class="user-name tw-font-bold tw-text-lg tw-text-center"
                    >${result.userName}</span>
                    <span
                      class="datetime tw-text-gray-600 tw-font-normal tw-text-sm text- tw-text-center"
                    >${comment_date}</span>
                  </div>
               
                  <textarea
                    class="tw-w-[100%] tw-h-[100px] tw-border-none tw-overflow-y-auto tw-mt-3 tw-font-light"
                    name=""
                    readonly
                    id=""
                  >${content}</textarea>
                </div>`;

          commentList.prepend(commentItem);
          this.reset();
        } else {
          throw new Error(result.message || "Failed to add comment.");
        }
      } catch (error) {
        console.error("Error while adding comment:", error);
        alert("An error occurred while adding the comment. Please try again.");
      }
    });
});
