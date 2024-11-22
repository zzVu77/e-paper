function toggleStatus(button) {
    // Kiểm tra trạng thái hiện tại của button
    if (button.textContent === "Đã duyệt") {
        button.textContent = "Nháp"; 
        button.classList.remove("tw-bg-amber-400"); 
        button.classList.add("tw-bg-gray-400"); 
    } else {
        button.textContent = "Đã duyệt"; 
        button.classList.remove("tw-bg-gray-400"); 
        button.classList.add("tw-bg-amber-400"); 
    }
}