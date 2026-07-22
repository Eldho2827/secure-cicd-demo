const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello from cicd-demo-app!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(3000, () => console.log('Listening on 3000'));