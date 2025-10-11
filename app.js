const express = require("express");
const app = express();
const mongoose = require("mongoose");
main()
    .then(()=>{
        console.log("connected to DB");
    }).catch((err)=>{
        console.log(err);
    });
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
app.get("/",(req,res)=>{
    res.send("Hi! I'm root");
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});