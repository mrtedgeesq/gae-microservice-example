"use strict"; 
const express = require('express'); 
const app = express(); 
app.get('/', (req, res) => {    
    res.status(200).send('Hello from node-demo service!');
});
app.listen(8080); //can use process.env.PORT to get the default port on GAE, but this won't work locally