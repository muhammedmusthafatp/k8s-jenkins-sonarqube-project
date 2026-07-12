const express = require('express');

const app = express();

const PORT = 3000;

app.disable("x-powered-by")

app.get('/', (req,res)=>{

res.send("<h1>CI/CD Pipeline Successfully Running!</h1>");

});

app.listen(PORT,()=>{

console.log(`Server running on ${PORT}`);

});
