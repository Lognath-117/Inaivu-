let services = [];

let currentService = null;

let tamilMode = false;


/* ================= LOAD DATA ================= */

async function loadServices() {

    try {

        const response =
            await fetch("./services.json");

        if (!response.ok) {

            throw new Error(
                "services.json not found"
            );

        }

        services =
            await response.json();

        loadCategories();

        displayServices(services);

    }

    catch (error) {

        console.error(error);

        document
            .getElementById("servicesGrid")
            .innerHTML = `
                <div class="empty-state"
                     style="display:block;grid-column:1/-1">

                    <h3>
                        Unable to load services
                    </h3>

                    <p>
                        Make sure services.json
                        is uploaded in the repository root.
                    </p>

                </div>
            `;

    }

}


/* ================= CATEGORIES ================= */

function loadCategories() {

    const select =
        document.getElementById(
            "categorySelect"
        );

    const categories = [
        ...new Set(
            services.map(
                service => service.category
            )
        )
    ];

    categories.sort();

    select.innerHTML =
        `<option value="All">
            All Services
        </option>`;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category;

        option.textContent =
            category;

        select.appendChild(option);

    });

}


/* ================= ICONS ================= */

function getIcon(category) {

    const icons = {

        "Identity": "🪪",

        "Travel": "🛂",

        "Transport": "🚗",

        "Elections": "🗳️",

        "Certificates": "📄",

        "Education": "🎓",

        "Employment": "💼",

        "Agriculture": "🌾",

        "Finance": "₹",

        "Tamil Nadu": "🏛️",

        "Food & Civil Supplies": "🍚",

        "Utilities": "⚡"

    };

    return icons[category] || "🏛️";

}


/* ================= DISPLAY SERVICES ================= */

function displayServices(data) {

    const grid =
        document.getElementById(
            "servicesGrid"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );


    grid.innerHTML = "";


    if (data.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    data.forEach(service => {

        const card =
            document.createElement("div");

        card.className =
            "service-card";


        card.innerHTML = `

            <div class="card-top">

                <span class="category">
                    ${escapeHTML(service.category)}
                </span>

                <span class="service-icon">
                    ${getIcon(service.category)}
                </span>

            </div>

            <h3>
                ${escapeHTML(service.name)}
            </h3>

            <p>
                ${escapeHTML(service.description)}
            </p>

            <div class="view-link">
                View Guidance →
            </div>

        `;


        card.addEventListener(
            "click",
            () => openService(service.id)
        );


        grid.appendChild(card);

    });

}


/* ================= SEARCH ================= */

function searchServices() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const query =
        input.value
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "categorySelect"
        ).value;


    let results =
        services.filter(service => {

            if (
                category !== "All" &&
                service.category !== category
            ) {

                return false;

            }


            if (!query) {

                return true;

            }


            const searchableText = [

                service.name,

                service.category,

                service.description,

                ...service.keywords

            ]
            .join(" ")
            .toLowerCase();


            return searchableText
                .includes(query);

        });


    displayServices(results);

}


/* ================= QUICK SEARCH ================= */

function quickSearch(query) {

    document
        .getElementById("searchInput")
        .value = query;

    searchServices();

}


/* ================= OPEN SERVICE ================= */

function openService(id) {

    const service =
        services.find(
            item => item.id === id
        );


    if (!service) {

        return;

    }


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


    const documents =
        document.getElementById(
            "documentsList"
        );


    documents.innerHTML = "";


    service.documents.forEach(
        documentItem => {

            const li =
                document.createElement("li");

            li.textContent =
                documentItem;

            documents.appendChild(li);

        }
    );


    const steps =
        document.getElementById(
            "stepsList"
        );


    steps.innerHTML = "";


    service.steps.forEach(
        step => {

            const li =
                document.createElement("li");

            li.textContent =
                step;

            steps.appendChild(li);

        }
    );


    document
        .getElementById("officialLink")
        .href =
            service.official_url;


    document
        .getElementById("serviceModal")
        .classList
        .add("show");


    document.body.style.overflow =
        "hidden";

}


/* ================= CLOSE MODAL ================= */

function closeModal() {

    document
        .getElementById("serviceModal")
        .classList
        .remove("show");


    document.body.style.overflow =
        "";


    if (
        "speechSynthesis"
        in window
    ) {

        speechSynthesis.cancel();

    }

}


/* ================= VOICE ================= */

function startVoice() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        document
            .getElementById("voiceStatus")
            .textContent =
                "Voice search is not supported. Try Google Chrome.";

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


    recognition.maxAlternatives =
        1;


    document
        .getElementById("voiceStatus")
        .textContent =
            tamilMode
            ? "கேட்கிறேன்..."
            : "Listening...";


    recognition.onresult =
        function(event) {

            const text =
                event
                    .results[0][0]
                    .transcript;


            document
                .getElementById(
                    "searchInput"
                )
                .value =
                    text;


            document
                .getElementById(
                    "voiceStatus"
                )
                .textContent =
                    "You said: " + text;


            searchServices();

        };


    recognition.onerror =
        function() {

            document
                .getElementById(
                    "voiceStatus"
                )
                .textContent =
                    "Voice recognition stopped.";

        };


    recognition.start();

}


