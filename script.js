/* =====================================================
   CONFIGURATION YOUNITI
   ===================================================== */

/*
   MODIFIE CE NOMBRE À TOUT MOMENT
   pour changer le nombre de sièges du bus.
*/
const TOTAL_SIEGES = 20;


/*
   TRAJETS ET TARIFS

   Tu peux ajouter autant de trajets que tu veux.
*/
const trajets = [
    {
        depart: "Cotonou",
        destination: "Natitingou",
        prix: 7000
    },

    {
        depart: "Natitingou",
        destination: "Cotonou",
        prix: 7000
    },

    {
        depart: "Cotonou",
        destination: "Parakou",
        prix: 5000
    },

    {
        depart: "Parakou",
        destination: "Cotonou",
        prix: 5000
    },
    {
        depart: "Natitingou",
        destination: "Parakou",
        prix: 5000
    },

    {
        depart: "Cotonou",
        destination: "Bohicon",
        prix: 2500
    },

    {
        depart: "Bohicon",
        destination: "Cotonou",
        prix: 2500
    }
];


/*
   HORAIRES DE DEPART

   L'heure affichée sur le ticket dépend de la ville de
   départ et du type de voyage (jour/nuit).

   Ajoute une ville ici si besoin ; sinon l'heure par
   défaut du type de voyage est utilisée.
*/
const horairesDepart = {

    jour: {
        Cotonou: "07:00",
        Natitingou: "07:00"
    },

    nuit: {
        Cotonou: "19:30",
        Natitingou: "19:30"
    }

};


/* =====================================================
   ELEMENTS
   ===================================================== */

const departSelect = document.getElementById("depart");
const destinationSelect = document.getElementById("destination");

const dateVoyage = document.getElementById("dateVoyage");

const seatMap = document.getElementById("seatMap");

const availableCount = document.getElementById("availableCount");

const priceElement = document.getElementById("price");

const summaryRoute = document.getElementById("summaryRoute");
const summaryType = document.getElementById("summaryType");

const form = document.getElementById("reservationForm");
const reserveBtn = document.getElementById("reserveBtn");

const ticketModal = document.getElementById("ticketModal");
const closeTicket = document.getElementById("closeTicket");

const telSection = document.getElementById("telSection");
const telClient = document.getElementById("telClient");
const operateurChoisi = document.getElementById("operateurChoisi");


let typeVoyage = "jour";
let siegeSelectionne = null;
let moyenPaiement = null;
let numeroTelephone = null;


/* =====================================================
   INITIALISATION
   ===================================================== */

function initialiser() {

    remplirDepartements();

    afficherSieges();

    afficherTarifs();

    definirDateMinimum();

}

initialiser();


/* =====================================================
   DEPARTS
   ===================================================== */

function remplirDepartements() {

    const villes = [...new Set(
        trajets.flatMap(t => [t.depart, t.destination])
    )];

    departSelect.innerHTML =
        `<option value="">Choisir</option>`;

    villes.forEach(ville => {

        const option = document.createElement("option");

        option.value = ville;
        option.textContent = ville;

        departSelect.appendChild(option);

    });

}


/* =====================================================
   DESTINATIONS
   ===================================================== */

departSelect.addEventListener("change", () => {

    destinationSelect.innerHTML =
        `<option value="">Choisir</option>`;

    const destinations = trajets
        .filter(t => t.depart === departSelect.value)
        .map(t => t.destination);

    destinations.forEach(destination => {

        const option = document.createElement("option");

        option.value = destination;
        option.textContent = destination;

        destinationSelect.appendChild(option);

    });

    mettreAJourPrix();

    afficherSieges();

});


/* =====================================================
   PRIX
   ===================================================== */

destinationSelect.addEventListener("change", () => {

    mettreAJourPrix();

    afficherSieges();

});


function trouverTrajet() {

    return trajets.find(t =>
        t.depart === departSelect.value &&
        t.destination === destinationSelect.value
    );

}


function mettreAJourPrix() {

    const trajet = trouverTrajet();

    if (!trajet) {

        priceElement.textContent = "0 FCFA";

        summaryRoute.textContent = "—";

        return;
    }

    priceElement.textContent =
        trajet.prix.toLocaleString("fr-FR") + " FCFA";

    summaryRoute.textContent =
        `${trajet.depart} → ${trajet.destination}`;

}


