require('dotenv').config()

const express = require('express')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const ms = Date.now() - start
        console.log(`${req.method} ${req.originalUrl} --> ${res.statusCode} (${ms}ms)`)
    })
    next()
})

const jwt = require('jsonwebtoken')

app.listen(3000, () => {
    console.log('server avviato su 3000')
})

/* FUNZIONE CHECK TOKEN */
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if(!token){

        return res.status(401).json({error : "Unauthorized"})
        
    }

    try{
        const plain = jwt.verify(token, process.env.JWT_SECRET)
        req.id = plain.user_id
        next()
    }catch {

        return res.status(401).json({error : "Unauthorized"})
       
    }
}


/* DB AUTH ROUTE */
app.post('/auth/register', async(req, res) =>{
    const email = req.body.email
    const nome = req.body.nome
    const cognome = req.body.cognome
    const password = req.body.password
    const eta = req.body.data ? new Date(req.body.data) : null
    const peso = parseFloat(req.body.peso)
    const altezza = parseFloat(req.body.altezza)
    const genere = req.body.genere
    const livello = parseInt(req.body.livello)
    const obiettivo = req.body.obiettivo


    const checkObiettivo = ['Forza', 'Dimagrire', 'Resistenza', 'Benessere', 'Massa muscolare']


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

         const storico = await prisma.storico_forma.create({
                data : {
                    peso : peso,
                    userId : user.id,
                    data : new Date()
                }
            })
        
        res.status(201).json({ message: 'Registrazione avvenuta con successo' })
        
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
        console.error(error)
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

    if(await bcrypt.compare(password, user.password)){

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


/* CONTROLLO AUTENTICAZIONE UTENTE */
app.get('/auth/check', auth, async(req, res) =>{
    res.json({valid : true})
})


/* INFO PROFILO */

app.get('/users/profile', auth, async(req, res) =>{
    const id  = req.id
    let user = 10
    try{
        user = await prisma.user.findUnique({
            where : {id: id}
        })
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
        return res.status(201).json({message : "Modifica avvenuta con successo"})
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

        if(peso != user.peso){
            const storico = await prisma.storico_forma.create({
                data : {
                    peso : peso,
                    userId : id,
                    data : new Date()
                }
            })
        }

        return res.status(201).json({message : "Modifica avvenuta con successo"})
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
    try{
        const esercizi = await prisma.exercise.findMany({
            where : { id: macro}
        })
    
        res.json(esercizi)
    }catch(error){
        res.status(500).json({errore : error.message })
    }
})


app.get('/fullexercises', async (req,res) =>{
    try{
        const response = await prisma.exercise.findMany()
        res.json(response)
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
    const nrep = parseInt(req.body.nrep)

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
            data: {
                workoutId : workout_id,
                exerciseId : exercise,
                nSet:       set  || 3,
                nRep:       nrep || 0,
            }
        })
        for(let i = 1; i<=set; i++){
            
            let ex_sets = await prisma.workout_set.create({
                data: {
                    workoutId : workout_id,
                    setId: i,
                    exerciseId : exercise,
                    rep:        nrep || 0,
                    pesi : 0,
                }
            })
            
        }   

        return res.status(201).json({message : 'Esercizio aggiunto alla scheda'})

    } catch (error) {
        console.error(error)
        if(error.code === 'P2002'){
            return res.status(400).json({error : 'Esercizio già presente nella scheda'})
            
        }
        return res.status(500).json({error : error.message})
    }
})


/* CARICA SCHEDA UTENTE */
app.get('/users/workout-plans/:id', auth, async(req, res) =>{
    const id = req.id
    const workout_id = parseInt(req.params.id)

    try {
        const check = await prisma.workout_plan.findUnique({
            where : { workoutId : workout_id},
            include : {
                workout_ex : {
                    include : {exercise : {
                        select : {
                            id : true,
                            nameIt : true,
                            videoUrl : true,
                            bodyPart : true,
                            macroPart : true,
                        }
                    }}
                }
            }
        })


        if(check.userId !== id){
            return res.status(401).json({error : 'Unauthorized'})
        }

        res.json(check)
    } catch (error) {
        return res.status(500).json({error : error.message})
    }

})


/* ELIMINARE SCHEDA */
app.delete('/users/workout-plans/:id', auth, async (req,res) =>{
    const id = req.id
    const workout_id = parseInt(req.params.id)

    try {
        let check = await prisma.workout_plan.findUnique({
            where : {
                userId : id,
                workoutId : workout_id,
            }
        })   
        
        if(!check){
            return res.status(401).json({error : 'Unauthorized'})
        }

        check = await prisma.workout_set.deleteMany({
            where : { workoutId : workout_id}
        })
        check = await prisma.workout_exercise.deleteMany({
            where : { workoutId : workout_id}
        })
        check = await prisma.workout_plan.deleteMany({
            where : { workoutId : workout_id}
        })
        res.json({messaggio : 'Scheda eliminata'})
    } catch (error) {
        res.status(500).json({error : error.message})
    }


})


app.patch('/users/workout-plans/:id', auth, async (req, res) =>{
    const id = req.id
    const workout_id = parseInt(req.params.id)
    const nome = req.body.name
    const note = req.body.note

    try {
        const check = await prisma.workout_plan.findUnique({
            where : {userId : id,
                workoutId : workout_id
            }
        })

        if(!check){
            return res.status(401).json({error : 'Unauthorized'})
        }
        const scheda = await prisma.workout_plan.update({
            where : {
                userId : id,
                workoutId : workout_id
            },
            data : {
                name : nome ?? check.name,
                note : note ?? check.note
            }
        }
        )
        res.json({ success: true })
        
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
})


/* AGGIORNA SERIE CON PESI E REP DELL'ALLENAMENTO */
app.patch('/users/workout-set', auth, async (req, res) => {
    const id         = req.id
    const workoutId  = parseInt(req.body.workoutId)
    const exerciseId = parseInt(req.body.exerciseId)
    const setId      = parseInt(req.body.setId)
    const pesi       = parseFloat(req.body.pesi)
    const rep        = parseInt(req.body.rep)

    try {
        /* verifica che la scheda appartenga all'utente */
        const check = await prisma.workout_plan.findUnique({
            where: { workoutId, userId: id }
        })
        if (!check) return res.status(401).json({ error: 'Unauthorized' })

        const current = await prisma.workout_set.findFirst({
            where: { workoutId, exerciseId, setId }
        })

        const updated = await prisma.workout_set.upsert({
            where: { workoutId_exerciseId_setId: { workoutId, exerciseId, setId } },
            update: {
                pesi: (current && current.pesi > pesi) ? current.pesi : pesi,
                rep
            },
            create: { workoutId, exerciseId, setId, pesi, rep }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/* AGGIORNA ESERCIZI DI UNA SCHEDA CON NSET E NREP */
app.patch('/users/workout-plans/:id/exercises', auth, async (req, res) => {
    const uid       = req.id
    const workoutId = parseInt(req.params.id)
    const esercizi  = req.body.esercizi /* array [{ exerciseId, nSet, nRep }] */

    try {
        /* verifica che la scheda appartenga all'utente */
        const check = await prisma.workout_plan.findUnique({
            where: { workoutId, userId: uid }
        })
        if (!check) return res.status(401).json({ error: 'Unauthorized' })

        /* esercizi attualmente nel db per questa scheda */
        const esistenti   = await prisma.workout_exercise.findMany({ where: { workoutId } })
        const idEsistenti = new Set(esistenti.map(e => e.exerciseId))
        const idNuovi     = new Set(esercizi.map(e => e.exerciseId))

        /* 1. ELIMINA quelli rimossi dal frontend (workout_set prima, poi workout_exercise) */
        for (const ez of esistenti) {
            if (!idNuovi.has(ez.exerciseId)) {
                await prisma.workout_set.deleteMany({ where: { workoutId, exerciseId: ez.exerciseId } })
                await prisma.workout_exercise.delete({
                    where: { workoutId_exerciseId: { workoutId, exerciseId: ez.exerciseId } }
                })
            }
        }

        /* 2. AGGIORNA esistenti / INSERISCE nuovi */
        for (const ez of esercizi) {
            const nSet = ez.nSet ?? 1
            const nRep = ez.nRep ?? 0

            if (idEsistenti.has(ez.exerciseId)) {
                /* aggiorna serie e reps */
                await prisma.workout_exercise.updateMany({
                    where: { workoutId, exerciseId: ez.exerciseId },
                    data:  { nSet, nRep }
                })
            } else {
                /* crea workout_exercise */
                await prisma.workout_exercise.create({
                    data: { workoutId, exerciseId: ez.exerciseId, nSet, nRep }
                })
                /* crea i workout_set corrispondenti */
                for (let i = 1; i <= nSet; i++) {
                    await prisma.workout_set.create({
                        data: { workoutId, exerciseId: ez.exerciseId, setId: i, rep: nRep, pesi: 0 }
                    })
                }
            }
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/* RIMUOVI ESERCIZIO DA SCHEDA */
app.delete('/users/workout-plans/:workoutId/exercises/:exerciseId', auth, async (req, res) => {
    const uid        = req.id
    const workoutId  = parseInt(req.params.workoutId)
    const exerciseId = parseInt(req.params.exerciseId)

    try {
        const check = await prisma.workout_plan.findUnique({
            where: { workoutId, userId: uid }
        })
        if (!check) return res.status(401).json({ error: 'Unauthorized' })

        await prisma.workout_exercise.delete({
            where: { workoutId_exerciseId: { workoutId, exerciseId } }
        })

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/* GET tutti gli allenamenti dell'utente */
app.get('/users/allenamenti', auth, async (req, res) => {
    try {
        const allenamenti = await prisma.allenamento.findMany({
            where: { userId: req.id },
            orderBy: { data: 'desc' },
            include: { workout: { select: { name: true } } }
        })
        res.json(allenamenti)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/* POST salva un allenamento */
app.post('/users/allenamenti', auth, async (req, res) => {
    const { data, workoutId, durataSec, volume, note } = req.body
    try {
        const nuovo = await prisma.allenamento.create({
            data: {
                userId:    req.id,
                workoutId: workoutId ? parseInt(workoutId) : null,
                data:      new Date(data),
                durataSec: durataSec ?? null,
                volume:    volume    ?? null,
                note:      note      ?? null,
            },
            include: { workout: { select: { name: true } } }
        })
        res.json(nuovo)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/* DELETE elimina un allenamento */
app.delete('/users/allenamenti/:id', auth, async (req, res) => {
    try {
        const check = await prisma.allenamento.findUnique({
            where: { id: parseInt(req.params.id) }
        })
        if (!check || check.userId !== req.id)
            return res.status(401).json({ error: 'Unauthorized' })
        await prisma.allenamento.delete({ where: { id: parseInt(req.params.id) } })
        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/* SALVA MODIFICHE CALENDARIO */
app.patch('/users/allenamenti/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id)
    const { workoutId, durataSec, volume } = req.body
    try {
        const check = await prisma.allenamento.findUnique({ where: { id } })
        if (!check || check.userId !== req.id)
            return res.status(401).json({ error: 'Unauthorized' })
        const aggiornato = await prisma.allenamento.update({
            where: { id },
            data: {
                workoutId: workoutId !== undefined ? (workoutId ? parseInt(workoutId) : null) : check.workoutId,
                durataSec: durataSec ?? check.durataSec,
                volume:    volume    ?? check.volume,
            },
            include: { workout: { select: { name: true } } }
        })
        res.json(aggiornato)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/* GET RECORD PERSONALI */

app.get('/users/record', auth, async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const uid = req.id
    try {
        /* trova le workoutId con almeno un allenamento registrato */
        const allenamenti = await prisma.allenamento.findMany({
            where:    { userId: uid, workoutId: { not: null } },
            select:   { workoutId: true },
            distinct: ['workoutId'],
        })
        const workoutIds = allenamenti.map(a => a.workoutId).filter(Boolean)
        
        if (workoutIds.length === 0) return res.json([])

        /* workout_set con pesi > 0 solo delle schede allenate */
        const sets = await prisma.workout_set.findMany({
            where: {
                workoutId: { in: workoutIds },
                pesi:      { gt: 0 },
            },
            include: {
                exercise: { select: { id: true, nameIt: true, macroPart: true, bodyPart: true } },
            },
        })

        /* raggruppa per esercizio, mantieni il massimo */
        const mappa = {}
        for (const s of sets) {
            const id = s.exerciseId
            if (!mappa[id] || s.pesi > mappa[id].pesi) {
                mappa[id] = {
                    exerciseId: id,
                    nome:       s.exercise.nameIt,
                    macroPart:  s.exercise.macroPart,
                    bodyPart:   s.exercise.bodyPart,
                    pesi:       s.pesi,
                    rep:        s.rep,
                }
            }
        }

        const record = Object.values(mappa).sort((a, b) => b.pesi - a.pesi)
        res.json(record)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

//CARICA SCHEDE PREDEFINITE
app.get('/users/workout-template', auth, async (req, res) =>{
    
    try{
        const workout = await prisma.workout_template.findMany({
            where : {tipo : 'predefinita'},
            include : {
                _count : {
                    select : {template_ex : true}
                },
                template_ex : {
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
            const zone =  [...new Set(single_workout.template_ex.map(ex => ex.exercise.macroPart))]
            single_workout.zone = zone
            delete single_workout.template_ex
        })
            
        
        res.json(workout)

    }catch(error){
        res.status(500).json({error : error.message})
    }
})


//CARICA SCHEDA PREDEFINITA
app.get('/users/workout-template/:id', auth, async(req, res) =>{
    const id = req.id
    const workout_id = parseInt(req.params.id)
    
    try {
        const check = await prisma.workout_template.findUnique({
            where : { templateId : workout_id},
            include : {
                template_ex : {
                    include : {exercise : {
                        select : {
                            id : true,
                            nameIt : true,
                            videoUrl : true,
                            bodyPart : true,
                            macroPart : true,
                        }
                    }}
                }
            }
        })


        if(!check){
            return res.status(401).json({error : 'Unauthorized'})
        }

        const {template_ex, ...rest} = check
        res.json({ ...rest , 'workout_ex' : template_ex})
    } catch (error) {
        
        return res.status(500).json({error : error.message})
    }

})


//SALVA SCHEDA TEMPLATE IN PROFILO UTENTE
/* SALVA UN TEMPLATE COME SCHEDA PERSONALE */
app.post('/users/workout-template/:id', auth, async (req, res) => {
    const userId     = req.id
    const templateId = parseInt(req.params.id)

    try {
        // 1. Carica il template con i suoi esercizi
        const template = await prisma.workout_template.findUnique({
            where: { templateId },
            include: { template_ex: true }
        })

        if (!template) {
            return res.status(404).json({ error: 'Template non trovato' })
        }

        // 2. Crea la nuova scheda personale
        const plan = await prisma.workout_plan.create({
            data: {
                userId,
                name:          template.name,
                tipo:          'Personale',
                note:          template.note,
                dataCreazione: new Date(),
            }
        })

        // 3. Per ogni esercizio del template crea il corrispondente
        //    workout_exercise + i workout_set con pesi=0
        for (const ez of template.template_ex) {
            const nSet = ez.nSet
            const nRep = ez.nRep

            await prisma.workout_exercise.create({
                data: {
                    workoutId:  plan.workoutId,
                    exerciseId: ez.exerciseId,
                    nSet,
                    nRep,
                }
            })

            for (let i = 1; i <= nSet; i++) {
                await prisma.workout_set.create({
                    data: {
                        workoutId:  plan.workoutId,
                        exerciseId: ez.exerciseId,
                        setId:      i,
                        rep:        nRep ?? 0,
                        pesi:       0,
                    }
                })
            }
        }
        res.json(plan)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

/* PATCH: aggiorna il peso massimo di un esercizio */
app.patch('/users/record/:ezId', auth, async (req, res) => {
    const uid  = req.id
    const ezId = parseInt(req.params.ezId)
    const { pesi, rep } = req.body
    try {
        await prisma.workout_set.updateMany({
            where: { workout: { userId: uid }, exerciseId: ezId },
            data:  { pesi: parseFloat(pesi) || 0, rep: parseInt(rep) || 0 }
        })
        res.json({ success: true })
    } catch(e) { res.status(500).json({ error: e.message }) }
})

/* DELETE: azzera i pesi di tutti i set di un esercizio */
app.delete('/users/record/:ezId', auth, async (req, res) => {
    const uid  = req.id
    const ezId = parseInt(req.params.ezId)
    try {
        await prisma.workout_set.updateMany({
            where: { workout: { userId: uid }, exerciseId: ezId },
            data:  { pesi: 0, rep: 0 }
        })
        res.json({ success: true })
    } catch(e) { res.status(500).json({ error: e.message }) }
})