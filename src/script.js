//Api info https://developer.themoviedb.org/docs/getting-started
apiTMBDtoken='eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjFjMjRlMzRhOTVlODcyMzM3Zjg1ZTIwZTA0NjVjNCIsIm5iZiI6MTcyMDE5NzUzNS4yOTA4OSwic3ViIjoiNjY4ODAzOTJmNGJiMjQ5OGYzYjBhMmFlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.hJ6wjC2I_Uj_k3Kg5lk65vJ3cLH-Mh7PSgq5U3g6LTk'
const ActorName='Tom Cruise'
var ActorId='';
var Movies='';

getActorMovies();

async function getActorMovies(){

    var authParameters = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiTMBDtoken
      }
    };
  var ActorId = await fetch(`https://api.themoviedb.org/3/search/person?query=${ActorName}`,authParameters)
      .then(result => result.json())
      .then(data =>{
        respuesta = data.results[0].id; 
        console.log(data);
        return respuesta
    });

  var Movies = await fetch(`https://api.themoviedb.org/3/person/${ActorId}/movie_credits?language=en-US`,authParameters)
    .then(result => result.json())
    .then(data =>{
      respuesta = data.results;
      console.log(data); 
      return respuesta;
  });

}

/*const getActorId = (async () => { //funcion para obtener el id del actor
  var authParameters = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + apiTMBDtoken
    }
  };
  await fetch(`https://api.themoviedb.org/3/search/person?query=${ActorName}`,authParameters)
    .then(result => result.json())
    .then(data =>{
      respuesta = data.results[0].id; 
      console.log(data);
  });
  ActorId=respuesta;
})(); //Se va a ejecutar primero, devuelve el id para buscar peliculas en tmdb

const getActorMovies = (async () => { //funcion para obtener las peliculas del actor
  var authParameters = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + apiTMBDtoken
    }
  };
  await fetch(`https://api.themoviedb.org/3/person/${ActorId}/movie_credits?language=en-US`,authParameters)
    .then(result => result.json())
    .then(data =>{
      respuesta = data.results[0].id; 
      console.log(data);
  });
  ActorId=respuesta;
})();*/