/* =====================================================
   JOUR / NUIT
   ===================================================== */

document.querySelectorAll(".travel-type").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".travel-type")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        typeVoyage = button.dataset.type;

        summaryType.textContent =
            typeVoyage === "jour"
                ? "☀️ Voyage de jour"
                : "🌙 Voyage de nuit";

        afficherSieges();

    });

});


/* =====================================================
   MOYEN DE PAIEMENT
   ===================================================== */

document.querySelectorAll(".payment-method").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".payment-method")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        moyenPaiement = button.dataset.payment;

        telSection.style.display = "block";
        operateurChoisi.textContent = `(${moyenPaiement})`;

        telClient.focus();

    });

});


/* =====================================================
   VALIDATION DU NUMERO
   ===================================================== */

function numeroValide(numero) {

    return /^01\d{8}$/.test(numero);

}


/* =====================================================
   HEURE DE DEPART (calculée, plus de choix manuel)
   ===================================================== */

function determinerHeureDepart() {

    const heuresDuType = horairesDepart[typeVoyage];

    return heuresDuType[departSelect.value]
        || (typeVoyage === "jour" ? "07:00" : "19:30");

}


/* =====================================================
   DATE
   ===================================================== */

function definirDateMinimum() {

    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();

    const mois = String(
        aujourdHui.getMonth() + 1
    ).padStart(2, "0");

    const jour = String(
        aujourdHui.getDate()
    ).padStart(2, "0");

    const dateMinimum =
        `${annee}-${mois}-${jour}`;

    dateVoyage.min = dateMinimum;

}


/* =====================================================
   SYSTEME DES SIEGES
   ===================================================== */

/*
   Chaque combinaison possède ses propres sièges.

   Exemple :

   Cotonou-Natitingou
   + jour
   + date du voyage

   est différente de :

   Cotonou-Natitingou
   + nuit
   + même date
*/


function cleReservation() {

    return [
        departSelect.value,
        destinationSelect.value,
        typeVoyage,
        dateVoyage.value
    ].join("_");

}


function recupererSiegesOccupes() {

    const cle = cleReservation();

    if (
        !departSelect.value ||
        !destinationSelect.value ||
        !dateVoyage.value
    ) {
        return [];
    }

    const reservations =
        JSON.parse(
            localStorage.getItem("younitiReservations") || "{}"
        );

    return reservations[cle] || [];

}


function afficherSieges() {

    seatMap.innerHTML = "";

    siegeSelectionne = null;

    const occupes = recupererSiegesOccupes();

    let disponibles = 0;


    for (let i = 1; i <= TOTAL_SIEGES; i++) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "seat";

        button.textContent = i;


        if (occupes.includes(i)) {

            button.classList.add("occupied");

            button.disabled = true;

        } else {

            disponibles++;

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".seat")
                    .forEach(s =>
                        s.classList.remove("selected")
                    );

                button.classList.add("selected");

                siegeSelectionne = i;

                document.getElementById("seatInfo")
                    .textContent =
                    `Siège ${i} sélectionné`;

            });

        }


        seatMap.appendChild(button);

    }


    availableCount.textContent = disponibles;

}


/* =====================================================
   CHANGEMENT DATE / HEURE
   ===================================================== */

dateVoyage.addEventListener(
    "change",
    afficherSieges
);


/* =====================================================
   RESERVATION + PAIEMENT
   ===================================================== */

