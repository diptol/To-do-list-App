const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app= express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://admin-dipo:Ola@888880@cluster0.2qzao.mongodb.net/todolist', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name:"welcome to your todolist"
});


const item2 = new Item ({
  name:"Hit the + button to add an item"
});

const item3 = new Item ({
  name:"<-- Hit to delete an item"
});

const defaultItem = [ item1, item2, item3]

const listSchema = {
  name : String,
  items: [itemsSchema]
}
const List = mongoose.model ("List", listSchema);


app.get("/", function(req, res){

let day = date.getDate();

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItem, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Items successfully added");
        }
      });
      res.redirect("/");
    } else {
    res.render("list", {listTitle:"Today", newListItems:foundItems});
  };
});

});



app.get("/:id", function(req, res){

  const parameter =_.capitalize(req.params.id);

List.findOne({name: parameter}, function(err, foundList){
  if(!err){
    if (!foundList){
      const list = new List ({
              name: parameter,
              items:defaultItem });

              list.save();
              res.redirect("/"+ parameter);
    } else {
      res.render("list",{listTitle:parameter, newListItems:foundList.items});
    }
  }
});

});




app.post("/", function(req, res){
  let newItem = req.body.newItem;
  const listName = req.body.list;
  let day = date.getDate();
  const item = new Item({
    name: newItem
  });

  if (listName === "Today"){

    item.save();
    res.redirect("/");

  } else {

    List.findOne({name : listName}, function(err, foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    });
  }


});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("successfully deleted");
      }
    });
    res.redirect("/");

  } else {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }



});

app.get("/about", function(req,res){
  res.render("about",)
})

let port = process.env.PORT;
if(port == null || port== ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("server is working on port 3000");
});
