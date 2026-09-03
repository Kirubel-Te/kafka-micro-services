import express from 'express'
import cors from 'cors'
import { Request, Response, NextFunction } from 'express'

const app = express()
app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(express.json())
app.get("/health",(req,res)=>{
    return res.status(200).send({message:"Payment service is healthy"})
})

app.post("/payment-service", async(req,res) => {
    const {cart} = req.body
    const userId = "123"
    console.log("API gateway hit")
    return res.status(200).send({message:"Payment successful", userId})
})

app.use((err:any,req:Request,res:Response,next:NextFunction) => {
    res.status(err.status || 500).send(err.message || "Internal Server Error")
})

app.listen(8003,() => {
    console.log("Payment service is running on port 8000")
})