form.addEventListener("submit", function(e) {

    e.preventDefault();


    const nom =
        document.getElementById("nom").value.trim();


    if (!siegeSelectionne) {

        alert("Veuillez choisir un numéro de siège.");

        return;

    }


    const trajet = trouverTrajet();

    if (!trajet) {

        alert("Veuillez sélectionner un trajet.");

        return;

    }


    if (!dateVoyage.value) {

        alert("Veuillez choisir la date du voyage.");

        return;

    }


    if (!moyenPaiement) {

        alert("Veuillez choisir un opérateur de paiement (MTN, MOOV ou CELTIIS).");

        return;

    }


    numeroTelephone = telClient.value.trim();

    if (!numeroValide(numeroTelephone)) {

        alert("Veuillez entrer un numéro Mobile Money valide (10 chiffres, commençant par 01).");

        return;

    }


    /* Anti double réservation, vérifié avant de lancer le paiement */

    const cle = cleReservation();

    const reservations =
        JSON.parse(
            localStorage.getItem("younitiReservations") || "{}"
        );

    if (!reservations[cle]) {

        reservations[cle] = [];

    }

    if (
        reservations[cle].includes(siegeSelectionne)
    ) {

        alert(
            "Ce siège vient malheureusement d'être réservé."
        );

        afficherSieges();

        return;

    }


    /* =====================================================
       ÉTAPE PAIEMENT

       Pour l'instant, cette étape est simulée (délai de 1,5s)
       pour représenter la demande de paiement Mobile Money.

       Quand l'intégration MTN / MOOV / CELTIIS sera prête,
       remplace le setTimeout ci-dessous par ton véritable
       appel à l'API de paiement, et n'appelle
       validerPaiement(...) que lorsque l'opérateur confirme
       que la transaction a réussi.
       ===================================================== */

    reserveBtn.disabled = true;
    reserveBtn.innerHTML = "Vérification du paiement...";

    setTimeout(() => {

        validerPaiement(nom, trajet, cle, reservations);

    }, 1500);

});


function validerPaiement(nom, trajet, cle, reservations) {

    reservations[cle].push(
        siegeSelectionne
    );

    localStorage.setItem(
        "younitiReservations",
        JSON.stringify(reservations)
    );

    genererTicket(nom, trajet);

    reserveBtn.disabled = false;
    reserveBtn.innerHTML = `Payer et réserver <span>→</span>`;

}


/* =====================================================
   GENERATION DU TICKET
   ===================================================== */

function genererTicket(nom, trajet) {

    const dateReservation =
        new Date();


    const dateVoyageFormatee =
        formaterDate(dateVoyage.value);


    const dateReservationFormatee =
        dateReservation.toLocaleDateString(
            "fr-FR"
        )
        + " à "
        + dateReservation.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    document.getElementById("ticketNom")
        .textContent = nom;


    document.getElementById("ticketDepart")
        .textContent = trajet.depart;


    document.getElementById("ticketDestination")
        .textContent = trajet.destination;


    document.getElementById("ticketSiege")
        .textContent = siegeSelectionne;


    document.getElementById("ticketPaiement")
        .textContent = `${moyenPaiement} • ${numeroTelephone}`;


    document.getElementById("ticketDate")
        .textContent = dateVoyageFormatee;


    document.getElementById("ticketHeure")
        .textContent = determinerHeureDepart();


    document.getElementById("ticketPrix")
        .textContent =
        trajet.prix.toLocaleString("fr-FR")
        + " FCFA";


    document.getElementById("ticketType")
        .textContent =
        typeVoyage === "jour"
            ? "☀️ JOUR"
            : "🌙 NUIT";


    document.getElementById(
        "ticketReservationDate"
    ).textContent = dateReservationFormatee;


    ticketModal.classList.add("show");


    reinitialiserFormulaire();

}


/* =====================================================
   REINITIALISATION APRES RESERVATION
   ===================================================== */

function reinitialiserFormulaire() {

    afficherSieges();

    document
        .querySelectorAll(".payment-method")
        .forEach(btn => btn.classList.remove("active"));

    moyenPaiement = null;
    numeroTelephone = null;

    telClient.value = "";
    telSection.style.display = "none";

}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formaterDate(date) {

    const [annee, mois, jour] =
        date.split("-");

    const dateObj =
        new Date(
            annee,
            mois - 1,
            jour
        );

    return dateObj.toLocaleDateString(
        "fr-FR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   FERMER LE TICKET
   ===================================================== */

closeTicket.addEventListener(
    "click",
    () => {

        ticketModal.classList.remove("show");

    }
);


ticketModal.addEventListener(
    "click",
    e => {

        if (e.target === ticketModal) {

            ticketModal.classList.remove("show");

        }

    }
);


/* =====================================================
   AFFICHAGE DES TARIFS
   ===================================================== */

function afficherTarifs() {

    const container =
        document.getElementById("tarifsGrid");

    container.innerHTML = "";


    trajets.forEach(trajet => {

        const card =
            document.createElement("div");

        card.className = "tarif-card";

        card.innerHTML = `

            <div class="route">
                ${trajet.depart}
                <span class="arrow">→</span>
                ${trajet.destination}
            </div>

            <div class="price">
                ${trajet.prix.toLocaleString("fr-FR")}
                FCFA
            </div>

        `;

        container.appendChild(card);

    });

}