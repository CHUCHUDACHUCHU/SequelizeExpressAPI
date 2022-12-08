const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const authUserMiddleware = require("../middlewares/authUserMiddleware");

// comment 객체의 형식 가져오기
const { Users, Likes, Comments, Posts } = require("../models");

//댓글 생성
router.post("/:postId", authUserMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const { user } = res.locals;

        const post = await Posts.findAll({
            where: {
                [Op.or]: [{ postId: postId }]
            }
        });
        if (post === null) {
            return res.status(400).json({ errorMessage: '게시글 조회에 실패했습니다.' });
        }
        await Comments.create({ userId: user.userId, postId: postId, content: comment });
        return res.status(201).json({ message: "댓글을 작성하였습니다." });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." })
    }
});

//댓글 목록 조회
router.get("/:postId", authUserMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const data = await Comments.findAll({
            where: { postId },
            include: [{ model: Users, attributes: ["nickname"] }],
            order: [["createdAt", "DESC"]],
        });
        let comments = [];
        if (data.length) {
            data.forEach((e) => {
                comments.push({
                    commentId: e.commentId,
                    nickname: e.User.nickname,
                    content: e.content,
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt,
                });
            });
        }
        return res.status(200).json({ data: comments });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: "댓글 조회에 실패하였습니다." });
    }
});

//댓글 수정
router.put('/:commentId', authUserMiddleware, async (req, res) => {

    try {
        const { commentId } = req.params
        const { user } = res.locals;
        const { comment } = req.body;
        if (comment === undefined || comment.length === 0) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
        }

        const comments = await Comments.findOne({
            where: {
                [Op.or]: [{ commentId }]
            }
        })

        if (comments === null) {
            return res.status(404).json({ message: '존재하지않는 댓글입니다.' })
        }

        if (user.userId !== comments.userId) {
            return res.status(412).json({ errorMessage: "권한이 없습니다." })
        }


        await Comments.update({ content: comment }, { where: { commentId } });

        res.json({ message: "댓글을 수정하였습니다." })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error })
    }

})

//댓글 삭제
router.delete("/:commentId", authUserMiddleware, async (req, res) => {
    try {
        const { user } = res.locals;
        const { commentId } = req.params;
        const data = await Comments.findOne({
            where: { commentId },
        });
        if (data === null) {
            return res.status(400).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        if (user.userId !== data.userId) {
            return res.status(412).json({ errorMessage: '권한이 없습니다.' });
        }
        await Comments.destroy({
            where: { commentId },
        });
        res.status(200).json({ message: '댓글이 삭제되었습니다.' });
    } catch (err) {
        console.log(err);
        if (err.status) {
            res.status(err.status).send({ message: err.message });
            return;
        } else
            return res.status(400).send({ message: "댓글 삭제에 실패하였습니다." });
    }
});

module.exports = router;