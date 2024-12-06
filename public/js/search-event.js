document
  .getElementById("search_input")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const keyword = event.target.value;
      console.log(keyword);
      if (keyword.trim() !== "") {
        window.location.href = `/posts/search?keyword=${encodeURIComponent(
          keyword
        )}`;
      }
    }
  });
