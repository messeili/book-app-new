DROP TABLE book1;
CREATE TABLE IF NOT EXISTS book1(
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    isbn VARCHAR(255),
    description TEXT,
    categories VARCHAR(255)
);