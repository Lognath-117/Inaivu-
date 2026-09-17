let services = [];
let currentService = null;
let tamilMode = false;


async function loadServices() {

    const response =
        await fetch("/api/services");

    services =
        await response.json();

    displayServices(services);

    loadCategories();
}


async function loadCategories() {

    const response =
        await fetch("/api/categories");

    const categories =
        await response.json();

    const select =
        document.getElementById("category");

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.textContent =
            category;

        select.appendChild(option);

    });
}


function displayServices(data) {

    const container =
        document.getElementById("services");

    const noResults =
        document.getElementById("noResults");

    container.innerHTML = "";

    if (data.length === 0) {

        noResults.style.display =
            "block";

        return;

    }

    noResults.style.display =
        "none";


    data.forEach(service => {

        const card =
            document.createElement("div");

        card.className =
            "service-card";

        card.innerHTML = `

        <p class="category-label">
        ${service.category}
        </p>

        <h3>
        ${service.name}
        </h3>

        <p>
        ${service.description}
        </p>

        <p class="view">
        View Guidance →
        </p>

        `;

        card.onclick =
            () => openService(service.id);

        container.appendChild(card);

    });

}


async function searchServices() {

    const query =
        document
        .getElementById("searchInput")
        .value;

    const category =
        document
        .getElementById("category")
        .value;

    const response =
        await fetch(
            `/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );

    const results =
        await response.json();

    displayServices(results);

}


function quickSearch(query) {

    document
    .getElementById("searchInput")
    .value = query;

    searchServices();

}


async function openService(id) {

    const response =
        await fetch(
            `/api/service/${id}`
        );

    const service =
        await response.json();

    currentService =
        service;

    document
    .getElementById("modalCategory")
    .textContent =
        service.category;

    document
    .getElementById("modalTitle")
    .textContent =
        service.name;

    document
    .getElementById("modalDescription")
    .textContent =
        service.description;


    document
    .getElementById("documents")
    .innerHTML =
        service.documents
        .map(
            document =>
            `<li>${document}</li>`
        )
        .join("");


    document
    .getElementById("steps")
    .innerHTML =
        service.steps
        .map(
            step =>
            `<li>${step}</li>`
        )
        .join("");


    document
    .getElementById("officialLink")
    .href =
        service.official_url;


    document
    .getElementById("modal")
    .style.display =
        "flex";

}


function closeModal() {

    document
    .getElementById("modal")
    .style.display =
        "none";

    speechSynthesis.cancel();

}


function startVoice() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        document
        .getElementById("voiceStatus")
        .textContent =
            "Voice recognition is not supported by this browser.";

        return;

    }


    const recognition =
        new Recognition();


    recognition.lang =
        tamilMode
        ? "ta-IN"
        : "en-IN";


    recognition.interimResults =
        false;


    document
    .getElementById("voiceStatus")
    .textContent =
        "Listening...";


    recognition.onresult =
        function(event) {

        const text =
            event
            .results[0][0]
            .transcript;


        document
        .getElementById("searchInput")
        .value =
            text;


        document
        .getElementById("voiceStatus")
        .textContent =
            "You said: " + text;


        searchServices();

    };


    recognition.onerror =
        function() {

        document
        .getElementById("voiceStatus")
        .textContent =
            "Voice recognition stopped.";

    };


    recognition.start();

}


function speakService() {

    if (!currentService)
        return;


    let text =

        currentService.name +

        ". " +

        currentService.description +

        ". Required documents. " +

        currentService.documents.join(". ") +

        ". Application steps. " +

        currentService.steps.join(". ");


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang =
        tamilMode
        ? "ta-IN"
        : "en-IN";


    speechSynthesis.cancel();

    speechSynthesis.speak(speech);

}


async function shareService() {

    if (!currentService)
        return;


    const text =

`INAIVU

${currentService.name}

${currentService.description}

Steps:

${currentService.steps
.map((step,index)=>
`${index+1}. ${step}`)
.join("\n")}

Official Website:

${currentService.official_url}`;


    if (navigator.share) {

        await navigator.share({

            title:
            "INAIVU - " +
            currentService.name,

            text: text

        });

    }

    else {

        await navigator
        .clipboard
        .writeText(text);

        alert(
            "Service information copied."
        );

    }

}


function toggleLanguage() {

    tamilMode =
        !tamilMode;


    document
    .getElementById("languageBtn")
    .textContent =
        tamilMode
        ? "English"
        : "தமிழ்";


    document
    .getElementById("mainTitle")
    .innerHTML =
        tamilMode
        ? "அரசு சேவைகளை<br>எளிதாகப் பெறுங்கள்."
        : "Government services,<br>made simpler.";


    document
    .getElementById("mainDescription")
    .textContent =
        tamilMode

        ? "உங்களுக்கு தேவையான அரசு சேவையை INAIVU மூலம் எளிதாக கண்டறியுங்கள்."

        : "Tell INAIVU what you need. Find the relevant government service, understand the process and visit the official government portal.";


    document
    .getElementById("question")
    .textContent =
        tamilMode

        ? "உங்களுக்கு எந்த அரசு சேவை தேவை?"

        : "What government service do you need?";


    document
    .getElementById("searchInput")
    .placeholder =
        tamilMode

        ? "உதாரணம்: ஓட்டுநர் உரிமம் வேண்டும்"

        : "Example: I need a driving licence";

}


document
.getElementById("searchInput")
.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            searchServices();

        }

    }
);


window.onclick =
    function(event) {

    const modal =
        document
        .getElementById("modal");

    if (event.target === modal) {

        closeModal();

    }

};


loadServices();
