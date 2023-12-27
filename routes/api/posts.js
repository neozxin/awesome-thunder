const xDBModels = require("../../models/index");
const xServerUtils = require("../../config/xExpressUtil");

const {
  expressValidator: { check },
  middlewareAuth,
} = xServerUtils.xModules;

module.exports = xServerUtils
  .createRouter()
  // API: add post
  .post(
    "/",
    [
      middlewareAuth,
      check("text", "Text is required").notEmpty(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      try {
        const user = await xDBModels.User.findById(req.user.id).select(
          "-password",
        );
        const newPost = new xDBModels.Post({
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id,
        });
        const post = await newPost.save();
        res.json(post);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  )
  // API: get all posts
  .get("/", middlewareAuth, async (req, res) => {
    try {
      const posts = await xDBModels.Post.find().sort({ date: -1 });
      res.json(posts);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: get post by id
  .get("/:id", middlewareAuth, async (req, res) => {
    try {
      const post = await xDBModels.Post.findById(req.params.id);
      if (!post) {
        throw { kind: "ObjectId" };
      }
      res.json(post);
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      xServerUtils.responseError(res, err);
    }
  })
  // API: delete post
  .delete("/:id", middlewareAuth, async (req, res) => {
    try {
      const post = await xDBModels.Post.findById(req.params.id);
      if (!post) {
        throw { kind: "ObjectId" };
      }
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }
      await post.deleteOne();
      res.json({ msg: "Post removed" });
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      xServerUtils.responseError(res, err);
    }
  })
  // API: like post
  .put("/like/:id", middlewareAuth, async (req, res) => {
    try {
      const post = await xDBModels.Post.findById(req.params.id);
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id).length
      ) {
        return res.status(404).json({ msg: "Post already liked" });
      }
      post.likes.unshift({ user: req.user.id });
      await post.save();
      res.json(post.likes);
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      xServerUtils.responseError(res, err);
    }
  })
  // API: unlike post
  .put("/unlike/:id", middlewareAuth, async (req, res) => {
    try {
      const post = await xDBModels.Post.findById(req.params.id);
      if (
        !post.likes.filter((like) => like.user.toString() === req.user.id)
          .length
      ) {
        return res.status(404).json({ msg: "Post has not yet been liked" });
      }
      const removeIndex = post.likes
        .map((like) => like.user.toString())
        .indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);
      await post.save();
      res.json(post.likes);
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      xServerUtils.responseError(res, err);
    }
  })
  // API: add post comment
  .post(
    "/comment/:id",
    [
      middlewareAuth,
      check("text", "Text is required").notEmpty(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      try {
        const user = await xDBModels.User.findById(req.user.id).select(
          "-password",
        );
        const post = await xDBModels.Post.findById(req.params.id);
        const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id,
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  )
  // API: delete post comment
  .delete("/comment/:id/:comment_id", middlewareAuth, async (req, res) => {
    try {
      const post = await xDBModels.Post.findById(req.params.id);
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id,
      );
      if (!comment) {
        return res.status(404).json({ msg: "Comment does not exist" });
      }
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }
      post.comments.splice(post.comments.indexOf(comment), 1);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  });
