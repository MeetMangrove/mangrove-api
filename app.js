const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const logger = require('morgan')
const chalk = require('chalk')
const errorHandler = require('errorhandler')
const lusca = require('lusca')
const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')

dotenv.load({ path: '.env' })

const authController = require('./controllers/auth')
// const userController = require('./controllers/user')

const app = express()

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI)
mongoose.connection.on('error', (err) => {
  console.error(err)
  console.log(
    '%s MongoDB connection error. Please make sure MongoDB is running.',
    chalk.red('✗')
  )
  process.exit()
})

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))

// app.get('/', authController.index)

app.use(errorHandler())

app.listen(app.get('port'), () => {
  console.log(
    '%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env')
  )

  console.log('  Press CTRL-C to stop\n')
})

module.exports = app
