CREATE DATABASE IF NOT EXISTS e_paper;
USE e_paper;
-- Table: users
CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pen_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    role ENUM('guest', 'subscriber', 'writer', 'editor', 'admin') NOT NULL,
    subscription_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Table: categories
CREATE TABLE categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
-- Table: tags
CREATE TABLE tags (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Table: articles
CREATE TABLE articles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    status ENUM('draft', 'pending', 'published', 'rejected') NOT NULL,
    category_id CHAR(36) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    publish_date DATETIME,
    author CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
);
-- Table: article_tags
CREATE TABLE article_tags (
    article_id CHAR(36) NOT NULL,
    tag_id CHAR(36) NOT NULL,
    UNIQUE (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
-- Table: comments
CREATE TABLE comments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    article_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Table: rejection_notes
CREATE TABLE rejection_notes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    article_id CHAR(36) NOT NULL,
    editor_id CHAR(36) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Table: editor_assignments
CREATE TABLE editor_assignments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    editor_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
-- Dummy data for users
INSERT INTO users (id, name, pen_name, email, password, birthdate, role, subscription_expiry)
VALUES
    (UUID(), 'Alice Johnson', 'AliceJ', 'alice@example.com', 'password123', '1990-05-20', 'subscriber', '2024-12-31 23:59:59'),
    (UUID(), 'Bob Smith', NULL, 'bob@example.com', 'securepass', '1985-10-15', 'writer', NULL),
    (UUID(), 'Charlie Brown', 'CharlieB', 'charlie@example.com', 'charliepass', '1975-03-05', 'editor', NULL);
-- Dummy data for categories
INSERT INTO categories (id, name, parent_id)
VALUES
    (UUID(), 'Technology', NULL),
    (UUID(), 'Programming', NULL),
    (UUID(), 'Web Development', NULL),
    (UUID(), 'Science', NULL),
    (UUID(), 'Mathematics', NULL),
    (UUID(), 'Engineering', NULL),
    (UUID(), 'Health', NULL),
    (UUID(), 'Education', NULL),
    (UUID(), 'Finance', NULL),
    (UUID(), 'Arts', NULL);

-- Set ID of parent categories to temporary values
SET @tech_id = (SELECT id FROM categories WHERE name = 'Technology');

SET @prog_id = (SELECT id FROM categories WHERE name = 'Programming');

SET @web_id = (SELECT id FROM categories WHERE name = 'Web Development');

SET @sci_id = (SELECT id FROM categories WHERE name = 'Science');

SET @math_id = (SELECT id FROM categories WHERE name = 'Mathematics');

SET @eng_id = (SELECT id FROM categories WHERE name = 'Engineering');

SET @health_id = (SELECT id FROM categories WHERE name = 'Health');

SET @edu_id = (SELECT id FROM categories WHERE name = 'Education');

SET @finance_id = (SELECT id FROM categories WHERE name = 'Finance');

SET @arts_id = (SELECT id FROM categories WHERE name = 'Arts');

-- Insert child categories
INSERT INTO categories (id, name, parent_id)
VALUES
    -- Child categories for 'Technology'
    (UUID(), 'Gadgets', @tech_id),
    (UUID(), 'Artificial Intelligence', @tech_id),

    -- Child categories for 'Programming'
    (UUID(), 'Python', @prog_id),
    (UUID(), 'JavaScript', @prog_id),

    -- Child categories for 'Web Development'
    (UUID(), 'Frontend Development', @web_id),
    (UUID(), 'Backend Development', @web_id),

    -- Child categories for 'Science'
    (UUID(), 'Physics', @sci_id),
    (UUID(), 'Chemistry', @sci_id),

    -- Child categories for 'Mathematics'
    (UUID(), 'Algebra', @math_id),
    (UUID(), 'Geometry', @math_id),

    -- Child categories for 'Engineering'
    (UUID(), 'Civil Engineering', @eng_id),
    (UUID(), 'Mechanical Engineering', @eng_id),

    -- Child categories for 'Health'
    (UUID(), 'Nutrition', @health_id),
    (UUID(), 'Mental Health', @health_id),

    -- Child categories for 'Education'
    (UUID(), 'Online Courses', @edu_id),
    (UUID(), 'Classroom Learning', @edu_id),

    -- Child categories for 'Finance'
    (UUID(), 'Investing', @finance_id),
    (UUID(), 'Personal Finance', @finance_id),

    -- Child categories for 'Arts'
    (UUID(), 'Painting', @arts_id),
    (UUID(), 'Music', @arts_id);


-- Dummy data for tags
INSERT INTO tags (id, name)
VALUES
    (UUID(), 'JavaScript'),
    (UUID(), 'MySQL'),
    (UUID(), 'Docker');
-- Dummy data for articles
INSERT INTO articles (id, title, abstract, content, image_url, status, category_id, is_premium, views, publish_date, author)
VALUES
    (UUID(), 'Understanding Docker', 'A beginner-friendly guide to Docker.', 'Detailed content about Docker...', 'https://example.com/docker.jpg', 'published', (SELECT id FROM categories WHERE name = 'Technology'), TRUE, 123, '2024-01-15 10:00:00', (SELECT id FROM users WHERE name = 'Bob Smith')),
    (UUID(), 'MySQL Tips and Tricks', 'Optimize your database queries.', 'Detailed content about MySQL...', 'https://example.com/mysql.jpg', 'published', (SELECT id FROM categories WHERE name = 'Programming'), FALSE, 89, '2024-02-01 14:00:00', (SELECT id FROM users WHERE name = 'Alice Johnson'));
-- Dummy data for article_tags
INSERT INTO article_tags (article_id, tag_id)
VALUES
    ((SELECT id FROM articles WHERE title = 'Understanding Docker'), (SELECT id FROM tags WHERE name = 'Docker')),
    ((SELECT id FROM articles WHERE title = 'MySQL Tips and Tricks'), (SELECT id FROM tags WHERE name = 'MySQL'));
-- Dummy data for comments
INSERT INTO comments (id, article_id, user_id, content)
VALUES
    (UUID(), (SELECT id FROM articles WHERE title = 'Understanding Docker'), (SELECT id FROM users WHERE name = 'Alice Johnson'), 'Great article on Docker!'),
    (UUID(), (SELECT id FROM articles WHERE title = 'MySQL Tips and Tricks'), (SELECT id FROM users WHERE name = 'Charlie Brown'), 'Very informative!');
-- Dummy data for rejection_notes
INSERT INTO rejection_notes (id, article_id, editor_id, note)
VALUES
    (UUID(), (SELECT id FROM articles WHERE title = 'Understanding Docker'), (SELECT id FROM users WHERE name = 'Charlie Brown'), 'Consider simplifying the introduction.');
-- Dummy data for editor_assignments
INSERT INTO editor_assignments (id, editor_id, category_id)
VALUES
    (UUID(), (SELECT id FROM users WHERE name = 'Charlie Brown'), (SELECT id FROM categories WHERE name = 'Technology'));