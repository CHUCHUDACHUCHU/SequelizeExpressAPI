const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();
const { Op } = require("sequelize");
const { Posts, Likes, Users, Comments } = require("../models")

//전체 게시물 조회
router.get("/", async (req, res) => {
    try {
        // 모든 post를 불러옴
        const data = await Posts.findAll({
            include: [
                { model: Users, attributes: ['nickname'] },
                { model: Likes, as: 'Likes', attributes: ['likeId'] },
            ],
            // 내림차순 정렬
            order: [["createdAt", "DESC"]],
        });
        let posts = [];
        data.forEach((v) => {
            posts.push({
                postId: v.postId,
                userId: v.userId,
                nickname: v.User.nickname,
                title: v.title,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
                likes: v.Likes.length,
            });
        });
        res.status(200).json({ data: posts });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});


//게시물 상세조회
router.get("/:postId", async (req, res, next) => {
    try {
        const { postId } = req.params;
        if (postId === "like") return next();
        const data = await Posts.findOne({
            where: { postId },
            include: [
                { model: Users, attributes: ["nickname"] },
                { model: Likes, as: "Likes", attributes: ["likeId"] },
                {
                    model: Comments,
                    as: "Comments",
                    order: [["createdAt", "DESC"]],
                    attributes: ["commentId", "content", "createdAt", "updatedAt"],
                    include: [{ model: Users, attributes: ["nickname"] }],
                },
            ],
        });
        if (data === null) {
            return res.status(400).json({ errorMessage: '게시글 조회에 실패했습니다.' });
        }
        let comments = [];
        if (data.Comments.length) {
            data.Comments.forEach((e) => {
                comments.push({
                    commentId: e.commentId,
                    nickname: e.User.nickname,
                    content: e.content,
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt,
                });
            });
        }
        // 게시글 상세조회 + 댓글 목록을 res로 쏴주기
        return res.status(200).json({
            data: {
                postId: data.postId,
                userId: data.userId,
                nickname: data.User.nickname,
                title: data.title,
                content: data.content,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                likes: data.Likes.length,
                comments,
            },
        });
    } catch (err) {
        console.log(err);
        return res
            .status(400)
            .send({ message: "데이터 형식이 올바르지 않습니다." });
    }
});


//게시물 작성 
router.post('/', authMiddleware, async (req, res) => {
    try {

        if (req.body.title === undefined || req.body.content === undefined || req.body.title.length === 0 || req.body.content.length === 0) {
            return res.status(412).json({ errorMessage: "데이터의 형식이 올바르지 않습니다.." })
        }

        await Posts.create({ title: req.body.title, content: req.body.content, userId: res.locals.user.userId, nickname: res.locals.user.nickname })
        res.status(201).json({ message: "게시글이 생성되었습니다." })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." })
    }
})


//게시물 수정 

router.put('/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { user } = res.locals;
        const { title, content } = req.body;
        if (content === undefined && title === undefined) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
        }
        const post = await Posts.findOne({
            where: { postId, userId: user.userId },
        });

        if (post === null) {
            return res.status(404).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
        }
        if (post.title === title && post.content === content) {
            return res.status(400).json({ message: "변경사항이 없습니다." })
        }

        await Posts.update({ title, content }, { where: { postId: postId } });
        res.status(200).json({ message: "게시물을 수정하였습니다." })
    } catch (error) {
        console.log(error)
        res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." })
    }
})

//게시물 삭제

router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
        const { user } = res.locals;
        const { postId } = req.params;
        const post = await Posts.findOne({
            where: {
                [Op.or]: [{ postId: user.userId }]
            }
        })

        if (post === null) {
            return res.status(404).json({ message: '게시글이 존재하지않습니다.' })
        }

        if ([post].length > 0) {
            await Posts.destroy({
                where: { postId }
            })
        }
        res.json({ message: "게시물을 삭제하였습니다." })
    } catch (error) {
        console.log(error)
        res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." })
    }
})

router.put('/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { user } = res.locals;
        const { postId } = req.params;
        const post = await Posts.findOne({
            where: {
                [Op.or]: [{ postId: postId }]
            },
        });
        console.log(post);
        if (post === null) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        const likes = await Likes.findAll({
            where: {
                [Op.and]: [{ postId }, { userId: user.userId }],
            },
        });
        console.log(likes);
        if (likes.length > 0) {
            await Likes.destroy({
                where: {
                    [Op.and]: [{ postId }, { userId: user.userId }]
                }
            });
            return res.status(201).json({ message: '좋아요가 취소되었습니다.' });
        }

        await Likes.create({ postId, userId: user.userId });
        res.status(201).json({ message: "좋아요가 등록되었습니다." })
    } catch (error) {
        res.status(400).json({ errorMessage: error.message });
    }
})

router.get('/like', authMiddleware, async (req, res) => {
    try {
        const { user } = res.locals;
        const data = await Likes.findAll({
            where: { userId: user.userId },
            include: [
                {
                    model: Posts,
                    attributes: { exclude: ["content", "postId"] },
                    include: [
                        { model: Likes, as: "Likes", attributes: ["likeId"] },
                        { model: Users, attributes: ["nickname"] },
                    ],
                },
            ],
        });
        let posts = [];
        data.forEach((e) => {
            posts.push({
                postId: e.postId,
                userId: e.userId,
                nickname: e.Post.User.nickname,
                title: e.Post.title,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
                likes: e.Post.Likes.length,
            });
        });
        posts.sort((a, b) => b.likes - a.likes);

        return res.status(200).json({ data: posts });
        console.log(data);
        res.send({});
    } catch (error) {
        return res.status(400).send({ errorMessage: error.message });
    }
})

module.exports = router;