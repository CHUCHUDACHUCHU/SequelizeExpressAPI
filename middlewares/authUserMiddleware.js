const { Users } = require("../models");
const jwt = require("jsonwebtoken");

// 로그인 되어 있는 유저일 경우 Error를 반환한다.
module.exports = (req, res, next) => {
    try {
        const cookies = req.cookies[process.env.COOKIE_NAME];
        const [authType, authToken] = (cookies || '').split(" ");
        if (authToken && authType === 'Bearer') {
            const { userId } = jwt.verify(authToken, process.env.SECRET_KEY);
            Users.findByPk(userId).then((user) => {
                if (user) {
                    console.log(user);
                    res.status(401).send({ errorMessage: '이미 로그인이 되어있습니다.' });
                }
            });
            return;
        }
        next();
    } catch (error) {
        console.log(error.message);
        if (error.message === 'jwt expired') {
            next();
        } else {
            res.status(400).send({ errorMessage: "데이터의 형식이 올바르지 않습니다." })
        }
    }
};