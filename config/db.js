if(process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongoproduction"}
} else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}