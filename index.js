const express = require('express');
const {Pool} = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
pool.connect()
    .then(client => client.query('CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, text TEXT)'))
    .catch(err => console.error("Couldn't create todos table.", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/todos', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM todos');
        console.info("A todos have been queried.");
        res.send(result.rows);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.post('/todos', async (req, res) => {
    const text = req.body.text;
    console.log(text);
    try {
        const client = await pool.connect();
        const queryText = 'INSERT INTO todos(text) VALUES($1) RETURNING *';
        const savedTodo = await client.query(queryText, [text]);
        console.info("A todo has been saved.");
        res.send(savedTodo.rows[0]);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.post('/clear', async (req, res) => {
    try {
        const client = await pool.connect();
        await client.query('DELETE FROM todos');
        console.info("Todos have been deleted.");
        res.send("Todos have been deleted");
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.listen(PORT, () => console.info(`Rest API Listening on ${PORT}`));




