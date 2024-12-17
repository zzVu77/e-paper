import puppeteer from "puppeteer";

async function genPDF(content, title) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(content, { waitUntil: "domcontentloaded" });

  // auto scroll down to the bottom of the page to load all images
  await autoScroll(page);

  // wait for images to load with timeout of 30 seconds
  await waitForImages(page, 30000);

  // Xuất PDF
  await page.pdf({
    path: `${title}.pdf`,
    format: "A4", // Khổ giấy A4 tiêu chuẩn
    printBackground: true, // Bao gồm màu nền và hình ảnh nền
    margin: {
      top: "1in", // Lề trên: 1 inch
      right: "0.5in", // Lề phải: 0.5 inch
      bottom: "1in", // Lề dưới: 1 inch
      left: "0.5in", // Lề trái: 0.5 inch
    },
  });

  await browser.close();
}

// Hàm tự động cuộn xuống cuối trang
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 150; // Khoảng cách cuộn mỗi lần
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150); // Thời gian giữa mỗi lần cuộn (ms)
    });
  });
}

// Hàm chờ hình ảnh tải với timeout
async function waitForImages(page, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout waiting for images")), timeout)
  );

  const imageLoadPromise = page.evaluate(() => {
    return Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  });

  try {
    await Promise.race([timeoutPromise, imageLoadPromise]);
  } catch (error) {
    console.warn("Image loading timeout or error:", error.message);
  }
}

export default genPDF;
