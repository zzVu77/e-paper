// dateTimeHelper.js

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const options = { hour: "2-digit", minute: "2-digit" };
  const time = date.toLocaleTimeString("vi-VN", options);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${time}, ${day}/${month}/${year}`;
}

export default formatDateTime;
