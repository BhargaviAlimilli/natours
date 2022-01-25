const fs= require('fs')
const express= require("express")
const app= express()

app.use(express.json()) // express.json() is the middleware

//// sample to get n post 

/*app.get('/', (req,res)=>{
    res
    .status(200)
    .json({message: "hey there we are at the express on port 8000 route page", app: 'notorous'})
})

app.post('/', (req,res)=>{
    res.end('You can post here at express on port 8000 route page')
})
*/

const tours= JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'))

const getAllTours=(req,res)=>{
    res.status(200).json({
        status:"success",
        results: tours.length,
        data: {
            tours
        }
    })
}

const getTour= (req,res)=>{
    console.log(req.params)
    const id= req.params.id * 1
    const tour=tours.find(el => el.id===id)
    if(!tour){
        res.status(404).json({
            status:"Fail",
            message: "No tours available on this id",
        })
    }
    res.status(200).json({
        status:"success",
        results: tours.length,
        data: {
            tour
        }
    })
}

const createTour= (req,res)=>{
    //console.log(req.body)
    const newId= tours[tours.length-1].id + 1
    const newTour= Object.assign({"id": newId }, req.body)
    tours.push(newTour)

    fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify( tours), err=>{
        res.status(201).json({
            status:"success",
            data: {
                tour: newTour
            }
        })
    })
}

const updateTour=(req,res)=>{
    if(req.params.id * 1 > tours.length){
        res.status(404).json({
            status:"Fail",
            message: "No tours available on this id",
        })
    }
    res.status(200).json({
        status:"success",
        data: {
            tour:"<Updated tour here>"
        }
    })
}

const deleteTour= (req,res)=>{
    if(req.params.id * 1 > tours.length){
        res.status(404).json({
            status:"Fail",
            message: "No tours available on this id",
        })
    }
    res.status(204).json({
        status:"success",
        data: null
    })
}

const getAllUsers=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message: "route not yet updated!!"
    })
}

const createrUser=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message: "route not yet updated!!"
    })
}

const getUser=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message: "route not yet updated!!"
    })
}

const updateUser=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message: "route not yet updated!!"
    })
}

const deleteUser=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message: "route not yet updated!!"
    })
}


/*app.get('/api/v1/tours', getAllTours)
app.get('/api/v1/tours/:id', getTour) // to get tours by id 
app.post('/api/v1/tours',createTour )
app.patch('/api/v1/tours/:id', updateTour)
app.delete('/api/v1/tours/:id', deleteTour )
*/
//alternative way for the above routing calling 
//////// tour routes
app.route('/api/v1/tours').get(getAllTours).post(createTour)
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)
///////// user routes
app.route('/api/v1/users').get(getAllUsers).post(createrUser)
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser)

/////////// server starter
app.listen(8000, ()=>{
    console.log("listening on port 8000.........")
})


