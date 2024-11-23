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
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Dummy data for parent categories
INSERT INTO categories (id, name, parent_id, created_at, updated_at)
VALUES
    -- Parent categories
    ('cat-tech-001', 'Technology', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-sci-001', 'Science', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-health-001', 'Health', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-edu-001', 'Education', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ent-001', 'Entertainment', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-travel-001', 'Travel', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-bus-001', 'Business', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-life-001', 'Lifestyle', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-sports-001', 'Sports', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-food-001', 'Food', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Child categories
    ('cat-tech-002', 'Programming', 'cat-tech-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-tech-003', 'Gadgets', 'cat-tech-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-sci-002', 'Physics', 'cat-sci-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-sci-003', 'Biology', 'cat-sci-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-health-002', 'Nutrition', 'cat-health-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-health-003', 'Mental Health', 'cat-health-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-edu-002', 'E-Learning', 'cat-edu-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-edu-003', 'Online Courses', 'cat-edu-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-ent-002', 'Movies', 'cat-ent-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ent-003', 'Music', 'cat-ent-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-travel-002', 'Destinations', 'cat-travel-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-travel-003', 'Travel Tips', 'cat-travel-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-bus-002', 'Startups', 'cat-bus-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-bus-003', 'Marketing', 'cat-bus-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-life-002', 'Fashion', 'cat-life-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-life-003', 'Wellness', 'cat-life-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-sports-002', 'Football', 'cat-sports-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-sports-003', 'Basketball', 'cat-sports-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('cat-food-002', 'Recipes', 'cat-food-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-food-003', 'Restaurants', 'cat-food-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
    ('usr-001', 'Alice Johnson', 'AliceJ', 'alice@example.com', 'password123', '1990-05-20', 'subscriber', '2024-12-31 23:59:59'),
    ('usr-002', 'Bob Smith', NULL, 'bob@example.com', 'securepass', '1985-10-15', 'writer', NULL),
    ('usr-003', 'Charlie Brown', 'CharlieB', 'charlie@example.com', 'charliepass', '1975-03-05', 'editor', NULL);

-- Dummy data for tags
INSERT INTO tags (id, name)
VALUES
    ('tag-001', 'JavaScript'),
    ('tag-002', 'MySQL'),
    ('tag-003', 'Docker');

-- Dummy data for articles
INSERT INTO articles (id, title, abstract, content, image_url, status, category_id, is_premium, views, publish_date, author)
VALUES
    ('art-001', 'Understanding Docker', 'A beginner-friendly guide to Docker.', 'Detailed content about Docker...', 'https://example.com/docker.jpg', 'published', 'cat-tech-001', TRUE, 123, '2024-01-15 10:00:00', 'usr-002'),
    ('art-002', 'MySQL Tips and Tricks', 'Optimize your database queries.', 'Detailed content about MySQL...', 'https://example.com/mysql.jpg', 'published', 'cat-tech-002', FALSE, 89, '2024-02-01 14:00:00', 'usr-001');

-- Dummy data for article_tags
INSERT INTO article_tags (article_id, tag_id)
VALUES
    ('art-001', 'tag-003'),
    ('art-002', 'tag-002');

-- Dummy data for comments
INSERT INTO comments (id, article_id, user_id, content)
VALUES
    ('com-001', 'art-001', 'usr-001', 'Great article on Docker!'),
    ('com-002', 'art-002', 'usr-003', 'Very informative!');

-- Dummy data for rejection_notes
INSERT INTO rejection_notes (id, article_id, editor_id, note)
VALUES
    ('rej-001', 'art-001', 'usr-003', 'Consider simplifying the introduction.');

-- Dummy data for editor_assignments
INSERT INTO editor_assignments (id, editor_id, category_id)
VALUES
    ('asg-001', 'usr-003', 'cat-tech-001');