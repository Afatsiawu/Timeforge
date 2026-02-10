const express = require('express');
const app = express();
const PORT = 5001;

app.get('/', (req, res) => res.send('Hello'));

console.log('Starting server...');
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
