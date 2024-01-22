const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { render } = require('ejs');
const { getDate } = require('./node_modules/getDay');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

mongoose.connect("mongodb+srv://rodrigochacon:11b0Jwf4AdmCIXmr@cluster0.wg7ktnz.mongodb.net/todolistDB");

const itemsSchema = {name: String};
const Item = mongoose.model("Item", itemsSchema);
const estudios = new Item({name: "ir a estudiar"});
const programar = new Item({name: "codificar un rato"});
const leer = new Item({name: "Leer metalearning"});
const defaultItems = [estudios, programar, leer];


const listschema = {name : String, items: [itemsSchema]};
const List = mongoose.model("List", listschema);


app.get('/', (req, res)=>{
    Item.find().then(registros=>{
        if(registros.length == 0){
            Item.insertMany(defaultItems).then(()=>console.log("se agregaron correctamente")).catch((err)=>{console.log(err)});
            res.redirect("/");
        }
        res.render('list',{listName: "Today", tasks: registros});
    });
})

app.get('/:postName', (req, res)=>{
    const postName = req.params.postName;
    List.findOne({name: postName}).then(list=>{
        if(list == null){
            const list = new List({
                name: postName,
                items: defaultItems
            })
            list.save();
            res.redirect(`/${postName}`);
        }
        else{
            res.render('list', {listName: list.name, tasks: list.items})
        }
    })
})


app.post('/', (req, res)=>{
    const listName = req.body.listName;
    const taskname = req.body.task;
    if(listName == "Today"){
        if(taskname.length == 0){
            res.redirect('/');
        }
        else{
            const newTask = new Item({name: taskname});
            newTask.save();
            res.redirect('/');
        }
    }
    else{
        if(taskname.length == 0){
            res.redirect('/' + listName);
        }
        else{
            List.findOne({name: listName}).then((list)=>{
                const newTask = new Item({name: taskname});
                list.items.push(newTask);
                list.save();
                res.redirect('/' + listName);
            })
        }

    }
})
const deleteItem = async(id, listName, res)=>{
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}});
    res.redirect('/' + listName);
}
const deleteItemToday = async(identificacion, res)=>{
    await Item.findByIdAndDelete(identificacion);
    res.redirect('/');
}
app.post('/delete', (req, res)=>{
    const id = req.body.checkbox;
    const lista = req.body.listName;
    if(lista == "Today"){
        deleteItemToday(id, res);
    }
    else{
        deleteItem(id, lista, res);
    }
})
app.listen(process.env.PORT || 3000, ()=>console.log('Listen on port 3000'));
