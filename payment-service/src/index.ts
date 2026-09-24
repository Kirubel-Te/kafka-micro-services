import express from 'express'
import cors from 'cors'
import { Request, Response, NextFunction } from 'express'
import { Kafka } from "kafkajs";



const app = express()
app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(express.json())
app.get("/health",(req,res)=>{
    return res.status(200).send({message:"Payment service is healthy"})
})

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9094", "localhost:9095", "localhost:9096"],
});

const producer = kafka.producer()

const connectTokafka = async() => {
    try{
        producer.connect()
        console.log("Producer Connected")
    }catch(err){
        console.log("Error connecting to kafka",err)
    }
}

app.post("/payment-service", async(req,res) => {
    const {cart} = req.body
    const userId = "123"
    console.log("API gateway hit")
    await producer.send({
        topic:"payment-successful",
        messages:[{value:JSON.stringify({userId,cart})}]
    })
    return res.status(200).send({message:"Payment successful", userId})
})

app.use((err:any,req:Request,res:Response,next:NextFunction) => {
    res.status(err.status || 500).send(err.message || "Internal Server Error")
})

app.listen(8003,() => {
    connectTokafka()
    console.log("Payment service is running on port 8000")
})