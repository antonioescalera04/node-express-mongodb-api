const express = require('express');
const morgan = require('morgan');

const tourRouter = require ('./router/tourRoutes');
const userRouter = require ('./router/userRoutes');


const app = express();

//1.MIDDLEWARES
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app. use(morgan('dev')); 
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`))




//2. ROUTE HANDLERS




//Nueva ruta capitulo siguiente
//app.get('/api/v1/tours', getAllTours);
//Crear una ruta que admita variables
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', createTour)
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

//3. ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;