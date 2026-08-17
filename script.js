/* =========================================================
   YOUNITI — JAVASCRIPT
   ========================================================= */


/* =========================================================
   TARIFS

   MODIFIE UNIQUEMENT LES CHIFFRES ICI POUR CHANGER LES PRIX.
   ========================================================= */

const TARIFFS = {

    "Cotonou-Natitingou": {

        "07:00": 7000,       // À MODIFIER : tarif matin

        "19:30": 6500        // À MODIFIER : tarif soir
    },


    "Natitingou-Cotonou": {

        "07:00": 7000,       // À MODIFIER : tarif matin

        "19:30": 6500        // À MODIFIER : tarif soir
    }

};


/* =========================================================
   NOMBRE DE SIÈGES
   ========================================================= */

const TOTAL_SEATS = 60;


/* =========================================================
   EMAIL

   Pour l'envoi automatique réel du ticket, renseigne ici
   ton endpoint Formspree ou ton propre backend.

   Exemple :
   const EMAIL_ENDPOINT = "https://formspree.io/f/xxxxxxxx";

   Laisser vide = le billet s'affiche normalement,
   mais aucun email automatique ne sera envoyé.
   ========================================================= */

const EMAIL_ENDPOINT = ""; // À MODIFIER


/* =========================================================
   STOCKAGE DES RÉSERVATIONS

   Cette version bloque les sièges dans le navigateur.

   Pour que le blocage soit visible chez TOUS les clients,
   il faudra ensuite connecter Supabase/Firebase.
   ========================================================= */

const STORAGE_KEY =
    "youniti_paid_reservations_v1";


/* =========================================================
   VARIABLES
   ========================================================= */

const departure =
    document.getElementById("departure");

const arrival =
    document.getElementById("arrival");

const travelDate =
    document.getElementById("travelDate");

const travelTimeInputs =
    document.querySelectorAll(
        'input[name="travelTime"]'
    );

const seatContainer =
    document.getElementById("seatContainer");

const currentPrice =
    document.getElementById("currentPrice");

const selectedSeatsElement =
    document.getElementById("selectedSeats");

const seatCountElement =
    document.getElementById("seatCount");

const totalPriceElement =
    document.getElementById("totalPrice");

const summaryRoute =
    document.getElementById("summaryRoute");

const summaryDate =
    document.getElementById("summaryDate");

const summaryTime =
    document.getElementById("summaryTime");

const summarySeats =
    document.getElementById("summarySeats");

const summaryTotal =
    document.getElementById("summaryTotal");


let selectedSeats = [];


/* =========================================================
   DATE MINIMUM
   ========================================================= */

const today =
    new Date()
        .toISOString()
        .split("T")[0];

travelDate.min = today;


/* =========================================================
   RÉCUPÉRER LES RÉSERVATIONS
   ========================================================= */

function getReservations() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   ENREGISTRER LES RÉSERVATIONS
   ========================================================= */

function saveReservations(reservations) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reservations)
    );

}


/* =========================================================
   IDENTIFIANT DU VOYAGE

   Date + départ + arrivée + heure
   ========================================================= */

function tripKey() {

    return `${travelDate.value}|${departure.value}|${arrival.value}|${getSelectedTime()}`;

}


/* =========================================================
   TROUVER LES SIÈGES DÉJÀ BLOQUÉS
   POUR LE VOYAGE CHOISI
   ========================================================= */

function getLockedSeatsForCurrentTrip() {

    const key =
        tripKey();

    const reservations =
        getReservations();

    const locked = [];


    reservations.forEach(
        reservation => {

            if (
                reservation.tripKey === key
            ) {

                reservation.seats.forEach(
                    seat => {

                        locked.push(
                            Number(seat)
                        );

                    }
                );

            }

        }
    );


    return [
        ...new Set(locked)
    ];

}


/* =========================================================
   CRÉATION DES SIÈGES
   ========================================================= */

function createSeats() {

    seatContainer.innerHTML = "";

    selectedSeats = [];


    const lockedSeats =
        getLockedSeatsForCurrentTrip();


    for (
        let number = 1;
        number <= TOTAL_SEATS;
        number++
    ) {

        const seat =
            document.createElement("button");


        seat.type = "button";

        seat.className = "seat";

        seat.textContent = number;

        seat.dataset.seat = number;


        /* Si le siège est déjà réservé */

        if (
            lockedSeats.includes(number)
        ) {

            seat.classList.add(
                "occupied"
            );

            seat.disabled = true;

            seat.title =
                "Place déjà réservée";

        }


        /* Cliquer sur le siège */

        seat.addEventListener(
            "click",
            () => {

                toggleSeat(
                    number,
                    seat
                );

            }
        );


        seatContainer.appendChild(
            seat
        );

    }


    updateSummary();

}


/* =========================================================
   SÉLECTION / DÉSÉLECTION D'UN SIÈGE
   ========================================================= */

function toggleSeat(
    number,
    seat
) {

    if (
        selectedSeats.includes(number)
    ) {

        selectedSeats =
            selectedSeats.filter(
                n => n !== number
            );

        seat.classList.remove(
            "selected"
        );

    } else {

        selectedSeats.push(number);

        seat.classList.add(
            "selected"
        );

    }


    selectedSeats.sort(
        (a, b) => a - b
    );


    updateSummary();

}


