const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
  
    next();
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    //read tagname from params
    const { tagName } = req.params
    try {
        //getting posts by tag name from db
        const allPosts= await getPostsByTagName(tagName);

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

module.exports = tagsRouter;