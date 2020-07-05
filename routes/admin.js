const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { json } = require("body-parser");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const {eAdmin} = require("../helpers/eAdmin");

router.get("/", (req, res) => {
    res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
    res.send("Página de posts");
});

router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        //console.log(categorias);
        res.render("admin/categorias", {categorias: categorias});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {

    var erros = [];

    // Validação de dados
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido!" });
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" });
    }

    if(req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno!" });
    }

    if(erros.length > 0) {
        res.render("admin/addcategorias", {erros: erros});
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then((conn) => {
            console.log("Categoria salva com sucesso! " + conn);
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((erro) => {
            console.log("Erro ao salvar categoria! " + erro);
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");
            res.redirect("/admin");
        });
    }

});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        //res.render("admin/editcategorias", {categoria: JSON.parse(JSON.stringify(categoria))})
        res.render("admin/editcategorias", {categoria: categoria.toJSON()})
    }).catch((erro) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a editação da categoria!");
            res.redirect("/admin/categorias");
        });

    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria!");
        res.redirect("/admin/categorias");
    });
});

router.get("/postagens", eAdmin, (req, res) => {

    Postagem.find().populate("categorias").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: JSON.parse(JSON.stringify(postagens))});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", {categorias: JSON.parse(JSON.stringify(categorias))});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin");
    });
});

router.post("/postagens/nova", eAdmin, (req, res) => {

    var erros = [];

    if(req.body.categoria == "0") {
        erros.push({text: "Categoria inválida, registre uma categoria"});
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros});
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem!");
            res.redirect("/admin/postagens");
        });
    }
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", {categorias: JSON.parse(JSON.stringify(categorias)), postagem: JSON.parse(JSON.stringify(postagem))});
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao listar as cotegorias");
            res.redirect("/admin/postagens");
        });

    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
    })
});

router.post("/postagem/edit", eAdmin, (req,res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((erro) => {
            req.flash("error_msg", "Erro interno");
            res.redirect("/admin/postagens");
        })

    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        res.redirect("/admin/postagens");
    });
});

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/admin/postagens");
    })
})

module.exports = router;