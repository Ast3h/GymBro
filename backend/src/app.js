const express = require('express')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

const cors = require('cors')
app.use(cors())

const jwt = require('jsonwebtoken')

app.listen(3000, () => {
    console.log('server avviato su 3000')
})




/* DB AUTH ROUTE */
app.post('/auth/register', async(req, res) =>{
    const email = req.body.email
    const nome = req.body.nome
    const cognome = req.body.cognome
    const password = req.body.password
    const eta = parseInt(req.body.data) 
    const peso = parseFloat(req.body.peso)
    const altezza = parseFloat(req.body.altezza)
    const genere = req.body.genere
    const livello = parseInt(req.body.livello)
    const obiettivo = req.body.obiettivo


    const checkObiettivo = ['Forza', 'Dimagrire', 'Resistenza', 'Benessere', 'Massa muscolare']

    console.log("livello : " + livello + " obiettivo : " + obiettivo)

    //CONTROLLO EMAIL PASSWORD E USERNAME SIANO PRESENTI E VALIDI
    const reg_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!email ){
        return res.status(400).json({error : "L'email è obbligatoria"})
    }
    if(!reg_email.test(email)){
        return res.status(400).json({error : "L'email non è valida"})
    }
    if(!password){
        return res.status(400).json({error : "La password è obbligatoria"})
    }
    if(password.length < 8){
        return res.status(400).json({error : "La password deve contenere almeno 8 caratteri"})
    }
    if(!checkObiettivo.includes(obiettivo)){
        return res.status(400).json({error : "Obiettivo non valido"})
    }


    try{
        const user = await prisma.user.create({
            data : { email : email,
                nome : nome,
                cognome : cognome,
                password : await bcrypt.hash(password, 10),
                eta : eta,
                peso : peso,
                altezza : altezza,
                genere : genere,
                livello : livello,
                obiettivo : obiettivo,
            }
        })
        console.log(user)
        res.json(user)
    }catch(error){
        if(error.code === 'P2002'){
            const campo = error.meta.target[0]

            if(campo == 'username'){
                return res.status(400).json({error : "Username non disponibile"})
            }
            if(campo == 'email'){
                return res.status(400).json({error : "Email già in uso"})
            }
            
        }
        res.status(500).json({errore : error.message})
    }
})



app.post('/auth/login', async (req,res) =>{
    const email = req.body.email
    const password = req.body.password

    
    const user = await prisma.user.findUnique({
        where: {email : email}
    })
    if(!user){
        return res.status(401).json({error : "Credenziali errate"})
    }
    console.log(user.password)
    
    if(await bcrypt.compare(password, user.password)){
        console.log("COMPARE FUNZIONA BENE")
    }else{
        return res.status(401).json({error : "Credenziali errate"})
    }
    
    const token = jwt.sign(
        {user_id : user.id},
        process.env.JWT_SECRET,
        {expiresIn : '1d'}
    )

    res.json({token : token})
    
})

/* 

            ESERCIZI DB API     

*/

///FILTRARE ESERCIZI CON MACRO PART
app.get('/exercises/:macroPart' , async (req, res) =>{
    const macro = req.params.macroPart
    console.log("macropart")
    try{
        const esercizi = await prisma.exercise.findMany({
            where : { macroPart: macro}
        })
        res.json(esercizi)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
})

///FILTRARE ESERCIZI CON BODY PART
app.get('/exercises/:macroPart/:bodyPart' , async (req, res) =>{
    const body = req.params.bodyPart
    const macro = req.params.macroPart
    console.log("bodpart")
    try{
        const esercizi = await prisma.exercise.findMany({
            where : { bodyPart: body,
                      macroPart : macro,
            }
        })
        res.json(esercizi)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
})


///FILTRARE CON ID
app.get('/exercises' , async (req, res) =>{
    const macro = parseInt(req.query.id)
    console.log(macro)
    try{
        const esercizi = await prisma.exercise.findMany({
            where : { id: macro}
        })
    
        res.json(esercizi)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
})


//      SCHEDE ALLENAMENTO

//CREA SCHEDA
app.post('/workout-plans', async (req, res) =>{
    const uid = parseInt(req.body.id)
    const nome = req.body.nome

    
    try{
        const allenamento = await prisma.workout_plan.create({
            data : {userId : uid,
                    name : nome
            }
    })
        console.log(allenamento)
        res.json(allenamento)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
    
})

