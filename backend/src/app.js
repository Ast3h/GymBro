const express = require('express')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const app = express()
app.use(express.json())


app.listen(3000, () => {
    console.log('server avviato su 3000')
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

//ELIMINA SCHEDA
app.delete('/workout-plans', async (req, res) =>{
    
})