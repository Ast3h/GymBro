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

/* FUNZIONE CHECK TOKEN */
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if(!token){
        console.log("IL TOKEN NON C'È")
        return res.status(401).json({error : "Unauthorized"})
        
    }

    try{
        const plain = jwt.verify(token, process.env.JWT_SECRET)
        req.id = plain.user_id
        next()
    }catch {
        console.log("IL TOKEN È SBAGLIATO")
        return res.status(401).json({error : "Unauthorized"})
       
    }
}


/* DB AUTH ROUTE */
app.post('/auth/register', async(req, res) =>{
    const email = req.body.email
    const nome = req.body.nome
    const cognome = req.body.cognome
    const password = req.body.password
    const eta = new Date(req.body.data)
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
                dataNascita : eta,
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

/* INFO PROFILO */

app.get('/users/profile', auth, async(req, res) =>{
    const id  = req.id
    console.log("l'user id:" + id)
    let user = 10
    try{
        user = await prisma.user.findUnique({
            where : {id: id}
        })
        console.log(user)
    } catch(error){
        return res.status(400).json({error : error.message})
    }
    const cleaned_user = {
        nome : user.nome,
        cognome : user.cognome,
        email : user.email,
        eta : user.dataNascita,
        peso : user.peso,
        altezza : user.altezza,
        avatarUrl : user.avatarUrl,
        genere : user.genere,
        obiettivo : user.obiettivo,
        livello : user.livello,
    } 
    res.json(cleaned_user)
})

/* CAMBIARE AVATAR URL */

app.patch('/users/avatar', auth, async(req,res)=>{
    const numUrl = parseInt(req.body.avatarNum)
    const id = req.id
    const avatar = {
        1 : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Ryan",
        2 : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Nolan",
        3 : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Riley",
        4 : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Ryker",
    }
    const url = avatar[numUrl]
    if(!url){
        return res.status(400).json({error : error.message})
    }
    try{
        const avatar = await prisma.user.update({
            where: {id : id},
            data : {
                avatarUrl : url
            }
        })
        console.log(avatar)
    }catch(error){
        return res.status(500).json({error : error.message})
    }
})

app.patch('/users/profile', auth, async(req,res)=>{
    const name = req.body.name
    const data = req.body.data ? new Date(req.body.data) : undefined
    const peso = parseInt(req.body.peso)
    const altezza = parseInt(req.body.altezza)
    const livello = parseInt(req.body.livello)
    const id = req.id

    try {
        const user = await prisma.user.findUnique({
            where : {id : id}
        })

        const new_data = await prisma.user.update({
            where : {id : id},
            data : {
                nome : name ?? user.nome,
                peso : peso ?? user.peso,
                altezza : altezza ?? user.altezza,
                dataNascita : data ?? user.dataNascita,
                livello : livello ?? user.livello,
            }
        })
    } catch (error) {
        return res.status(500).json({error : error.message})
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
app.get('/exercises' , auth, async (req, res) =>{
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


app.get('/fullexercises', auth, async (req,res) =>{
    try{
        const response = await prisma.exercise.findMany()
        res.json(response)
        console.log(response)
    }catch (error){
        return res.status(500).json({error : error.message})
    }
})

//      SCHEDE ALLENAMENTO

//CREA SCHEDA
app.post('/workout-plans', auth,  async (req, res) =>{
    const uid = req.id
    const nome = req.body.nome
    const tipo = req.body.tipo
    const data = new Date(req.body.data)
    
    try{
        const allenamento = await prisma.workout_plan.create({
            data : {userId : uid,
                    name : nome,
                    tipo : tipo,
                    dataCreazione : new Date(),

            }
    })
        //console.log(allenamento)
        res.json(allenamento)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
    
})

/* CARICA SCHEDE UTENTE */
app.get('/users/workout-plans', auth, async (req, res) =>{
    const id = req.id
    try{
        const workout = await prisma.workout_plan.findMany({
            where : {userId : id},
            include : {
                _count : {
                    select : {workout_ex : true}
                },
                workout_ex : {
                    include : {
                        exercise : {
                            select  : {
                                macroPart : true,
                            }
                        }
                    }
                }
            }
        })
        
        workout.forEach(single_workout =>{
            const zone =  [...new Set(single_workout.workout_ex.map(ex => ex.exercise.macroPart))]
            single_workout.zone = zone
            delete single_workout.workout_ex
        })
            
        
        console.log(workout)
        res.json(workout)

    }catch(error){
        res.status(500).json({error : error.message})
    }
})

/* AGGIUNGERE ESERCIZIO A SCHEDA */
app.post('/users/workout-plans', auth, async(req,res) =>{
    const id = req.id
    const workout_id = parseInt(req.body.workout_id)
    const exercise = parseInt(req.body.exercise)
    const set = parseInt(req.body.nset)

    try {
        const response = await prisma.workout_plan.findUnique({
            where : {
                userId : id,
                workoutId : workout_id,
            }
        })
        if(!response){
            return res.status(401).json({error : 'Unauthorized'})
        }
        const exercise_response = await prisma.workout_exercise.create({
            data: {workoutId : workout_id,
                exerciseId : exercise,
                nSet : set,
                nRep : null
            }
        })

        console.log(exercise_response)


    } catch (error) {
        if(error.code === 'P2002'){
            return res.status(400).json({error : 'Esercizio già presente nella scheda'})
        }
        return res.status(500).json({error : error.message})
    }
})
