import express from "express";
import articleService from "../services/article.service.js";
const router = express.Router();

router.get("/", async function (req, res) {
  const articles = await articleService.getAllArticles();
  res.render("posts", { articles: articles, title: "All posts" });
});

router.get("/byCat", async function (req, res) {
  const name = req.query.name || "";
  const current_page = req.query.page || 1;
  const limit = 6;
  const offSet = (+current_page - 1) * limit;
  const total = await articleService.countArticlesByCategory(name);
  const totalPages = Math.ceil(total / limit);
  const pageNumber = [];
  const maxVisiblePage = 5;
  const startPage = Math.max(
    0,
    current_page - (Math.floor(maxVisiblePage / 2) - 1)
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePage);
  console.log(endPage);
  for (let i = startPage; i < endPage; i++) {
    pageNumber.push({
      value: i + 1,
      catName: name,
      active: i + 1 === parseInt(current_page),
    });
  }
  const articles = await articleService.getArticlesByCategory(
    name,
    limit,
    offSet
  );
  console.log(name);
  res.render("posts", {
    hasPagination: totalPages > 1,
    articles: articles,
    title: name,
    catName: name,
    pageNumber: pageNumber,
    totalPages: totalPages,
    hasNextPage: current_page < totalPages,
    hasPreviousPage: current_page > 1,
    nextPage: parseInt(current_page) + 1,
    previousPage: parseInt(current_page) - 1,
    isByCategory: true,
  });
});

router.get("/byTag", async function (req, res) {
  const name = req.query.name || "";
  const current_page = req.query.page || 1;
  const limit = 6;
  const offSet = (+current_page - 1) * limit;
  const total = await articleService.countArticlesByTagName(name);
  const totalPages = Math.ceil(total / limit);
  const pageNumber = [];
  const maxVisiblePage = 5;
  const startPage = Math.max(
    0,
    current_page - Math.floor(maxVisiblePage / 2) - 1
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePage);
  for (let i = startPage; i < endPage; i++) {
    pageNumber.push({
      value: i + 1,
      tagName: name,
      active: i + 1 === parseInt(current_page),
    });
  }
  const articles = await articleService.getArticlesByTag(name, limit, offSet);
  res.render("posts", {
    articles: articles,
    tagName: name,
    title: "#" + name,
    hasPagination: totalPages > 1,
    articles: articles,
    pageNumber: pageNumber,
    totalPages: totalPages,
    hasNextPage: current_page < totalPages,
    hasPreviousPage: current_page > 1,
    nextPage: parseInt(current_page) + 1,
    previousPage: parseInt(current_page) - 1,
    isByTagName: true,
  });
});

router.get("/search", async function (req, res) {
  const keyword = req.query.keyword || "";
  const current_page = req.query.page || 1;
  const limit = 6;
  const offSet = (+current_page - 1) * limit;
  const total = await articleService.countArticlesByKeyword(keyword);
  const totalPages = Math.ceil(total / limit);
  const pageNumber = [];
  const maxVisiblePage = 5;
  const startPage = Math.max(
    0,
    current_page - Math.floor(maxVisiblePage / 2) - 1
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePage);
  for (let i = startPage; i < endPage; i++) {
    pageNumber.push({
      value: i + 1,
      keyword: keyword,
      active: i + 1 === parseInt(current_page),
    });
  }
  const articles = await articleService.searchArticlesByKeyword(
    keyword,
    limit,
    offSet
  );
  res.render("posts", {
    articles: articles,
    keyword: keyword,
    title: "#" + keyword,
    hasPagination: totalPages > 1,
    articles: articles,
    pageNumber: pageNumber,
    totalPages: totalPages,
    hasNextPage: current_page < totalPages,
    hasPreviousPage: current_page > 1,
    nextPage: parseInt(current_page) + 1,
    previousPage: parseInt(current_page) - 1,
    isByKeyword: true,
  });
});

