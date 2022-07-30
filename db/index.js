// importing the pg module
const { Client } = require('pg');

// providing location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

const createUser = async ({ username, password, name, location }) => {
    try {
        const { rows: [user] } = await client.query(`
            INSERT INTO users(username, password, name, location) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password, name, location]);

        return user;
    } catch (error) {
        throw error;
    }
}

const createPost = async (authorId, title, content) => {
    try {
        const { rows: [post] } = await client.query(`
        INSERT INTO posts("authorId", title, content) 
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [authorId, title, content]);

        return post;
    } catch (error) {
        throw error;
    }
}

const updateUser = async (id, fields = {}) => {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [user] } = await client.query(`
            UPDATE users
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return user;
    } catch (error) {
        throw error;
    }
}

const updatePost = async (authorId, fields = {}) => {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [post] } = await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id=${authorId}
            RETURNING *;
        `, Object.values(fields));

        return post;
    } catch (error) {
        throw error;
    }
}

const getAllUsers = async () => {
    const { rows } = await client.query(`
        SELECT id, username, name, location, active
        FROM users;
        `);

    return rows;
}

const getAllPosts = async () => {
    const { rows } = await client.query(`
        SELECT id 
        FROM posts;
        `);

    return rows;
}

const getUserById = async (userId) => {
    try {
        const { rows: [ user ] } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${ userId }
        `);

        if (!user) {
            return null
        }

        user.posts = await getPostsByUser(userId);
        return user;
    } catch (error) {
        throw error;
    }
}

const getPostsByUser = async (userId) => {
    try {
        const { rows } = await client.query(`
            SELECT * FROM posts
            WHERE "authorId"=${ userId };
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getPostsByUser,
    getAllPosts
}