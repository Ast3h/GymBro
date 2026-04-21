const express = require('express')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())


app.listen(3000, () => {
    console.log('server avviato su 3000')
})




/* DB AUTH ROUTE */
app.post('/auth/register', async(req, res) =>{
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const data_N = req.body.data ? new Date(req.body.data) : undefined //DATA PASSATA IN FORMATO AAAA-MM-GG
    const peso = parseFloat(req.body.peso)
    const altezza = parseFloat(req.body.altezza)
    const genere = req.body.genere

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
    if(!username){
        return res.status(400).json({error : "L'username è obbligatorio"})
    }


    try{
        const user = await prisma.user.create({
            data : { email : email,
                username : username,
                password : await bcrypt.hash(password, 10),
                nascita : data_N,
                peso : peso,
                altezza : altezza,
                genere : genere,
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