router.get("/detail", function (req, res) {
  const content = `<div class="paragraph paragraph--type--content-block-text paragraph--view-mode--default" style="color: rgb(5, 5, 5); font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">MIT’s class 18.06 (<a href="https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">Linear Algebra</a>) has surpassed 10 million views on&nbsp;<a href="https://ocw.mit.edu/index.htm" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">OpenCourseWare</a>&nbsp;(OCW). That’s the kind of math that makes Professor&nbsp;<a href="http://math.mit.edu/directory/profile.php?pid=266" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">Gilbert Strang</a>&nbsp;one of the most recognized mathematicians in the world.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“That was a surprise to me,” says Strang. But not to those at OCW.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“He is a favorite; there is no way around it,” says OCW Director Curt Newton. Each month, OCW publishes a list of its most-visited courses, and Newton points out that Strang’s course has always been among the top 10 most-viewed since OCW launched. “He cracked the 10 million number,” he says. “It’s clear that Gil’s teaching has struck just the right chord with learners and educators around the world.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Strang’s 18.06 lectures, posted between 2002-2011, also have more than 3.1 million YouTube views from math students in places like India, China, and Africa, among others. “His lectures are just excellent,” explains math Professor Haynes Miller. To illustrate the video’s massive popularity, Miller recounts a conversation, at the online Electronic Seminar on Mathematics Education, about revising a linear algebra course at the University of Illinois. “In the new version, they do almost no lecturing ... and one reason they feel that they can get away with that is that they can send students to Gil’s lectures on OCW.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"><span style="font-weight: bolder;">A linear path to MIT</span></p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Strang, the MathWorks Professor of Mathematics, received his BS from MIT in 1955. After earning Rhodes Scholarship to Oxford University and a PhD from the University of California at Los Angeles in 1959, he returned to MIT to teach.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Strang began teaching linear algebra in the 1970s, during a time when engineers and scientists wrote large software packages using the finite element method to solve structural problems, computing forces and stresses in solid and fluid mechanics. Strang recalls his “Aha!” moment when he thought about the finite element method of solving partial differential equations using simple trial functions. With scientists generating a huge amount of data, from magnetic resonance scans producing millions of images to microarrays of entire genomes, the goal was to find structure and language to make sense of it all.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Once Strang realized that the tools of linear algebra were related to everything from pure math to the internet, he decided to change the way the subject was taught. The 18.06 class soon became popular with science and engineering students, at MIT and around the world. Now in its fifth edition, Strang’s textbook "Introduction to Linear Algebra" has been translated into French, German, Greek, Japanese, and Portuguese. More than 40 years later, about a third of MIT students take this course.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“I’m not teaching the math guys who jump over linear algebra,” he says. “18.06 is specifically for engineering and science and economics and management.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Certainly one of the secrets to his OCW success is his teaching style. Strang has a quick smile and an encouraging manner. In his class, he says “please” and “thank you.” To gauge whether students are keeping up, he asks, “Am I OK?” or adds explanations and recaps. He strives for an interactive class by asking questions, and gives intuitions and pictures before presenting a formal proof. And the students seem delighted to see beautiful results emerge from seemingly simple constructions.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">After a lifetime of teaching at MIT, he is still able to project energy and enthusiasm over his subject. In short, he’s a natural for video.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“My original motive for doing this was to encourage other faculty to do it, and maybe show them a new way to teach linear algebra,” he says. His first set of lectures was recorded in 1999 with support from the Lord Foundation of Massachusetts. The videos don’t feature fancy graphics or music, but are an homage to the power of old-school lectures with a chalkboard by a master teacher.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">The most popular of Strang’s multiple 18.06 OCW versions is the enhanced&nbsp;<a href="https://ocw.mit.edu/courses/mathematics/18-06sc-linear-algebra-fall-2011/" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">18.06SC “OCW Scholar”</a>&nbsp;version, published in 2011. It adds problem-solving videos by grad students and postdocs patiently explaining a complex subject to a grateful audience, very much in the spirit of Strang’s lectures.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“This lecture series is one of the few that I like to watch for fun,” says one commenter. Adds another, “This teacher would be fun to sit down with and have a cup of coffee and conversation.” And a high school teacher says, “He is clear, interesting, and nonthreatening. I watch his linear algebra lessons and wish I could tell him how terrific he is.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"><span style="font-weight: bolder;">A new book</span></p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">OCW&nbsp;<a href="https://ocw.mit.edu/courses/mathematics/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/" target="_blank" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">recently posted</a>&nbsp;34 videos, along with an introduction, to his relatively new class&nbsp;<a href="http://math.mit.edu/classes/18.065/2019SP/" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">18.065</a>&nbsp;(Matrix Methods in Data Analysis, Signal Processing, and Machine Learning.) To accompany the class, Strang recently released "<a href="http://math.mit.edu/~gs/learningfromdata/" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">Linear Algebra and Learning from Data</a>," his 12th textbook.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Strang is known for his clear yet lively writing, and early reviews confirm that this new book continues his style. Even the book’s cover is evocative. He chose a photo his son Robert took, on Inle Lake in Myanmar, of a man on a boat holding a fishing net encased in a bamboo cage. The man is lifting up what Strang says resembles a neural net.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">The class was a chance for Strang to expand his linear algebra teachings into the area of deep learning. This class debuted in 2017 when Professor Raj Rao Nadakuditi of the University of Michigan spent his sabbatical teaching 18.065 at MIT. For the class, professor of applied mathematics&nbsp;<a href="http://math.mit.edu/directory/profile?pid=63" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">Alan Edelman</a>&nbsp;introduced the powerful language&nbsp;<a href="http://news.mit.edu/2018/mit-developed-julia-programming-language-debuts-juliacon-0827" style="color: rgb(5, 5, 5); box-shadow: rgb(255, 70, 70) 0px -2px inset;">Julia</a>, while Strang explained the four fundamental subspaces and the Singular Value Decomposition.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“This was linear algebra for signals and data, and it was alive,” says Strang. “More important, this was the student response, too.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Last spring, he started assembling the handouts and online materials into a book. Now in its third year, the class is held in 2-190 and is filled to capacity. In the class and book, Strang starts with linear algebra and moves to optimization by gradient descent, and then to the structure and analysis of deep learning. His goal is to organize central methods and ideas of data science, and to show how the language of linear algebra expresses those ideas.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“The new textbook is just the beginning, as the course invites students to ask their own questions and write their own programs. Exams are outlawed. A key point of the course is that it ends with a project from each student — and those projects are wonderful.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">His students agree.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“Professor Strang structures the class so that ideas seem to flow from the students into proofs,” says senior and math major Jesse Michel. “There’s a nice balance between proofs and examples, so that you know the approaches work in general, while never losing sight of practice. Every class includes a cool math trick or joke that keeps the class laughing. Professor Strang’s energy and emphasis on the exciting points keeps the class on the edge of their seats.”</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"><span style="font-weight: bolder;">Open means open</span></p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">Haynes Miller says that all MIT faculty are invited to contribute courses to OCW. There are about 2,450 courses on OCW currently, with over 100 having complete video lectures, and more going up as fast as OCW can post them.</p><p style="line-height: 1.75em; margin-top: 20px; margin-bottom: 30px; font-family: MessinaSans, sans-serif; font-size: 20px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">“OCW began under foundation grants, but is now supported by the provost here at MIT, corporate sponsors, and user donations,” says Miller. “I feel that MIT faculty are extremely lucky to have OpenCourseWare as a publication venue for courseware we design.”</p></div>`;
  res.render("article-detail", { title: "", content: content });
});
export default router;
