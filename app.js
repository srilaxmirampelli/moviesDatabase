const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const databasePath = path.join(__dirname, 'moviesData.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let database = null
// Initialize the connection between database and server
const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

// Get Movies names API 1
app.get('/movies/', async (request, response) => {
  const getMoviesNamesQuery = `
    SELECT movie_name
    FROM movie;
    `
  const moviesNamesArray = await database.all(getMoviesNamesQuery)
  response.send(
    moviesNamesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

// Post movies API 2
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO
  movie (director_id, movie_name, lead_actor)
  VALUES (${directorId}, "${movieName}", "${leadActor}");
  `
  const movie = await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

// Get Movie ID API 3
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieIdQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};
    `
  const movie = await database.get(getMovieIdQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

// Put Movie API 4
app.put('/movies/:movieId', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE movie_id = ${movieId};
  `
  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// Delete Movie API 5

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM movie
  WHERE movie_id = ${movieId};
  `
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// Get Directors API 6
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;
    `
  const directors = await database.all(getDirectorsQuery)
  const responseArray = directors.map(eachDirector => ({
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  }))
  response.send(responseArray)
})

// Get movies by a specific director API 7
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};
    `
  const directorsMovies = await database.all(getDirectorMoviesQuery)
  const responseArray = directorsMovies.map(eachDirector => ({
    movieName: eachDirector.movie_name,
  }))
  response.send(responseArray)
})

module.exports = app
