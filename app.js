//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/my_modules/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//mongoose.connect("mongodb+srv://swasthik:swasthik2001@todolist.h7w72.gcp.mongodb.net/TODO_LIST", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
mongoose.connect("mongodb://127.0.0.1:27017/TODO_LIST",{useNewUrlParser:true,useUnifiedTopology:true});
const itemsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        }
    },
    { timestamps: true });
const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [itemsSchema]
}, {
    timestamps: true
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const I1 = new Item({
    name: "Default Item"
});
const arr = [I1];
const day = date.getDay();

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/gettingStarted", (req, res) => {
    res.render("gettingStarted");
});

app.get("/lists", (req, res) => {
    var collection = [];
    List.find({}, (err, found) => {
        if (err) {
            console.log(err);
        }
        else {
            if (!found) {
                console.log("no lists created");
            }
            else {
                found.forEach((item) => {
                    collection.push(item.name);
                });
            }
        }
        res.render("list", { listDate: day, collections: collection });
    });
});

app.post("/lists", (req, res) => {
    var listName;
    if (req.body.submit === "pressed")
        listName = req.body.newListName;
    else
        listName = req.body.btn;
    res.redirect("/lists/" + listName);
});

app.get("/aboutus", (req, res) => {
    res.render("aboutus");
});

app.get("/contactus", (req, res) => {
    res.render("contactus");
});

app.get("/lists/:listName", (req, res) => {
    const listName = _.capitalize(req.params.listName);
    List.findOne({ name: listName }, (err, found) => {
        if (err) {
            console.log(err);
        }
        else {
            if (!found) {
                const list = new List({
                    name: listName,
                    items: arr
                });
                list.save();
                res.redirect("/lists/" + listName);
            }
            else {
                res.render("listDetail", { listTitle: listName, listDate: day, newListItems: found.items });
            }
        }
    });
});


app.post("/lists/:listName", (req, res) => {
    const itemName = req.body.newItem;
    const listName = _.capitalize(req.params.listName);
    const item = new Item({
        name: itemName
    });
    List.findOne({ name: listName }, (err, found) => {
        if (err) { console.log(err); }
        else {
            if (found) {
                found.items.push(item);
                found.save();
            }
            else {
                console.log("no such list found");
            }
        }
        res.redirect("/lists/" + listName);
    });
});


app.post("/lists/:listName/deleteItem", (req, res) => {
    var id = req.body.id;
    var listName = _.capitalize(req.params.listName);
    List.findOneAndUpdate({ name: listName },
        { $pull: { items: { _id: id } } }, (err, found) => {
            if (err) { console.log(err); }
            else
                res.redirect("/lists/" + listName);
        });
});

app.post("/lists/:listName/deleteList", (req, res) => {
    var listName = _.capitalize(req.params.listName);
    List.findOneAndDelete({ name: listName }, (err, resp) => {
        if (err) { console.log(err); }
        else {
            console.log("deleted");
        }
    });
    res.redirect("/lists");
});

app.get("/user", (reEq, res) => {
    res.render("user");
});


app.post("/user", (req, res) => {
    if (req.body.type === "login")
        res.redirect("/login");
    else
        res.redirect("/signup");
});

var PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 3000;
}
app.listen(PORT, () => {
    console.log("Server started");
});