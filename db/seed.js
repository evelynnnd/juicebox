const { 
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getPostsByUser
 } = require('./index');

 const dropTables = async () => {
    try {
        console.log("Starting to drop tables...");
        await client.query(`
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.log("Error dropping tables!");
        throw error;
    }
}

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
                active BOOLEAN DEFAULT true
            );

            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title varchar(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true,
            )
        `);
        
        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!")
        throw error;
    }
}

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

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post."
        });

        await createPost({
            authorId: sandra.id,
            title: "Is this working?",
            content: "I don't know how to work technology."
        });

        await createPost({
            authorId: glamgal.id,
            title: "Welcome back to my blog!",
            content: "Today's topic is summer makeup."
        });
        console.log("Finished creating posts.")
    } catch (error) {
        console.log("Error creating posts.")
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
    } catch (error) {
        throw error;
        //console.error(error);
    } 
}

const testDB = async () => {
    try {
    // connecting the clients to database
    //console.log(client);
    //client.connect();
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
    const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
    });
    console.log("Result", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result", albert);

    console.log("Finished database tests!")
    } catch (error) {
        console.error("Error testing!");
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());