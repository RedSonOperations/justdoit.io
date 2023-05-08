const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const lodash=require('lodash');
let alert=require('alert');
const date=require(__dirname+"/date.js");
require('dotenv').config({ path: '/Users/aleckain/toDoList-v1/.env'})

const app=express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

let nameItRandom=["Groceries", "Fiesta invitations", "Christmas card recipients", "Cute baby names", "Recipe ingredients", "Goals I want to achieve this year"];
let randomNum=Math.floor(Math.random()*nameItRandom.length);
let randomTitle=nameItRandom[randomNum];

mongoose.connect(`mongodb+srv://${process.env.mongoUser}:${process.env.mongoPass}@cluster0.lhhytm3.mongodb.net/toDoListDB?retryWrites=true&w=majority`, {useNewURLParser: true});
const itemsSchema=new mongoose.Schema({
    name: String
})
const Item=new mongoose.model("Item", itemsSchema);

const item1=new Item({
    name: "Welcome to your to-do list!"
})
const item2=new Item({
    name: "To add items, press the '+' button or type an item you want to add and press 'Enter' on your keyboard."
})
const item3=new Item({
    name: "<-- Click this checkbox to delete an item."
})
const item4=new Item({
    name: "Welcome to your new list!"
})

const defaultItems=[item1, item2, item3];
const newItems=[item4];

const listSchema=mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List=new mongoose.model("List", listSchema);



app.get("/", function(req, res){
    const day=date.getDate();
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Items successfully added: "+defaultItems);
            })
            res.redirect("/");
        }
        else{
            List.find({}).then(function(lists){
                res.render("list", {listTitle: "Today", newListItem: foundItems, allLists: lists});
            })
            
        }
        
    });
    
})

app.get("/about", function(req, res){
    res.render("about");
})

app.get("/create", function(req, res){
    const listTitle=req.body.newList;
    res.render("create", {listTitle: listTitle, randomTitleEJS: randomTitle});
})

app.get("/:listType", function(req, res){
    const listType=lodash.capitalize(req.params.listType);

    List.findOne({name: listType}).then(function(foundList){
        if(!foundList){
            const list=new List({
                name: listType,
                items: newItems
            })
            list.save();
            res.redirect("/"+listType);
        }
        else{
            List.find({}).then(function(allLists){
                res.render("list", {listTitle: foundList.name, newListItem: foundList.items, allLists: allLists});  
            })
                    
        }
    })
    
    
});



app.post("/", function(req, res){
    const itemName=req.body.nextItem;
    const listName=req.body.list;

    const newItem=new Item({
        name: itemName
    })

    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(newItem);
            foundList.save();
            console.log("saved new item to: "+listName);
            res.redirect("/"+listName);
        })
    }
    

})

app.post("/create", function(req, res){
    const listType=lodash.capitalize(req.body.newList);
    List.findOne({name: listType}).then(function(foundList){
        if(!foundList){
            
            const list=new List({
                name: listType,
                items: newItems
            })
        
            list.save();
            alert("Successfully created new list, '"+listType+"'! You are being taken to it now.");
            const timeoutId = setTimeout(function() {
                res.redirect("/"+listType);
              }, 1000);
            
        }
        else {
            alert("You are being redirected to your existing list, '" + listType + "':");

              List.find({}).then(function(allLists) {
                setTimeout(function() {
                res.render("list", { listTitle: foundList.name, newListItem: foundList.items, allLists: allLists });
              }, 1000);
            });
          }
    }); // add this closing brace
});

app.post("/find", function(req, res){
    const find = lodash.capitalize(req.body.find);
    List.findOne({name: find}).then(function(foundList){
        if (!foundList) {
            alert("List, '" + find + "', does not exist yet. Click the 'Create' tab to create a new list!");
        } else {
            alert("You are being redirected to your existing list, '" + find + "':");
            
              List.find({}).then(function(allLists) {
                setTimeout(function() {
                res.render("list", { listTitle: foundList.name, newListItem: foundList.items, allLists: allLists });
              }, 1000);
            });
        }
    });
});

app.post("/delete", function(req, res){
    const checkedItemId=req.body.checkbox;
    const listTitle=req.body.listName;
    if(listTitle==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){
            console.log("Removed item with id '" + checkedItemId + "' from items.");
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate(
            { name: listTitle },
            { $pull: { items: { _id: checkedItemId } } }).then(function(foundList) {
                
                    console.log("Successfully deleted item with id '" + checkedItemId +"' from "+listTitle+".");
                    res.redirect("/"+listTitle);
        
            }
        );
    }
});





app.listen(3000 || process.env.PORT, function(){
    const url="http://localhost:3000";
    console.log("App is listening on port 3000: "+url);
})