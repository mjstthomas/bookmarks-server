const app = require('./app')
const { PORT } = require('./config')

app.listen(PORT, (res, req) =>{
	console.log(`Listening at http://localhost:${PORT}`)
})