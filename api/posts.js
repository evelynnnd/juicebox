const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

  
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;
    const post = await createPost(postData);

    if (post) {
      res.send({ post });
    } else {
      next({
      name: 'PostRouterError',
      message: 'The post route is incorrect'
      })
    }

  } catch ({ name, message}) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatePost });
        } else {
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            })
        }
    } catch ({ name, message }){
        next({ name, message })
    }
});

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
  
    next();
});

postsRouter.get('/', async (req, res) => {
    try{
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
            //if post is active, keep
            if (post.active) {
                return true;
            }
            //if post is not active but it belongs to a current user, keep
            if (req.user && post.author.id === req.user.id) {
                return true;
            }
            //none are true
            return false;
        })

        res.send({ posts });
    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = postsRouter;