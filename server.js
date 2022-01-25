const mongoose= require('mongoose')
const dotenv= require('dotenv')
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(con=>{
    //console.log(con.connections)
    console.log('DB connection successful!')
  })
  .catch(err=>{
    console.log("Sorry Unable to connect to DB")
  })

const server=app.listen(4000, ()=>{
    console.log("listening on port 4000.........")
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});