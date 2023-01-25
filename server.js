const express = require('express')
const app = express()
const port = 20082
const path = require('path')

const client = require("./db.js")
const db = client.db
const User = require('./dbschemas/user')
const Minigame = require('./dbschemas/minigame')


app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

let username
let password

app.get('/', async (req, res) => {
    try
    {
        let userLoggedIn = await User.findOne({ username: req.query.username, password: req.query.password }).count()
        if(userLoggedIn != 0)
        {
            username = req.query.username
            password = req.query.password

            res.render("index", {loggedIn: true, text: 'Zalogowano ' + username, loginButtonValue: "Wyloguj się"})
        }
        else
        {
            res.render("index", {loggedIn: false, text: '' + username, loginButtonValue: "Zaloguj się"})
        }        
    }
    catch (e)
    {
        console.log(e)
    }
})

app.post('/', async (req, res) => {
    try {
        console.log(req.body.angle.length)
        if (typeof req.body.angle.length === 'undefined')
        {
            const minigame = new Minigame({
                angle: req.body.angle,
                speed: req.body.speed,
                distance: req.body.distance
            })

            await minigame.save()
            await User.findOneAndUpdate({ username: username, password: password }, { $push: { gameID: minigame._id } })
        }
        else
        {
            for (let i = 0; i < req.body.angle.length; i++)
            {
                const minigame = new Minigame({
                    angle: req.body.angle[i],
                    speed: req.body.speed[i],
                    distance: req.body.distance[i]
                })

                await minigame.save()
                await User.findOneAndUpdate({ username: username, password: password }, { $push: { gameID: minigame._id } })
            }
        }
        let s = '?username=' + username + '&password=' + password
        res.redirect('/' + s)

    } 
    catch (e)
    {
        console.log(e)
    }
})

app.get('/register', (req, res) => {
    if (req.query.isValid === 'emptyFields')
    {
        res.render("register", { error: 'Oba pola muszą być wypełnione' })
    }
    else if (req.query.isValid === 'userAlreadyExists')
    {
        res.render("register", { error: 'Taki użytkownik już istnieje' })
    }
    else
    {
        res.render("register", { error: '' })
    }
})

app.post('/register', async (req, res) => {
    try
    {
        if (req.body.username == '' && req.body.password == '')
        {
            let s = '?isValid=emptyFields'
            res.redirect('/register/' + s)
        }
        else
        {
            let userRegistered = await User.findOne({ username: req.body.username, password: req.body.password}).count()

            if (userRegistered === 0)
            {
                const user = new User({username: req.body.username, password: req.body.password})
                await user.save()

                res.status(201)
                res.redirect('/login')
            }
            else
            {
                let s = '?isValid=userAlreadyExists'
                res.redirect('/register/' + s)
            }
        }
    }
    catch (e)
    {
        console.log(e)
    }
})

app.post('/login', async (req, res) => {
    if (req.body.username != '' && req.body.password != '')
    {
        try {
            let userLoggedIn = await User.find({ username: req.body.username, password: req.body.password }).count()
            if(userLoggedIn != 0)
            {
                let s = '?username=' + req.body.username + '&password=' + req.body.password
                res.redirect('/' + s)
            }
            else 
            {
                let s = '?isValid=noSuchLogin'
                res.redirect('/login/' + s)
            }
        }
        catch (e)
        {
            console.log(e)
        }
    }
    else
    {
        let s = '?isValid=emptyFields'
        res.redirect('/login/' + s)
    }
})

app.get('/login', (req, res) => {
    if (req.query.isValid === 'emptyFields') 
    {
        res.render("login", { error: 'Oba pola muszą być wypełnione!' })
    }
    else if (req.query.isValid === 'noSuchLogin')
    {
        res.render("login", { error: 'Błędne dane logowania!' })
    }
    else
    {
        res.render("login", { error: '' })
        username = ''
        password = ''
    }
})

app.get('/allAttempts', async (req, res) => {
    try 
    {
        let userLoggedIn = await User.findOne({ username: username, password: password }).count()
        if(userLoggedIn != 0)
        {
            let array = await User.findOne({ username: username, password: password }, { gameID: 1, _id: 0 })
            array = array.gameID

            let IDs = []
            for (let i = 0; i < array.length; i++) 
                IDs[i] = await Minigame.findOne({ _id: array[i] })

            let url = '/?username=' + username + '&password=' + password
            res.render("allAttempts", { IDs: IDs, url: url })
        }
        else
        {
            res.redirect("/login")
        }
    } 
    catch (e) 
    {
        console.log(e)
    }
})

module.exports = app;

// mongo -u 0mozdzierz 172.20.44.25/0mozdzierz -p pass0mozdzierz