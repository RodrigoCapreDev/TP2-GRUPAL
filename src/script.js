//Api info https://developer.themoviedb.org/docs/getting-started
apiTMBDtoken='eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjFjMjRlMzRhOTVlODcyMzM3Zjg1ZTIwZTA0NjVjNCIsIm5iZiI6MTcyMDE5NzUzNS4yOTA4OSwic3ViIjoiNjY4ODAzOTJmNGJiMjQ5OGYzYjBhMmFlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.hJ6wjC2I_Uj_k3Kg5lk65vJ3cLH-Mh7PSgq5U3g6LTk';
StrapiToken='099da4cc6cbb36bf7af8de6f1f241f8c81e49fce15709c4cfcae1313090fa2c1ac8703b0179863b4eb2739ea65ae435e90999adb870d49f9f94dcadd88999763119edca01a6b34c25be92a80ed30db1bcacb20df40e4e7f45542bd501f059201ad578c18a11e4f5cd592cb25d6c31a054409caa99f11b6d2391440e9c72611ea';
const ActorName='Tom Cruise';
var ActorId='';
var Movies='';
const BASE_URL = 'https://api.themoviedb.org/3';
const STRAPI_URL = 'https://gestionweb.frlp.utn.edu.ar/api/g18-peliculas'; // URL de tu instancia de Strapi

//Para buscar peliculas del actor utilizando la libreria de js axios
async function fetchActorMovies() {
  try {
    // Buscar el ID del actor
    const searchResponse = await axios.get(`${BASE_URL}/search/person?query=${ActorName}`, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiTMBDtoken
      }
    });

    console.log(searchResponse);
    const nombreActorId = searchResponse.data.results[0].id;

    // Obtener las películas en las que ha actuado el actor
    const moviesResponse = await axios.get(`${BASE_URL}/person/${nombreActorId}/movie_credits`, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiTMBDtoken
      }
    });

    
    const movies = moviesResponse.data.cast.slice(0, 10);
    console.log(movies);
    
    const movieDetails = await Promise.all(movies.map(async (movie) => {
      const movieResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + apiTMBDtoken
        }
      });

      const movieData = movieResponse.data;

      return {
        title: movieData.title,
        synopsis: movieData.overview,
        genres: movieData.genres.map(genre => genre.name).join(', '),
        vote_count: movieData.vote_count,
        vote_average: movieData.vote_average,
        image: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
      };
    }));

    console.log(movieDetails);
    // Enviar los datos a Strapi
    
    for (const movie of movieDetails) {
      //console.log(movie);
      try{
        const response = await fetch('https://gestionweb.frlp.utn.edu.ar/api/g18-peliculas', {
          method: 'POST',
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + StrapiToken 
          },
          body: JSON.stringify({
            Titulo: movie.title,
            Sinopsis: movie.synopsis,
            Genero: movie.genres, // Si genres es un array, conviértelo a string
            CantVotos: movie.vote_count,
            PromVotos: movie.vote_average,
            Imagen: movie.image
        })
        });

        if (!response.ok) {
          throw new Error('Error en la solicitud: ' + response.status);
        }
        } catch (error) {
            console.error('Error uploading pelicula:', error.message);
        }
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
}

fetchActorMovies();

async function getDataFromStrapi() {
  //para recuperar las peliculas
  try {
    const response = await fetch(STRAPI_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + StrapiToken 
      }
    })
    .then(result => result.json())
		.then(data =>{
			respuesta = data;
      console.log(data); 
			//return data.results; //devuelve los 20 primeros resultados
		});
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

//CARRUSEL
let currentIndex=1;
function showSlide(index) {
    const slides = document.querySelectorAll('.carrusel-item');
    const totalSlides = slides.length;
    if (index >= totalSlides) {
        currentIndex = 0;
    } else if (index < 0) {
        currentIndex = totalSlides - 1;
    } else {
        currentIndex = index;
    }
    console.log(slides);
    for (let i = 0 ; i < slides.length ; i++)  {
        let slide = slides[i];
        console.log(slide);
        slide.classList.remove('active', 'left', 'right', 'hidden');
        if (i === currentIndex) {
            slide.classList.add('active');
        } else if (i === currentIndex - 1 || (currentIndex === 0 && i === 2)) {
            slide.classList.add('left');
        } else if (i === currentIndex + 1 || (currentIndex === totalSlides - 1 && i === 7)) {
            slide.classList.add('right');
        } else {
            slide.classList.add('hidden');
        }
    };
}
function prevSlide() {
    if(currentIndex == 1) {
        return ;
    }
    showSlide(currentIndex - 1);
}
function postSlide() {
    if(currentIndex == 10) {
        return ;
    }
    showSlide(currentIndex + 1);
}

//RECARGAR PAGINA CON EL LOGO
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logo').addEventListener('click', function() {
      location.reload();
    });
  });

  document.getElementById('link2').addEventListener('click', function(event) {
    console.log("se clikeo link2");
    getDataFromStrapi();
  });