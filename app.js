// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const app = express();
const admin = require("./routes/admin");
const usuario = require("./routes/usuario");
const db = require("./config/db");
// Configurações
    // Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    // Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        next();
    });
    // Body Parser
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    // Handlebars
    app.engine("handlebars", handlebars({ defaultLayout: "main" }));
    app.set("view engine", "handlebars");
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((conn) => {
        console.log("Conexão realizada com sucesso!");
    }).catch((erro) => {
        console.log("Erro ao se conectar: " + erro);
    });
    // Public
    app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: JSON.parse(JSON.stringify(postagens))});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem) {
            res.render("postagem/index", {postagem: JSON.parse(JSON.stringify(postagem))});
        } else {
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/");
        }
    }).catch((erro) => {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", {categorias: JSON.parse(JSON.stringify(categorias))});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne().then((categoria) => {
        if(categoria) {
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens", {postagens: JSON.parse(JSON.stringify(postagens)), categoria: JSON.parse(JSON.stringify(categoria))});
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao listar os posts!");
                res.redirect("/");
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe");
            res.redirect("/");
        }
    }).catch((erro) => {
        console.log(erro)
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
        res.redirect("/");
    })
})

app.get("/404", (req, res) => {
    res.send("Erro 404!");
})

app.get("/posts", (req, res) => {
    res.send("Lista de Posts");
})

app.use("/admin", admin);
app.use("/usuario", usuario);

// Outros
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Servidor rodando!");
})