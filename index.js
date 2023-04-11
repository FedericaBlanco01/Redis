const express = require('express');
const redis = require('redis');
const fs = require('fs');

const app = express()

app.use(express.json());

const client = redis.createClient();
client.connect();

client.on('connect', function() {
    console.log('Connected to Redis');
});
  
client.on('error', function(err) {
    console.error('Redis error:', err);
});

app.get('/redis/:key', async(req, res) =>{
    const { key } = req.params;
    await client.set("key", "value"); // to start with, save on key/value pair on Redis
    try {
        const value = await client.get(key);
        if(value == null){ // if the key is not on Redis, get it from the data.json file 
            const jsonString = fs.readFileSync("./data.json");
            const dataBase = JSON.parse(jsonString);
            await client.set(key, dataBase[key]); // save it on redis for the next get requested on that key
            res.send({data:dataBase[key]});
        }else{
            res.send({data:value});
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.listen(3000);
