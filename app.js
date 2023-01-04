const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

require('dotenv').config();

app.use('/api/posts', require('./routes/post'));
app.use('/api/comments', require('./routes/comment'));
app.use('/api', require('./routes/user'));

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(process.env.EXPRESS_PORT, '포트로 서버가 열렸습니다.');
});

app.get('/', (req, res) => {
  res.send('hello world');
});
