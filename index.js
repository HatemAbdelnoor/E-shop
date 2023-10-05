import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express'
import initApp from './src/index.router.js'
import chalk from 'chalk'
const app = express()
app.get('/',async (req, res) => {
    await res.sendFile(__dirname + '/index.html');
  });
const port = +process.env.PORT || 5000
console.log(port)

initApp(app, express)
const warn = chalk.hex("#09c")
app.listen(port, () => console.log(warn(`Example app listening on port.... ` + chalk.green`${port}`)))