//API
const apiTMBDtoken="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MTI2MmZkYTkxNjVmMGQ0ZGE4YTY0MzcyYmVmNGUzNiIsIm5iZiI6MTcyMDM5OTQyOS44MTU3ODgsInN1YiI6IjY2OGIzNTk3MzQ2OWM2MTdlNzk5ZjgxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3u0M75-jWfd8EGSmLEmOGkW_s5xLK3RvQheKbLFsBOs"
const nombreActor='Tom Cruise'
const axios = require('axios');
const BASE_URL = 'https://api.themoviedb.org/3';
const STRAPI_URL = 'http://localhost:1337'; // URL de tu instancia de Strapi

async function fetchActorMovies() {
  try {
    // Buscar el ID del actor
    const searchResponse = await axios.get(`${BASE_URL}/search/person`, {
      params: {
        api_key: apiTMBDtoken,
        query: nombreActor
      }
    });

    const nombreActor = searchResponse.data.results[0];
    const nombreActorId = nombreActor.id;

    // Obtener las películas en las que ha actuado el actor
    const moviesResponse = await axios.get(`${BASE_URL}/person/${nombreActorId}/movie_credits`, {
      params: {
        api_key: apiTMBDtoken
      }
    });

    const movies = moviesResponse.data.cast.slice(0, 10);

    const movieDetails = await Promise.all(movies.map(async (movie) => {
      const movieResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
        params: {
          api_key: apiTMBDtoken
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

    
    // Enviar los datos a Strapi
    for (const movie of movieDetails) {
      await axios.post(`${STRAPI_URL}/g18peliculas`, {
        data: {
          Titulo: movie.title,
          Sinopsis: movie.synopsis,
          Genero: movie.genres,
          CantVotos: movie.vote_count,
          PromVotos: movie.vote_average,
          Imagen: movie.image
        }
      }, {
        headers: {
          Authorization: `Bearer TU_TOKEN_DE_STRAPI` // Reemplaza 'TU_TOKEN_DE_STRAPI' con tu token de autenticación de Strapi
        }
      });
    }

    console.log('Películas añadidas a Strapi con éxito');
  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
}

fetchTomCruiseMovies();

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
