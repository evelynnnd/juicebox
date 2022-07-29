const { 
    client,
    getAllUsers,
    createUser,
 } = require('./index');

 const dropTables = async () => {
    try {
        console.log("Starting to drop tables...");
        await client.query(`
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
                password varchar(255) NOT NULL
            );
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
        const albert = await createUser({ username: 'albert', password: 'bertie99'});
        const sandra = await createUser({ username: 'sandra', password: '2sandra4me'});
        const glamgal = await createUser({ username: 'glamgal', password: 'soglam'});
        
        console.log(albert);
        console.log(sandra);
        console.log(glamgal);
        console.log("Finished creating!");
    } catch (error) {
        console.error("Error creating!");
        throw error;
    }
}

const rebuildDB = async () => {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
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
    
    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing!");
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());