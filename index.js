// import use pannikalam so use module

import express from "express";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//direct hit kudukka koodathu express ku so app nu oru variable vachu indirect ah invoke Panrom


const app=express();
const url ="mongodb+srv://Razlina:PH5gE2NyQBKTDufO@database.1kcophp.mongodb.net/?retryWrites=true&w=majority&appName=database";
const client=new MongoClient(url);

//promise irukum

await client.connect
console.log("Mongodb connected successfully");

//oru oru times express.json kudukka vendiyathillai
//middleware

app.use(express.json());
app.use(cors());
const auth=(request,response,next)=>{
    try{
        const token = request.header('backend-token');
        jwt.verify(token,"Razlina");
        next();

    }
    catch(error){
        response.status(401).send({message:error.message});
}}
  

//Get Method
app.get("/",function(request,response){
    response.status(200).send("Hello World! by Razlina");
});


//Get Post Method,express.json middleware
app.post("/post",async function(request,response){
    const getPostman=request.body;

    //name-crud data values insertone-oru data

    const sendMethod=await client.db("CRUD").collection("data").insertOne(getPostman);
    response.status(201).send(sendMethod);
    // console.log(getPostman);
});


app.post("/postmany",async function(request,response)
{
const getmany=request.body;
const sendMethod= await client.db("CRUD").collection("data").insertMany(getmany);
    response.status(201).send(sendMethod);
});

//find - total get aagum

app.get("/get",auth, async function(request,response)
{
    const getMethod=await client.db("CRUD").collection("data").find({}).toArray();
    response.status(200).send(getMethod);
});

//single data
app.get("/getone/:id",async function(request,response){
    const {id}=request.params;
    // console.log(id);
    const getMethod=await client.db("CRUD").collection("data").findOne({_id:new ObjectId(id)});
    response.status(200).send(getMethod);
});

//update1,update10,Dont use replace as a developer
app.put("/update/:id",async function(request,response){
    const {id}=request.params;
    const getPostman=request.body;
    const updateMethod=await client.db("CRUD").collection("data").updateOne({_id:new ObjectId(id)},{ $set : getPostman });
    response.status(201).send(updateMethod);
})

//delete
app.delete("/delete/:id",async function(request,response)
{
const deleteMethod=await client.db("CRUD").collection("data").deleteOne({_id: new ObjectId(request.params.id)});
    response.status(200).send(deleteMethod);
});

app.post("/register", async function (request, response) {
    const { username, email, password } = request.body;
    const userfind = await client.db("CRUD").collection("private").findOne({ email: email });
    if (userfind) {
        response.status(400).send("User already exist");
    }
    else {
        const salt = await bcrypt.genSalt(10);// gensalt make our password as string for 10 times
        const hashedPassword = await bcrypt.hash(password, salt);
        //console.log(hashedPassword);
        const registerMethod = await client.db("CRUD").collection("private").insertOne({ username: username, email: email, password: hashedPassword });
        response.status(201).send(registerMethod); // success(ok) send means use 200 , 201 - creation , 400 - bad req
    }
});

app.post("/login", async function (request, response) {
    const { email, password } = request.body;
    const userfind = await client.db("CRUD").collection("private").findOne({ email: email });
    //console.log(userfind);
    if (userfind) {
        const mongodbpassword = userfind.password;
        const passwordCheck = await bcrypt.compare(password, mongodbpassword);
        //console.log(passwordCheck);
        if (passwordCheck) {
            const token = jwt.sign({ id: userfind._id }, "Razlina"); // key is secret key
            response.status(200).send({ token: token });
        }
        else {
            response.status(400).send({message:"Invalid password"});
        }
    }
    else {
        response.status(400).send({message:"Invalid email"});
    }
});









app.listen(4000,()=>{
    console.log("Server is running on port " + 4000);
})
