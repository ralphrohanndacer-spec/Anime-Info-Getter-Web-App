const baseUrl = "https://api.jikan.moe/v4/anime";

const tvBtn = document.getElementById("tvBtn");
const movieBtn = document.getElementById("movieBtn");
const ovaBtn = document.getElementById("ovaBtn");

const imageResult = document.querySelector("#imageResult");
const imageDialog = document.querySelector("dialog");
const dialogContainer = document.querySelector(".dialogContainer");
const imageUrl = document.getElementById("imageUrl");
const infoResult = document.querySelector("#infoResult");
const infoTitle = document.getElementById("title");

const buttons = [tvBtn, movieBtn, ovaBtn];
let type;


for(let button of buttons){
    button.addEventListener("click", async event => {
        const animeTitle = document.getElementById("titleInput").value.trim();

        if (button.id === "tvBtn") {
            type = "tv";
        }
        else if (button.id === "movieBtn") {
            type = "movie";
        }
        else{
            type = "ova";
        }

        if(animeTitle){
            const params = new URLSearchParams({
                q: animeTitle,
                type: type,
                limit: 1
            })
            const url = `${baseUrl}?${params.toString()}`
            try{
                const data = await getAnimeData(url);
                displayAnimeInfo(data);
            }
            catch(error){
                clearContents();
                infoTitle.style.color = "red";
                infoTitle.textContent = error.message;
            }

        }
        else{
            infoTitle.style.color = "red";
            clearContents();
            infoTitle.textContent = "Enter an anime title first!";
        }

    })
}


imageResult.addEventListener("click", event => {
    imageDialog.showModal();
})


imageDialog.addEventListener("click", (e) => {
    if(!dialogContainer.contains(e.target)){
        imageDialog.close();
    }
})


async function getAnimeData(url){
    const response = await fetch(url);
    if(!response.ok){
        throw new Error(displayErrorMessage(response.status));
    }
    const data = await response.json();

    if (data.data.length === 0){
        throw new Error(`Anime ${type} not found.`);
    }
    const anime = data.data[0];

    //Extract and format data
    const rawDate = anime.aired?.from;
  
    return {title: anime.title ?? "Unavailable",
            engTitle: anime.title_english ?? "Unavailable",
            japTitle: anime.title_japanese ?? "Unavailable",
            releasedDate: (rawDate) ? rawDate.split("T")[0] : "Unavailable",
            score: anime.score ?? "Unavailable",
            episodes: anime.episodes ?? "Unavailable",
            themes: anime.themes[0]?.name ?? "Unavailable",
            source: anime.source ?? "Unavailable",
            status: anime.status ?? "Unavailable",
            malId: anime.mal_id ?? "Unavailable",
            synopsis: anime.synopsis ?? "Unavailable",
            imageUrl: anime.images.jpg.large_image_url ?? "Unavailable"
    };
}


function displayAnimeInfo(data){
    //Get elements
    let title = document.getElementById("title");
    let engTitle = document.getElementById("engTitle");
    let japTitle = document.getElementById("japTitle");
    let releasedDate = document.getElementById("releasedDate");
    let score = document.getElementById("score");
    let episodes = document.getElementById("episodes");
    let themes = document.getElementById("themes");
    let source = document.getElementById("source");
    let status = document.getElementById("status");
    let malId = document.getElementById("malId");
    let synopsis = document.getElementById("synopsis");

    if(data.imageUrl !== "Unavailable"){
        document.body.classList.add("setBodyBackgroundImage")
        document.body.style.backgroundImage = `url(${data.imageUrl})`;

        imageResult.classList.add("setElementBackgroundImage");
        imageResult.style.backgroundImage = `url(${data.imageUrl})`;

        imageUrl.href = data.imageUrl;
        imageUrl.target = "_blank";
    }
    else{
        document.body.style.backgroundImage = "";
        imageResult.style.backgroundImage = "";
        imageUrl.href = "";
        imageUrl.target = "_self";
    }


    title.textContent = data.title;
    title.style.color = "hsl(2, 84%, 57%)";

    engTitle.textContent = data.engTitle;
    japTitle.textContent = data.japTitle;
    releasedDate.textContent = data.releasedDate;
    score.textContent = "⭐ " + data.score;
    episodes.textContent = data.episodes;
    themes.textContent = data.themes;
    source.textContent = data.source;
    status.textContent = data.status;
    malId.textContent = data.malId;
    synopsis.textContent = data.synopsis;
}


function displayErrorMessage(status){
    infoTitle.style.color = "red";
    switch(status){
        case 304:
            return "You have the latest data (Cache Validation response)";
        case 400:
            return "You've made an invalid request. Recheck documentation";
        case 404:
            return "The resource was not found or MyAnimeList responded with a 404";
        case 405:
            return "Requested Method is not supported for resource. Only GET requests are allowed"; 
        case 429:
            return "You are being rate limited by Jikan or MyAnimeList is rate-limiting our servers (specified in the error response)";
        case 500:
            return "Something didn't work. Try again later.";
        case 503:
            return "In most cases this is intentionally done if the service is down for maintenance.";
        default:
            return `HTTP Error Occurred: Status code: ${status}`; 
    }
}


function clearContents(){
    document.body.style.backgroundImage = "";
    document.querySelectorAll(".resultElements span").forEach(span => {
    span.textContent = "";
    });
    imageResult.style.backgroundImage = "";
    imageUrl.href = "";
    imageUrl.target = "_self";
}