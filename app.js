//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // admin-nicole IddFbE6YyeEdNLE1
const _ = require("lodash");
// const date = require(__dirname + "/date.js"); // when we require a module, it will run the code of the module
// console.log(date); //will be equal to whatever that was exported out of the module: "Hello Date Module"

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // the folder public is the location of our static files
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://admin-nicole:IddFbE6YyeEdNLE1@cluster0.y2ksrpz.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true}); //connect to existing db or creat a new db
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema); //collection name(which will be autimatically converted to plural), schema name

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    // only items added to default list will be in the "items" collection
    Item.find({}, function(err, foundItems){
        
        res.render("list", {listTitle: "Today", newListItems: foundItems});
        
    });
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
  
    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if (!foundList){
          //Create a new list
          const list = new List({
            name: customListName,
            items: []
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
  
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
  
  
  
  });
  
  app.post("/", function(req, res){
  
    const itemName = req.body.newItem;
    const listName = req.body.list;
  
    const item = new Item({
      name: itemName
    });
  
    if (listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  });
  
  app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
  
  });
  
  app.get("/about", function(req, res){
    res.render("about");
  });
  
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
