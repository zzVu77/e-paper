import express from "express";
import articleService from "../services/article.service.js";
const router = express.Router();

router.get("/", async function (req, res) {
  const articles = await articleService.getAllArticles();
  res.render("posts", { articles: articles, title: "All posts" });
});

router.get("/byCat", async function (req, res) {
  const name = req.query.name || "";
  const articles = await articleService.getArticlesByCategory(name);
  // console.log(articles);
  res.render("posts", { articles: articles, title: name });
});

router.get("/byTag", async function (req, res) {
  const name = req.query.name || "";
  console.log(name);
  const articles = await articleService.getArticlesByTag(name);
  console.log(articles);
  res.render("posts", {
    articles: articles,
    title: "#" + name,
  });
});
router.get("/search", async function (req, res) {
  const keyword = req.query.keyword || "";
  console.log(keyword);
  const articles = await articleService.searchArticlesByKeyword(keyword);
  console.log(articles);
  res.render("posts", {
    articles: articles,
  });
});

router.get("/detail", function (req, res) {
  const content = `<h1
      class="title-detail"
      style="margin-bottom: 15px; text-rendering: optimizelegibility; line-height: 48px; font-feature-settings: &quot;pnum&quot;, &quot;lnum&quot;;"
    >Bộ Chính trị cảnh cáo ông Vương Đình Huệ, Nguyễn Văn Thể</h1><p
      class="description"
      style="margin-bottom: 15px; text-rendering: optimizelegibility; line-height: 28.8px;"
    >Bộ Chính trị cảnh cáo hai ông Vương Đình Huệ và Nguyễn Văn Thể; chưa xem
      xét, xử lý kỷ luật ông Võ Văn Thưởng do đang điều trị bệnh.</p><p
      class="description"
      style="margin-bottom: 15px; text-rendering: optimizelegibility; line-height: 28.8px;"
    >Ngày 20/11, sau khi xem xét đề nghị của Ủy ban Kiểm tra Trung ương, Bộ
      Chính trị,&nbsp;Ban Bí thư nhận thấy các ông Võ Văn Thưởng, Vương Đình
      Huệ, Nguyễn Văn Thể và một số cán bộ khác đã có vi phạm, khuyết điểm.</p><p
      class="description"
      style="margin-bottom: 15px; text-rendering: optimizelegibility; line-height: 28.8px;"
    >Cụ thể, ông Võ Văn Thưởng trong thời gian giữ cương vị Ủy viên Trung ương
      Đảng,&nbsp;Bí thư Tỉnh ủy Quảng Ngãi nhiệm kỳ 2010-2015, Ủy viên Bộ Chính
      trị, Trưởng ban Tuyên giáo Trung ương, Thường trực Ban Bí thư, Chủ tịch
      nước và ông Vương Đình Huệ trong thời gian giữ cương vị Ủy viên Bộ Chính
      trị, Bí thư Đảng đoàn, Chủ tịch Quốc hội đã vi phạm quy định của Đảng, Nhà
      nước trong thực hiện chức trách, nhiệm vụ được giao.</p><p
      class="description"
      style="margin-bottom: 15px; text-rendering: optimizelegibility; line-height: 28.8px;"
    ><span
        style="--tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ; text-rendering: optimizelegibility;"
      >Ông Thưởng và ông Huệ&nbsp;</span>cũng vi phạm trong phòng, chống tham
      nhũng, tiêu cực; vi&nbsp;phạm quy định những điều đảng viên không được làm
      và trách nhiệm nêu gương; gây hậu quả nghiêm trọng, dư luận xấu, ảnh hưởng
      đến uy tín của Đảng và Nhà nước. Vì thế, Bộ Chính trị quyết định kỷ luật
      cảnh cáo ông Vương Đình Huệ. Ông Võ Văn Thưởng chưa xem xét kỷ luật do
      đang điều trị bệnh.&nbsp;</p><article
      class="fck_detail"
      lg-uid="lg0"
      style="text-rendering: optimizelegibility; width: 680px; float: left; position: relative; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 28.8px;"
    ><figure
        data-size="true"
        itemprop="associatedMedia image"
        itemscope=""
        itemtype="http://schema.org/ImageObject"
        class="tplCaption action_thumb_added"
        style="margin-right: auto; margin-bottom: 15px; margin-left: auto; text-rendering: optimizelegibility; max-width: 100%; clear: both; position: relative; text-align: center; width: 680px; float: left;"
      ><div
          class="fig-picture el_valid"
          bis_skin_checked="1"
          data-src="https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=0&amp;h=0&amp;q=100&amp;dpr=2&amp;fit=crop&amp;s=ZVImBtLoORIEwghypV9FYQ"
          data-sub-html="&lt;div class=&quot;ss-wrapper&quot;&gt;&lt;div class=&quot;ss-content&quot;&gt;
  &lt;p class=&quot;Image&quot;&gt;Ông Vương Đình Huệ. Ảnh: &lt;em&gt;Hoàng Phong&lt;/em&gt;&lt;/p&gt;
  &lt;/div&gt;&lt;/div&gt;"
          style="padding-bottom: 407.881px; text-rendering: optimizelegibility; width: 680px; float: left; display: table; -webkit-box-pack: center; justify-content: center; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; position: relative;"
        ><picture style="text-rendering: optimizelegibility;"><source
              data-srcset="https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DDhZeFwPefykNclwp88dew 1x, https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=1020&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DaUMvcDexi_oNkOkVwTQWg 1.5x, https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=2&amp;fit=crop&amp;s=GmBef366UCtbLdmsqN7Csg 2x"
              srcset="https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DDhZeFwPefykNclwp88dew 1x, https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=1020&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DaUMvcDexi_oNkOkVwTQWg 1.5x, https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=2&amp;fit=crop&amp;s=GmBef366UCtbLdmsqN7Csg 2x"
              style="text-rendering: optimizelegibility;"
            /><img
              itemprop="contentUrl"
              loading="lazy"
              intrinsicsize="680x0"
              alt="Ông Vương Đình Huệ. Ảnh: Hoàng Phong"
              class="lazy lazied"
              src="https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DDhZeFwPefykNclwp88dew"
              data-src="https://i1-vnexpress.vnecdn.net/2024/11/21/c51122e97b17c0499906-173218411-3947-6828-1732184150.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=DDhZeFwPefykNclwp88dew"
              data-ll-status="loaded"
              style="text-rendering: optimizelegibility; border-style: initial; line-height: 0; max-width: 100%; position: absolute; top: 0px; left: 0px; max-height: 700px;"
            /></picture></div><figcaption
          itemprop="description"
          style="text-rendering: optimizelegibility; width: 680px; float: left; text-align: left;"
        ><p
            class="Image"
            style="margin-bottom: 0px; padding-top: 10px; text-rendering: optimizespeed; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 22.4px;"
          >Ông Vương Đình Huệ. Ảnh:&nbsp;<span
              style="text-rendering: optimizelegibility;"
            >Hoàng Phong</span></p><p
            class="Image"
            style="margin-bottom: 0px; padding-top: 10px; text-rendering: optimizespeed; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 22.4px;"
          >&nbsp;</p><p
            class="Image"
            style="margin-bottom: 0px; padding-top: 10px; text-rendering: optimizespeed; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 22.4px;"
          ><br /></p><p
            class="Image"
            style="margin-bottom: 0px; padding-top: 10px; text-rendering: optimizespeed; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 22.4px;"
          ><br /></p><p
            class="Image"
            style="margin-bottom: 0px; padding-top: 10px; text-rendering: optimizespeed; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: 22.4px;"
          ><br /></p></figcaption></figure><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"
      ><br /></p><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"
      ><br /></p><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"
      ><br /></p><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"
      ><br /></p><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"
      ><br /></p><p
        class="Normal"
        style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px; font-family: arial; font-size: 18px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"
      ><br /></p></article>`;
  res.render("article-detail", { title: "", content: content });
});
export default router;