/* =========================================================
   RÉCUPÉRER L'HORAIRE
   ========================================================= */

function getSelectedTime() {

    const selected =
        document.querySelector(
            'input[name="travelTime"]:checked'
        );


    return selected
        ? selected.value
        : null;

}


/* =========================================================
   RÉCUPÉRER LE TARIF
   ========================================================= */

function getCurrentPrice() {

    const from =
        departure.value;

    const to =
        arrival.value;

    const time =
        getSelectedTime();


    if (
        !from ||
        !to ||
        !time ||
        from === to
    ) {

        return 0;

    }


    const route =
        `${from}-${to}`;


    if (
        TARIFFS[route] &&
        TARIFFS[route][time]
    ) {

        return TARIFFS[route][time];

    }


    return 0;

}


/* =========================================================
   AFFICHER LE TARIF
   ========================================================= */

function updatePrice() {

    const price =
        getCurrentPrice();


    if (price > 0) {

        currentPrice.textContent =
            `${price.toLocaleString("fr-FR")} FCFA`;

    } else {

        currentPrice.textContent =
            "-- FCFA";

    }


    updateSummary();

}


/* =========================================================
   METTRE À JOUR LE RÉSUMÉ
   ========================================================= */

function updateSummary() {

    const price =
        getCurrentPrice();


    const total =
        price *
        selectedSeats.length;


    /* Sièges */

    selectedSeatsElement.textContent =
        selectedSeats.length
            ? selectedSeats.join(", ")
            : "Aucun";


    seatCountElement.textContent =
        selectedSeats.length;


    totalPriceElement.textContent =
        `${total.toLocaleString("fr-FR")} FCFA`;


    summaryTotal.textContent =
        `${total.toLocaleString("fr-FR")} FCFA`;


    /* Trajet */

    summaryRoute.textContent =
        departure.value &&
        arrival.value
            ? `${departure.value} → ${arrival.value}`
            : "—";


    /* Date */

    summaryDate.textContent =
        travelDate.value
            ? formatDate(
                travelDate.value
            )
            : "—";


    /* Heure */

    summaryTime.textContent =
        getSelectedTime() ||
        "—";


    /* Résumé des sièges */

    summarySeats.textContent =
        selectedSeats.length
            ? selectedSeats.join(", ")
            : "Aucun";

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "—";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   ACTUALISER LE VOYAGE

   À chaque changement :
   - trajet
   - date
   - heure

   Les sièges bloqués sont rechargés.
   ========================================================= */

function refreshTrip() {

    if (
        departure.value ===
        arrival.value &&
        departure.value !== ""
    ) {

        alert(
            "Le départ et l'arrivée doivent être différents."
        );

        arrival.value = "";

    }


    updatePrice();

    createSeats();

}


departure.addEventListener(
    "change",
    refreshTrip
);


arrival.addEventListener(
    "change",
    refreshTrip
);


travelDate.addEventListener(
    "change",
    refreshTrip
);


travelTimeInputs.forEach(
    input => {

        input.addEventListener(
            "change",
            refreshTrip
        );

    }
);


/* =========================================================
   INVERSER LES VILLES
   ========================================================= */

document
    .getElementById("swapCities")
    .addEventListener(
        "click",
        () => {

            const oldDeparture =
                departure.value;


            departure.value =
                arrival.value;


            arrival.value =
                oldDeparture;


            refreshTrip();

        }
    );


/* =========================================================
   IDENTIFIANT DU BILLET
   ========================================================= */

function generateTicketId() {

    const random =
        Math.floor(
            100000 +
            Math.random() *
            900000
        );


    return `YNT-${Date.now()
        .toString()
        .slice(-6)}-${random}`;

}


/* =========================================================
   ENVOI DU TICKET PAR EMAIL
   ========================================================= */

async function sendTicketEmail(
    ticketData
) {

    if (!EMAIL_ENDPOINT) {

        return {
            sent: false,
            message:
                "Aucun service d'e-mail configuré."
        };

    }


    try {

        const response =
            await fetch(
                EMAIL_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({

                        subject:
                            `Billet YOUNITI — ${ticketData.ticketId}`,

                        email:
                            ticketData.email,

                        ticket_id:
                            ticketData.ticketId,

                        passenger:
                            ticketData.passenger,

                        route:
                            `${ticketData.departure} → ${ticketData.arrival}`,

                        date:
                            ticketData.date,

                        time:
                            ticketData.time,

                        seats:
                            ticketData.seats.join(", "),

                        payment:
                            ticketData.payment,

                        total:
                            `${ticketData.total.toLocaleString("fr-FR")} FCFA`,

                        message:
                            `Billet YOUNITI ${ticketData.ticketId}. ` +
                            `Passager: ${ticketData.passenger}. ` +
                            `Trajet: ${ticketData.departure} → ${ticketData.arrival}. ` +
                            `Date: ${ticketData.date}. ` +
                            `Heure: ${ticketData.time}. ` +
                            `Siège(s): ${ticketData.seats.join(", ")}. ` +
                            `Total: ${ticketData.total.toLocaleString("fr-FR")} FCFA.`

                    })

                }
            );


        return {

            sent:
                response.ok,

            message:
                response.ok
                    ? "Ticket envoyé."
                    : "L'envoi a échoué."

        };


    } catch (error) {

        return {

            sent: false,

            message:
                "Impossible de contacter le service d'e-mail."

        };

    }

}


