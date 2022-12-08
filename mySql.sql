CREATE TABLE Users
(
    userId      int(11)             NOT NULL, AUTO_INCREMENT PRIMARY KEY,
    nickname    varchar(255) UNIQUE NOT NULL,
    password    varchar(255)        NOT NULL,
    createdAt   datetime            NOT NULL DEFAULT NOW(),
    updatedAt   datetime            NOT NULL DEFAULT NOW()
);

CREATE TABLE Posts (
    postId      int(11)             NOT NULL, AUTO_INCREMENT PRIMARY KEY,
    userId      int(11)             NOT NULL,
    title       varchar(255)        NOT NULL,
    content     varchar(255)        NOT NULL,
    createdAt   datetime            NOT NULL DEFAULT NOW(),
    updatedAt   datetime            NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES Users (userId) ON DELETE CASCADE,
    FOREIGN KEY (nickname) REFERENCES Users (nickname) ON DELETE CASCADE,
);

CREATE TABLE Comments (
    commentId   int(11)             NOT NULL, AUTO_INCREMENT PRIMARY KEY,
    postId      int(11)             NOT NULL,
    userId      int(11)             NOT NULL,
    content     varchar(255)        NOT NULL,
    createdAt   datetime            NOT NULL DEFAULT NOW(),
    updatedAt   datetime            NOT NULL DEFAULT NOW(),
    FOREIGN KEY (postId) REFERENCES Posts (postId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users (userId) ON DELETE CASCADE,
    FOREIGN KEY (nickname) REFERENCES Users (nickname) ON DELETE CASCADE,
);

CREATE TABLE Likes (
    likeId      int(11)             NOT NULL, AUTO_INCREMENT PRIMARY KEY,
    postId      int(11)             NOT NULL,
    userId      int(11)             NOT NULL,
    createdAt   datetime            NOT NULL DEFAULT NOW(),
    updatedAt   datetime            NOT NULL DEFAULT NOW(),
    FOREIGN KEY (postId) REFERENCES Posts (postId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users (userId) ON DELETE CASCADE,
    FOREIGN KEY (nickname) REFERENCES Users (nickname) ON DELETE CASCADE,
);
