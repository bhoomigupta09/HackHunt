const { Router } = require("express");

const adminRouter = Router();

adminRouter.post("/add-hackathon", function(req,res){
    res.json({
        message:"add hackathon endpoint"
    })
})

adminRouter.get("/get-hackathons", function(req,res){
    res.json({
        message:"get hackathons endpoint"
    })
})

adminRouter.get("/get-hackathon/:id", function(req,res){
    res.json({
        message:"get hackathon endpoint"
    })
})
adminRouter.post("/signup", function(req,res){
    res.json({
        message:"signup endpoint"
    })
})

adminRouter.post("/signin", function(req,res){
    res.json({
        message:"signin endpoint"
    })
})

module.exports = {
    adminRouter: adminRouter
}