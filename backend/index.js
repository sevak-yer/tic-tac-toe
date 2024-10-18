const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('hello client !!!');
});

app.post('/user', (req, res) => {
    res.send(req.body);
    module.exports = req.body;
})

app.listen(3001, () => {
    console.log('server is up on port 3001.')
});

