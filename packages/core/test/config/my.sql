DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(100),
  content TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, name) 
  VALUES 
    (1, 'Nico'),
    (2, 'Ivan'), 
    (3, 'Diego');

INSERT INTO posts (user_id, title, content) 
  VALUES
    (1, 'Nico First Post', 'a'), 
    (1, 'Nico Second Post', 'b'),
    (2, 'Ivan Third Post', 'c');
