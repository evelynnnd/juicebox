//make sure to import ALL exports from index.js
const {
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    createTags,
    addTagsToPost,
    getPostsByTagName
} = require('./index');

//create a function which will drop all tables from the database.
const dropTables = async () => {
    try {
        console.log("Starting to drop tables...");

        // have to make sure to drop in correct order
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

//create a function which will create all tables from the database.
//create in order.
const createTables = async () => {
    try {
        console.log("Starting to build tables...");

        await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          location varchar(255) NOT NULL,
          active boolean DEFAULT true
        );

        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );

        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
          )
      `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}

//creating and storing the basic info for users.
const createInitialUsers = async () => {
    try {
        console.log("Starting to create users...");

        await createUser({
            username: 'albert',
            password: 'bertie99',
            name: 'bert',
            location: 'new york'
        });

        await createUser({
            username: 'sandra',
            password: '2sandra4me',
            name: 'sandy',
            location: 'chicago'
        });

        await createUser({
            username: 'glamgal',
            password: 'soglam',
            name: 'gerry',
            location: 'miami'
        });

        console.log("Finished creating!");
    } catch (error) {
        console.error("Error creating!");
        throw error;
    }
}

const createInitialPosts = async () => {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log("Starting to create posts...")
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post.",
            tags: ["#happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "Is this working?",
            content: "I don't know how to work technology.",
            tags: ["#happy", "#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Welcome back to my blog!",
            content: "Today's topic is summer makeup.",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });

        console.log("Finished creating posts.")
    } catch (error) {
        console.log("Error creating posts.")
        throw error;
    }
}

const createInitialTags = async () => {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  }

const rebuildDB = async () => {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        await createInitialTags();
    } catch (error) {
        console.log("Error during rebuildDB")
        throw error;
    }
}

const testDB = async () => {
    try {
        console.log("Starting to test database...");

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("Result:", users);

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        console.log("Calling updatePost on posts[1], only updating tags!");
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        console.log("Finished database tests!");
    } catch (error) {
        console.log("Error during testDB");
        throw error;
    }
}


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());