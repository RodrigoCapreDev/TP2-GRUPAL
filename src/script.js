const apiTMBDtoken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjFjMjRlMzRhOTVlODcyMzM3Zjg1ZTIwZTA0NjVjNCIsIm5iZiI6MTcyMDE5NzUzNS4yOTA4OSwic3ViIjoiNjY4ODAzOTJmNGJiMjQ5OGYzYjBhMmFlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.hJ6wjC2I_Uj_k3Kg5lk65vJ3cLH-Mh7PSgq5U3g6LTk';
const StrapiToken = '099da4cc6cbb36bf7af8de6f1f241f8c81e49fce15709c4cfcae1313090fa2c1ac8703b0179863b4eb2739ea65ae435e90999adb870d49f9f94dcadd88999763119edca01a6b34c25be92a80ed30db1bcacb20df40e4e7f45542bd501f059201ad578c18a11e4f5cd592cb25d6c31a054409caa99f11b6d2391440e9c72611ea';
const BASE_URL = 'https://api.themoviedb.org/3';
const STRAPI_URL = 'https://gestionweb.frlp.utn.edu.ar/api/g18-peliculas'; // URL de tu instancia de Strapi

const actorName = 'Tom Cruise';
let movies = null;

async function fetchActorMovies() {
  try {
    // Obtener ID del actor
    const actorId = await getActorId(actorName);
    // Obtener películas del actor
    const movies = await getActorMovies(actorId);
    // Obtener detalles de las películas
    const movieDetails = await getMovieDetails(movies);

    // Reiniciar CMS (Eliminar datos existentes en Strapi)
    await deleteAllDataFromStrapi();
    // Enviar nuevas películas a Strapi
    await sendMoviesToStrapi(movieDetails);
  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
}

async function getActorId(ActorName) {
  const response = await axios.get(`${BASE_URL}/search/person?query=${ActorName}`, {
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + apiTMBDtoken
    }
  });

  console.log(response);
  return response.data.results[0].id;
}

async function getActorMovies(actorId) {
  const response = await axios.get(`${BASE_URL}/person/${actorId}/movie_credits`, {
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + apiTMBDtoken
    }
  });

  return response.data.cast.slice(0, 10);
}

async function getMovieDetails(movies) {
  return await Promise.all(movies.map(async (movie) => {
    const response = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiTMBDtoken
      }
    });

    const movieData = response.data;

    return {
      title: movieData.title,
      synopsis: movieData.overview,
      genres: movieData.genres.map(genre => genre.name).join(', '),
      vote_count: movieData.vote_count,
      vote_average: movieData.vote_average,
      image: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    };
  }));
}