/* =========================================================
   AFFICHER LE BILLET
   ========================================================= */

function showTicket(
    ticketData
) {

    document.getElementById(
        "ticketDeparture"
    ).textContent =
        ticketData.departure;


    document.getElementById(
        "ticketArrival"
    ).textContent =
        ticketData.arrival;


    document.getElementById(
        "ticketPassenger"
    ).textContent =
        ticketData.passenger;


    document.getElementById(
        "ticketPhone"
    ).textContent =
        ticketData.phone;


    document.getElementById(
        "ticketEmail"
    ).textContent =
        ticketData.email;


    document.getElementById(
        "ticketDate"
    ).textContent =
        ticketData.date;


    document.getElementById(
        "ticketTime"
    ).textContent =
        ticketData.time;


    document.getElementById(
        "ticketSeats"
    ).textContent =
        ticketData.seats.join(", ");


    document.getElementById(
        "ticketPayment"
    ).textContent =
        ticketData.payment;


    document.getElementById(
        "ticketTotal"
    ).textContent =
        `${ticketData.total.toLocaleString("fr-FR")} FCFA`;


    document
        .getElementById("ticketModal")
        .classList.add("show");

}


/* =========================================================
   FORMULAIRE

   Le billet est généré uniquement après confirmation
   du paiement.
   ========================================================= */

document
    .getElementById("reservationForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* Vérifier les sièges */

            if (
                selectedSeats.length === 0
            ) {

                alert(
                    "Veuillez sélectionner au moins un siège."
                );

                return;

            }


            /* Vérifier le prix */

            const price =
                getCurrentPrice();


            if (price === 0) {

                alert(
                    "Le tarif de ce trajet n'est pas encore configuré."
                );

                return;

            }


            /* Vérifier la confirmation du paiement */

            const paymentConfirmed =
                document.getElementById(
                    "paymentConfirmed"
                ).checked;


            if (!paymentConfirmed) {

                alert(
                    "Veuillez confirmer le paiement avant de générer le billet."
                );

                return;

            }


            /* Vérifier une dernière fois les places */

            const lockedSeats =
                getLockedSeatsForCurrentTrip();


            const conflict =
                selectedSeats.some(
                    seat =>
                        lockedSeats.includes(
                            seat
                        )
                );


            if (conflict) {

                alert(
                    "Une des places sélectionnées vient d'être réservée. Choisissez une autre place."
                );

                createSeats();

                return;

            }


            /* Informations du client */

            const passengerName =
                document.getElementById(
                    "passengerName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const payment =
                document.getElementById(
                    "paymentMethod"
                ).value;


            const time =
                getSelectedTime();


            const total =
                price *
                selectedSeats.length;


            const ticketId =
                generateTicketId();


            /* Données du billet */

            const ticketData = {

                ticketId,

                tripKey:
                    tripKey(),

                passenger:
                    passengerName,

                phone,

                email,

                departure:
                    departure.value,

                arrival:
                    arrival.value,

                date:
                    formatDate(
                        travelDate.value
                    ),

                time,

                seats:
                    [...selectedSeats],

                payment,

                total

            };


            /* =================================================
               BLOQUER LES PLACES APRÈS LE PAIEMENT
               ================================================= */

            const reservations =
                getReservations();


            reservations.push(
                ticketData
            );


            saveReservations(
                reservations
            );


            /* Actualiser les sièges */

            createSeats();


            /* Générer le billet */

            showTicket(
                ticketData
            );


            /* Envoyer le ticket par email */

            const emailResult =
                await sendTicketEmail(
                    ticketData
                );


            if (
                emailResult.sent
            ) {

                alert(
                    "Paiement confirmé : le billet a été généré et envoyé à votre adresse e-mail."
                );

            } else {

                alert(
                   "Paiement confirmé : le billet a été généré. " +
                    "Veuillez vérifier votre boîte mail si le service d'e-mail est configuré."
                );

            }

        }
    );


/* =========================================================
   FERMER LE BILLET
   ========================================================= */

document
    .getElementById("closeTicket")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "ticketModal"
                )
                .classList.remove(
                    "show"
                );

        }
    );


/* =========================================================
   FERMER EN CLIQUANT À L'EXTÉRIEUR
   ========================================================= */

document
    .getElementById("ticketModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                event.currentTarget
            ) {

                event.currentTarget
                    .classList.remove(
                        "show"
                    );

            }

        }
    );


/* =========================================================
   IMPRESSION
   ========================================================= */

document
    .getElementById("printTicket")
    .addEventListener(
        "click",
        () => {

            window.print();

        }
    );


/* =========================================================
   INITIALISATION
   ========================================================= */

createSeats();

updatePrice();