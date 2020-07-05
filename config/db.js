if(process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://blogapp:rZrOiqbRJNN2cTuu@cluster0.zopr1.mongodb.net/blogapp?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}