async function deleteAllDataFromStrapi() {
  const response = await fetch(STRAPI_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + StrapiToken
    }
  });

  if (!response.ok) {
    throw new Error('Error en la solicitud: ' + response.status);
  }

  const data = await response.json();
  console.log('Datos obtenidos:', data);

  for (const item of data.data) {
    const deleteResponse = await fetch(`${STRAPI_URL}/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + StrapiToken
      }
    });

    if (!deleteResponse.ok) {
      throw new Error('Error en la solicitud de eliminación: ' + deleteResponse.status);
    }

    const deleteData = await deleteResponse.json();
    console.log('Datos eliminados:', deleteData);
  }
}

async function sendMoviesToStrapi(movieDetails) {
  for (const movie of movieDetails) {
    const movieData = {
      Titulo: movie.title,
      Sinopsis: movie.synopsis,
      Genero: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
      CantVotos: movie.vote_count,
      PromVotos: Math.round(movie.vote_average),
      Imagen: movie.image
    };

    console.log('Enviando JSON:', JSON.stringify(movieData));

    try {
      const response = await fetch(STRAPI_URL, {
        method: 'POST',
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + StrapiToken
        },
        body: JSON.stringify({ data: movieData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Detalles del error:', errorData);
        throw new Error('Error en la solicitud: ' + response.status);
      }

      const responseData = await response.json();
      console.log('Datos guardados:', responseData);

    } catch (error) {
      console.error('Error uploading pelicula:', error.message);
    }
  }

  alert("Datos cargados a strapi");
}

async function getDataFromStrapi() {
  try {
    const response = await fetch(STRAPI_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + StrapiToken 
      }
    })
    .then(result => result.json())
    .then(data => {
      console.log(data); 
      return data; 
    });

    movies = response.data;
    loadCarousel();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

const carouselInner = document.getElementById('carouselInner');
let currentIndex = 1;

function loadCarousel() {
  let mainSection = '<div class="carousel-item"></div>';
  
  movies.forEach((movie, i) => {
    mainSection += `
      <div class="carousel-item">
        <div class="movie-position">
          <h2>${i + 1}</h2>
        </div>
        <img src="${movie.attributes.Imagen}" alt="Movie Poster">
        <div class="movie-info hidden"> 
          <div class="movie_info_block block_wide">
            <div class="movie_info_tittle"><p>Titulo</p></div>
            <div class="movie_info_text titulo">
              <p>${movie.attributes.Titulo}</p>
            </div>
          </div>
          <div class="movie_info_block block_wide">
            <div class="movie_info_tittle"><p>Sinopsis</p></div>
            <div class="movie_info_text sinopsis">
              <p>${movie.attributes.Sinopsis}</p>
            </div>
          </div>
          <div class="movie_info_block block_wide">
            <div class="movie_info_tittle"><p>Generos</p></div>
            <div class="movie_info_text generos">
              <p>${movie.attributes.Genero}</p>
            </div>
          </div>
          <div class="movie_info_block block_wide">
            <div class="movie_info_tittle"><p>Cant Votos</p></div>
            <div class="movie_info_text cant_votos">
              <p>${movie.attributes.CantVotos}</p>
            </div>
          </div>
          <div class="movie_info_block block_wide">
            <div class="movie_info_tittle"><p>Prom Votos</p></div>
            <div class="movie_info_text prom_votos">
              <p>${movie.attributes.PromVotos}</p>
            </div>
          </div>
        </div>
        <div class="carousel-caption">
          <h3>${movie.attributes.Titulo}</h3>
        </div>
      </div>`;
  });

  mainSection += '<div class="carousel-item"></div>';

  
  // seleccionar carrusel
  const carouselInner = document.querySelector('.carousel-inner');

  if (carouselInner) {
    carouselInner.innerHTML = mainSection;
    showSlide(1);

    document.querySelectorAll('.carousel-item').forEach(item => {
      item.addEventListener('mouseenter', toggleMovieDetails.bind(null, item, true));
      item.addEventListener('mouseleave', toggleMovieDetails.bind(null, item, false));
    });
  }
  
  function toggleMovieDetails(item, show) {
    const movieInfo = item.querySelector('.movie-info');
    const carouselCaption = item.querySelector('.carousel-caption');
    const img = item.querySelector('img');
    //const movieTitle = item.querySelector('.carousel-caption h3');
    const moviePosition = item.querySelector('.movie-position');

    if (movieInfo) movieInfo.classList.toggle('hidden', !show);
    if (carouselCaption) carouselCaption.classList.toggle('hidden', show);
    if (img) img.classList.toggle('hidden', show);
    //if (movieTitle) movieTitle.classList.toggle('hidden', show); // Oculta el título
    if (moviePosition) moviePosition.classList.toggle('hidden', show); // Oculta movie-position
  }
}


function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-item');
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
  }
}

function prevSlide() {
  if (currentIndex == 1) {
      return;
  }
  showSlide(currentIndex - 1);
}

function nextSlide() {
  if (currentIndex == 10) {
      return;
  }
  showSlide(currentIndex + 1);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('logo').addEventListener('click', function() {
    location.reload();
  });
});

document.getElementById('link1').addEventListener('click', function(event) {
  console.log("se clikeo link1");
  fetchActorMovies();
});

document.getElementById('link2').addEventListener('click', function(event) {
  console.log("se clikeo link2");
  getDataFromStrapi();
});