/* ================= TEXT TO SPEECH ================= */

function speakService() {

    if (!currentService) {

        return;

    }


    if (!("speechSynthesis" in window)) {

        return;

    }


    const service =
        currentService;


    const text =

        service.name +

        ". " +

        service.description +

        ". Required documents. " +

        service.documents.join(". ") +

        ". Application steps. " +

        service.steps.join(". ");


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        tamilMode
        ? "ta-IN"
        : "en-IN";


    speech.rate =
        0.95;


    speechSynthesis.cancel();

    speechSynthesis.speak(
        speech
    );

}


/* ================= SHARE ================= */

async function shareService() {

    if (!currentService) {

        return;

    }


    const service =
        currentService;


    const text =

`INAIVU

${service.name}

${service.description}

Application Steps:

${service.steps
    .map(
        (step, index) =>
            `${index + 1}. ${step}`
    )
    .join("\n")}

Official Website:

${service.official_url}`;


    if (navigator.share) {

        try {

            await navigator.share({

                title:
                    "INAIVU - " +
                    service.name,

                text:
                    text

            });

        }

        catch (error) {

            console.log(
                "Share cancelled"
            );

        }

    }

    else {

        try {

            await navigator.clipboard
                .writeText(text);

            alert(
                "Service information copied."
            );

        }

        catch {

            alert(
                "Unable to copy information."
            );

        }

    }

}


/* ================= LANGUAGE ================= */

function toggleLanguage() {

    tamilMode =
        !tamilMode;


    const languageButton =
        document.getElementById(
            "languageButton"
        );


    languageButton.textContent =
        tamilMode
        ? "English"
        : "தமிழ்";


    if (tamilMode) {

        document
            .getElementById(
                "heroTitle"
            )
            .innerHTML =
                "அரசு சேவைகளை,<br>எளிதாகப் பெறுங்கள்.";


        document
            .getElementById(
                "heroDescription"
            )
            .textContent =
                "உங்களுக்கு தேவையான அரசு சேவையை INAIVU மூலம் எளிதாக கண்டறிந்து, வழிமுறைகளைப் புரிந்துகொண்டு அதிகாரப்பூர்வ இணையதளத்தை அணுகுங்கள்.";


        document
            .getElementById(
                "searchQuestion"
            )
            .textContent =
                "உங்களுக்கு எந்த அரசு சேவை தேவை?";


        document
            .getElementById(
                "searchInput"
            )
            .placeholder =
                "உதாரணம்: ஓட்டுநர் உரிமம் வேண்டும்";


        document
            .getElementById(
                "voiceStatus"
            )
            .textContent =
                "உங்கள் தேவையை type செய்யலாம் அல்லது பேசலாம்.";

    }

    else {

        document
            .getElementById(
                "heroTitle"
            )
            .innerHTML =
                "Government services,<br>made simpler.";


        document
            .getElementById(
                "heroDescription"
            )
            .textContent =
                "Tell Inaivu what you need. Find the relevant government service, understand the process and visit the official government portal.";


        document
            .getElementById(
                "searchQuestion"
            )
            .textContent =
                "What government service do you need?";


        document
            .getElementById(
                "searchInput"
            )
            .placeholder =
                "Example: I need a driving licence";


        document
            .getElementById(
                "voiceStatus"
            )
            .textContent =
                "You can type or speak your requirement.";

    }

}


/* ================= HTML SECURITY ================= */

function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            function(character) {

                const entities = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };

                return entities[
                    character
                ];

            }
        );

}


/* ================= EVENTS ================= */

document
    .getElementById("searchButton")
    .addEventListener(
        "click",
        searchServices
    );


document
    .getElementById("micButton")
    .addEventListener(
        "click",
        startVoice
    );


document
    .getElementById("topVoiceButton")
    .addEventListener(
        "click",
        startVoice
    );


document
    .getElementById("languageButton")
    .addEventListener(
        "click",
        toggleLanguage
    );


document
    .getElementById("categorySelect")
    .addEventListener(
        "change",
        searchServices
    );


document
    .getElementById("allServicesButton")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "searchInput"
                )
                .value = "";


            document
                .getElementById(
                    "categorySelect"
                )
                .value = "All";


            displayServices(
                services
            );

        }
    );


document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchServices();

            }

        }
    );


document
    .querySelectorAll(
        ".quick-search button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                quickSearch(
                    this.dataset.query
                );

            }
        );

    });


document
    .getElementById("closeButton")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("modalOverlay")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("speakButton")
    .addEventListener(
        "click",
        speakService
    );


document
    .getElementById("shareButton")
    .addEventListener(
        "click",
        shareService
    );


/* ================= START ================= */

loadServices();
