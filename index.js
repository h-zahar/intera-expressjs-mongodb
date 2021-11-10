const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (res, req) => {
    res.send('Server Running Happily...');
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});