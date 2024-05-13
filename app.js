document.addEventListener("DOMContentLoaded", function() {
    // Término de búsqueda predeterminado
    const defaultSearchTerm = "anime";
    
    // Llama a la función fetchAnimeData con el término de búsqueda predeterminado
    fetchAnimeData(defaultSearchTerm);
});


// Función para buscar anime
function searchAnime(event) {
    event.preventDefault();
    var searchTerm = document.getElementById("navbarSearchInput").value.trim();
    if (!searchTerm || searchTerm === "") {
        alert("Por favor, introduce un término de búsqueda válido.");
        return;
    }
    fetchAnimeData(searchTerm);
}

// Función para obtener y mostrar los datos de la API
function fetchAnimeData(searchTerm) {
    var query = `
    query ($page: Int, $perPage: Int, $search: String) {
        Page(page: $page, perPage: $perPage) {
            media(search: $search) {
                id
                title {
                    romaji
                }
                coverImage {
                    large
                }
                genres
            }
        }
    }
    `;

    var variables = {
        page: 1,
        perPage: 15,
        search: searchTerm
    };

    var url = 'https://graphql.anilist.co';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (data.errors) {
                alert('Error: ' + data.errors[0].message);
                return;
            }
            document.getElementById("searchResults").innerHTML = "";
            data.data.Page.media.forEach(anime => {
                if (!anime.genres.includes("Hentai")) {
                    var card = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${anime.coverImage.large}" class="card-img-top" alt="${anime.title.romaji}">
                            <div class="card-body">
                                <h5 class="card-title">${anime.title.romaji}</h5>
                                <a href="#" class="btn btn-primary" onclick="viewAnimeDetails(${anime.id})" data-toggle="modal" data-target="#animeModal">Ver detalles</a>
                            </div>
                        </div>
                    </div>
                    `;
                    document.getElementById("searchResults").innerHTML += card;
                }
            });
        })
        .catch(error => console.error('Error:', error));
}

function viewAnimeDetails(animeId) {
    var query = `
    query ($id: Int) {
        Media (id: $id) {
            title {
                romaji
            }
            description(asHtml: true)
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            episodes
            duration
            genres
            coverImage {
                large
            }
        }
    }
    `;

    var variables = {
        id: animeId
    };

    var url = 'https://graphql.anilist.co';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            var anime = data.data.Media;
            var modalBody = `
                <h5>${anime.title.romaji}</h5>
                <img src="${anime.coverImage.large}" class="img-fluid mb-3" alt="${anime.title.romaji}">
                <p><strong>Descripción:</strong> ${anime.description}</p>
                <p><strong>Inicio:</strong> ${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}</p>
                <p><strong>Fin:</strong> ${anime.endDate.year}-${anime.endDate.month}-${anime.endDate.day}</p>
                <p><strong>Episodios:</strong> ${anime.episodes}</p>
                <p><strong>Duración:</strong> ${anime.duration} minutos</p>
                <p><strong>Géneros:</strong> ${anime.genres.join(", ")}</p>
            `;
            document.getElementById("animeModalBody").innerHTML = modalBody;

            setTimeout(function () {
                var myModal = new bootstrap.Modal(document.getElementById('animeModal'));
                myModal.show();
            }, 100);
        })
        .catch(error => console.error('Error:', error));
}

// Función para obtener las recomendaciones de anime de AniList
// Función para obtener las recomendaciones de anime de AniList
async function getAnimeRecommendations() {
    const query = `
        query {
            recommendations(genre: "Action", limit: 10) {
                id
                title {
                    romaji
                }
                coverImage {
                    large
                }
                description
            }
        }
    `;

    const url = 'https://graphql.anilist.co';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.recommendations;
    } catch (error) {
        console.log('Error: ', error);
        return []; // Devolver un array vacío en caso de error
    }
}

getAnimeRecommendations().then(recommendations => {
    // Limitar las recomendaciones a 4
    const recommendationsLimit = 4;
    recommendations.slice(0, recommendationsLimit).forEach(recommendation => {
        // Crear un card de anime
        const card = `
            <div class="col-md-3">
                <div class="card">
                    <img src="${recommendation.image}" class="card-img-top" alt="${recommendation.title}" height="200" />
                    <div class="card-body">
                        <h5 class="card-title">${recommendation.title}</h5>
                        <p class="card-text">${recommendation.description}</p>
                    </div>
                </div>
            </div>
            `;
        // Agregar el card al contenido de la página
        document.querySelector('.row.mb-3').innerHTML += card;
    });
});


document.getElementById("searchForm").addEventListener("submit", searchAnime);

