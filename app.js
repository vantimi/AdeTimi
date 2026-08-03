const API_URL =
    "https://script.google.com/macros/s/AKfycbxhRKFreeQmIlEQ-mfIVCFkPHyQpBZLdd7V9ljbhbzE-2q_VhFtHdvFWaKsw1z9oBwFRw/exec";


const GUEST_PROFILE_KEY =
    "weddingGuestProfile";


let currentWeddingData = null;

let countdownInterval = null;



/* =========================
   FIRST LOGIN
========================= */

function welcomeGuest() {

    const nameInput =
        document.getElementById(
            "guestName"
        );

    const continueButton =
        document.getElementById(
            "continueButton"
        );

    const guestName =
        nameInput.value.trim();


    if (!guestName) {

        showWelcomeError(
            "Please enter your name."
        );

        nameInput.focus();

        return;

    }


    clearWelcomeError();


    fetchWeddingData(
        guestName,
        continueButton,
        false
    );

}



/* =========================
   FETCH CURRENT DATA
========================= */

function fetchWeddingData(
    guestName,
    continueButton = null,
    returningGuest = false
) {

    if (continueButton) {

        continueButton.disabled = true;

        continueButton.innerText =
            "Loading...";

    }


    fetch(
        API_URL +
        "?name=" +
        encodeURIComponent(guestName) +
        "&t=" +
        Date.now()
    )

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "API request failed."
            );

        }

        return response.json();

    })

    .then(data => {

        if (!data.success) {

            throw new Error(
                data.error ||
                "The API returned an error."
            );

        }


        const savedProfile =
            getSavedGuestProfile();


        /*
        A returning guest keeps the original
        personal message assigned during
        the first successful visit.
        */

        if (
            returningGuest &&
            savedProfile &&
            savedProfile.message
        ) {

            data.message =
                savedProfile.message;

        }


        const profile = {

            guestName:
                data.guestName ||
                guestName,

            message:
                data.message ||
                "Welcome to our wedding."

        };


        saveGuestProfile(profile);


        displayWeddingData(
            data,
            profile
        );

    })

    .catch(error => {

        console.error(error);


        const savedProfile =
            getSavedGuestProfile();


        if (savedProfile) {

            /*
            The API is needed for the current
            program and countdown data.
            Keep the remembered name visible
            and show an error if it is offline.
            */

            showWelcomeScreen();

            const nameInput =
                document.getElementById(
                    "guestName"
                );

            if (nameInput) {

                nameInput.value =
                    savedProfile.guestName;

            }

        }


        showWelcomeError(
            "The wedding information could not be loaded. Please check your internet connection and try again."
        );

    })

    .finally(() => {

        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.innerText =
                "Continue";

        }

    });

}



/* =========================
   DISPLAY EVERYTHING
========================= */

function displayWeddingData(
    data,
    profile
) {

    currentWeddingData = data;


    renderSettings(
        data.settings || {}
    );


    renderGuestDetails(
        profile
    );


    renderProgram(
        Array.isArray(data.program)
            ? data.program
            : []
    );


    renderHouseRules(
        Array.isArray(data.houseRules)
            ? data.houseRules
            : []
    );


    renderWifi(
        data.settings || {}
    );


    renderContactDetails(
        data.settings || {}
    );


    renderActions(
        Array.isArray(data.actions)
            ? data.actions
            : []
    );


    showGuestScreen();


    startWeddingCountdown();

}



/* =========================
   LOCAL STORAGE
========================= */

function saveGuestProfile(profile) {

    localStorage.setItem(
        GUEST_PROFILE_KEY,
        JSON.stringify(profile)
    );

}


function getSavedGuestProfile() {

    const saved =
        localStorage.getItem(
            GUEST_PROFILE_KEY
        );


    if (!saved) {

        return null;

    }


    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Invalid saved guest profile:",
            error
        );

        localStorage.removeItem(
            GUEST_PROFILE_KEY
        );

        return null;

    }

}


function forgetGuest() {

    localStorage.removeItem(
        GUEST_PROFILE_KEY
    );


    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    const nameInput =
        document.getElementById(
            "guestName"
        );


    if (nameInput) {

        nameInput.value = "";

    }


    showWelcomeScreen();

}



/* =========================
   SCREEN CONTROL
========================= */

function showGuestScreen() {

    const welcomeScreen =
        document.getElementById(
            "welcomeScreen"
        );

    const guestScreen =
        document.getElementById(
            "guestScreen"
        );


    if (welcomeScreen) {

        welcomeScreen.classList.add(
            "hidden"
        );

    }


    if (guestScreen) {

        guestScreen.classList.remove(
            "hidden"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "auto"
    });

}


function showWelcomeScreen() {

    const welcomeScreen =
        document.getElementById(
            "welcomeScreen"
        );

    const guestScreen =
        document.getElementById(
            "guestScreen"
        );


    if (welcomeScreen) {

        welcomeScreen.classList.remove(
            "hidden"
        );

    }


    if (guestScreen) {

        guestScreen.classList.add(
            "hidden"
        );

    }

}



/* =========================
   SETTINGS
========================= */

function renderSettings(settings) {

    setElementText(
        "welcomeTitle",
        settings.WelcomeTitle
    );


    setElementText(
        "welcomeSubtitle",
        settings.WelcomeSubtitle
    );

}



/* =========================
   GUEST DETAILS
========================= */

function renderGuestDetails(profile) {

    setElementText(
        "displayName",
        profile.guestName
    );


    setElementText(
        "personalMessage",
        profile.message
    );

}



/* =========================
   COUNTDOWN
========================= */

function startWeddingCountdown() {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    updateWeddingCountdown();


    countdownInterval =
        setInterval(
            updateWeddingCountdown,
            1000
        );

}


function updateWeddingCountdown() {

    if (!currentWeddingData) {

        return;

    }


    const settings =
        currentWeddingData.settings || {};

    const program =
        Array.isArray(
            currentWeddingData.program
        )
            ? currentWeddingData.program
            : [];


    const weddingDate =
        settings.WeddingDate;

    const timeZone =
        settings.TimeZone ||
        "Europe/Berlin";


    if (!weddingDate) {

        hideElement(
            "countdownCard"
        );

        return;

    }


    const firstTime =
        program.length > 0
            ? program[0].time
            : "2:00 PM";

    const lastTime =
        program.length > 0
            ? program[
                program.length - 1
              ].time
            : "6:00 PM";


    const startDate =
        createZonedDate(
            weddingDate,
            firstTime,
            timeZone
        );

    const endDate =
        createZonedDate(
            weddingDate,
            lastTime,
            timeZone
        );


    const now = new Date();

    const countdownCard =
        document.getElementById(
            "countdownCard"
        );

    const timer =
        document.getElementById(
            "countdownTimer"
        );

    const liveDetails =
        document.getElementById(
            "liveEventDetails"
        );


    countdownCard.classList.remove(
        "is-live",
        "is-finished"
    );


    if (now < startDate) {

        setElementText(
            "countdownStatus",
            "⏳ Wedding begins in"
        );

        setElementText(
            "countdownHeading",
            settings.CoupleNames ||
            "Adeola & Oluwatimileyin"
        );


        timer.classList.remove(
            "hidden"
        );

        liveDetails.classList.add(
            "hidden"
        );


        updateTimerDisplay(
            startDate - now
        );


        setElementText(
            "countdownNote",
            formatWeddingDate(
                startDate,
                timeZone
            )
        );


        updateProgramStatuses(
            -1
        );

        return;

    }


    if (now < endDate) {

        countdownCard.classList.add(
            "is-live"
        );


        setElementText(
            "countdownStatus",
            "🟢 Celebration in progress"
        );

        setElementText(
            "countdownHeading",
            "Celebration ends in"
        );


        timer.classList.remove(
            "hidden"
        );

        liveDetails.classList.remove(
            "hidden"
        );


        updateTimerDisplay(
            endDate - now
        );


        const currentIndex =
            findCurrentProgramIndex(
                program,
                weddingDate,
                timeZone,
                now
            );


        const currentEvent =
            currentIndex >= 0
                ? program[currentIndex]
                : null;

        const nextEvent =
            currentIndex >= 0 &&
            currentIndex + 1 <
                program.length
                ? program[
                    currentIndex + 1
                  ]
                : null;


        if (currentEvent) {

            setElementText(
                "currentEventTitle",
                `${currentEvent.icon || "•"} ${
                    currentEvent.title || ""
                }`
            );

        } else {

            setElementText(
                "currentEventTitle",
                "Wedding celebration"
            );

        }


        const nextEventBlock =
            document.getElementById(
                "nextEventBlock"
            );


        if (nextEvent) {

            nextEventBlock.classList.remove(
                "hidden"
            );

            setElementText(
                "nextEventTitle",
                `${nextEvent.icon || "•"} ${
                    nextEvent.title || ""
                } — ${nextEvent.time || ""}`
            );

        } else {

            nextEventBlock.classList.add(
                "hidden"
            );

        }


        setElementText(
            "countdownNote",
            "The timer ends automatically at 6:00 PM."
        );


        updateProgramStatuses(
            currentIndex
        );

        return;

    }


    countdownCard.classList.add(
        "is-finished"
    );


    setElementText(
        "countdownStatus",
        "❤️ Celebration completed"
    );

    setElementText(
        "countdownHeading",
        "Thank you for celebrating with us"
    );


    timer.classList.add(
        "hidden"
    );

    liveDetails.classList.add(
        "hidden"
    );


    setElementText(
        "countdownNote",
        "We hope you had a wonderful time. Have a safe journey home."
    );


    updateProgramStatuses(
        program.length
    );

}


function updateTimerDisplay(
    milliseconds
) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                milliseconds / 1000
            )
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) /
            3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) /
            60
        );

    const seconds =
        totalSeconds % 60;


    setElementText(
        "countdownDays",
        padNumber(days)
    );

    setElementText(
        "countdownHours",
        padNumber(hours)
    );

    setElementText(
        "countdownMinutes",
        padNumber(minutes)
    );

    setElementText(
        "countdownSeconds",
        padNumber(seconds)
    );

}


function findCurrentProgramIndex(
    program,
    weddingDate,
    timeZone,
    now
) {

    let currentIndex = -1;


    for (
        let i = 0;
        i < program.length;
        i++
    ) {

        const eventDate =
            createZonedDate(
                weddingDate,
                program[i].time,
                timeZone
            );


        if (now >= eventDate) {

            currentIndex = i;

        } else {

            break;

        }

    }


    return currentIndex;

}


function updateProgramStatuses(
    currentIndex
) {

    const items =
        document.querySelectorAll(
            ".program-item"
        );


    items.forEach(
        (item, index) => {

            item.classList.remove(
                "program-current",
                "program-completed"
            );


            const oldBadge =
                item.querySelector(
                    ".program-badge"
                );


            if (oldBadge) {

                oldBadge.remove();

            }


            if (
                currentIndex >=
                items.length
            ) {

                item.classList.add(
                    "program-completed"
                );

                return;

            }


            if (
                index < currentIndex
            ) {

                item.classList.add(
                    "program-completed"
                );

            }


            if (
                index === currentIndex
            ) {

                item.classList.add(
                    "program-current"
                );


                const content =
                    item.querySelector(
                        ".program-content"
                    );


                if (content) {

                    const badge =
                        document.createElement(
                            "span"
                        );

                    badge.className =
                        "program-badge";

                    badge.innerText =
                        "Now";

                    content.appendChild(
                        badge
                    );

                }

            }

        }
    );

}



/* =========================
   TIMEZONE DATE CREATION
========================= */

function createZonedDate(
    dateString,
    timeString,
    timeZone
) {

    const dateParts =
        dateString
            .split("-")
            .map(Number);

    const timeParts =
        parseProgramTime(
            timeString
        );


    const desiredUtc =
        Date.UTC(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2],
            timeParts.hours,
            timeParts.minutes,
            0
        );


    let result =
        new Date(desiredUtc);


    /*
    Two passes correct the UTC date until
    its formatted time in the selected
    timezone matches the required local
    wedding time.
    */

    for (
        let i = 0;
        i < 2;
        i++
    ) {

        const zonedParts =
            getDatePartsInTimezone(
                result,
                timeZone
            );


        const displayedUtc =
            Date.UTC(
                zonedParts.year,
                zonedParts.month - 1,
                zonedParts.day,
                zonedParts.hour,
                zonedParts.minute,
                zonedParts.second
            );


        result =
            new Date(
                result.getTime() +
                (
                    desiredUtc -
                    displayedUtc
                )
            );

    }


    return result;

}


function parseProgramTime(
    timeString
) {

    const match =
        String(timeString)
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
            );


    if (!match) {

        return {
            hours: 0,
            minutes: 0
        };

    }


    let hours =
        Number(match[1]);

    const minutes =
        Number(match[2]);

    const period =
        match[3].toUpperCase();


    if (
        period === "AM" &&
        hours === 12
    ) {

        hours = 0;

    }


    if (
        period === "PM" &&
        hours !== 12
    ) {

        hours += 12;

    }


    return {
        hours: hours,
        minutes: minutes
    };

}


function getDatePartsInTimezone(
    date,
    timeZone
) {

    const formatter =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    timeZone,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hourCycle:
                    "h23"
            }
        );


    const parts =
        formatter.formatToParts(
            date
        );


    const values = {};


    parts.forEach(part => {

        if (
            part.type !==
            "literal"
        ) {

            values[part.type] =
                Number(part.value);

        }

    });


    return values;

}


function formatWeddingDate(
    date,
    timeZone
) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone:
                timeZone,

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    ).format(date);

}



/* =========================
   PROGRAM
========================= */

function renderProgram(program) {

    const programCard =
        document.getElementById(
            "programCard"
        );

    const programList =
        document.getElementById(
            "programList"
        );


    if (
        !programCard ||
        !programList
    ) {

        return;

    }


    programList.innerHTML = "";


    if (program.length === 0) {

        programCard.classList.add(
            "hidden"
        );

        return;

    }


    programCard.classList.remove(
        "hidden"
    );


    program.forEach(item => {

        const programItem =
            document.createElement(
                "div"
            );

        programItem.className =
            "program-item";


        const time =
            document.createElement(
                "div"
            );

        time.className =
            "program-time";

        time.innerText =
            item.time || "";


        const marker =
            document.createElement(
                "div"
            );

        marker.className =
            "program-marker";

        marker.innerText =
            item.icon || "•";


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "program-content";


        const title =
            document.createElement(
                "h3"
            );

        title.className =
            "program-title";

        title.innerText =
            item.title || "";


        content.appendChild(title);

        programItem.appendChild(time);
        programItem.appendChild(marker);
        programItem.appendChild(content);

        programList.appendChild(
            programItem
        );

    });

}



/* =========================
   HOUSE RULES
========================= */

function renderHouseRules(rules) {

    const rulesList =
        document.getElementById(
            "rulesList"
        );


    if (!rulesList) {

        return;

    }


    rulesList.innerHTML = "";


    rules.forEach(rule => {

        const li =
            document.createElement(
                "li"
            );

        li.innerText = rule;

        rulesList.appendChild(li);

    });

}



/* =========================
   WI-FI
========================= */

function renderWifi(settings) {

    const wifi =
        document.getElementById(
            "wifiDetails"
        );


    if (!wifi) {

        return;

    }


    wifi.innerHTML = "";


    if (
        settings.WifiName &&
        settings.WifiPassword
    ) {

        const networkName =
            document.createElement(
                "strong"
            );

        networkName.innerText =
            settings.WifiName;


        const password =
            document.createElement(
                "strong"
            );

        password.innerText =
            settings.WifiPassword;


        wifi.append(
            "Network: ",
            networkName,
            document.createElement("br"),
            document.createElement("br"),
            "Password: ",
            password
        );

    } else {

        wifi.innerText =
            "Wi-Fi details are not available.";

    }

}



/* =========================
   CONTACT DETAILS
========================= */

function renderContactDetails(
    settings
) {

    setElementText(
        "contactName",
        settings.ContactName ||
        "Stanley"
    );


    const contactNumber =
        document.getElementById(
            "contactNumber"
        );


    if (contactNumber) {

        const rawNumber =
            settings.ContactNumber ||
            "+4917684647717";

        const callableNumber =
            normalizePhoneNumber(
                rawNumber
            );


        contactNumber.innerText =
            rawNumber;

        contactNumber.href =
            "tel:" +
            callableNumber;

    }


    const emergencyNumber =
        document.getElementById(
            "emergencyNumber"
        );


    if (emergencyNumber) {

        const emergency =
            settings.EmergencyNumber ||
            "112";


        emergencyNumber.innerText =
            emergency;

        emergencyNumber.href =
            "tel:" +
            emergency;

    }

}


function normalizePhoneNumber(
    number
) {

    const cleaned =
        String(number)
            .replace(
                /[^\d+]/g,
                ""
            );


    if (
        cleaned.startsWith("+")
    ) {

        return cleaned;

    }


    if (
        cleaned.startsWith("49")
    ) {

        return "+" + cleaned;

    }


    if (
        cleaned.startsWith("0")
    ) {

        return (
            "+49" +
            cleaned.substring(1)
        );

    }


    return "+49" + cleaned;

}



/* =========================
   ACTION BUTTONS
========================= */

function renderActions(actions) {

    const container =
        document.getElementById(
            "actionsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    actions.forEach(action => {

        const button =
            document.createElement(
                "a"
            );

        button.className =
            "action-button";

        button.href =
            action.url || "#";

        button.target =
            "_blank";

        button.rel =
            "noopener noreferrer";

        button.innerText =
            (
                action.icon
                    ? action.icon + " "
                    : ""
            ) +
            (
                action.title ||
                "Open"
            );


        container.appendChild(
            button
        );

    });

}



/* =========================
   ERRORS
========================= */

function showWelcomeError(message) {

    const errorElement =
        document.getElementById(
            "welcomeError"
        );


    if (errorElement) {

        errorElement.innerText =
            message;

        errorElement.classList.remove(
            "hidden"
        );

    } else {

        alert(message);

    }

}


function clearWelcomeError() {

    const errorElement =
        document.getElementById(
            "welcomeError"
        );


    if (errorElement) {

        errorElement.innerText = "";

        errorElement.classList.add(
            "hidden"
        );

    }

}



/* =========================
   HELPERS
========================= */

function setElementText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (
        element &&
        value !== undefined &&
        value !== null
    ) {

        element.innerText =
            value;

    }

}


function hideElement(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.classList.add(
            "hidden"
        );

    }

}


function padNumber(number) {

    return String(number)
        .padStart(2, "0");

}



/* =========================
   PAGE STARTUP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const nameInput =
            document.getElementById(
                "guestName"
            );


        if (nameInput) {

            nameInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        welcomeGuest();

                    }

                }
            );

        }


        const savedProfile =
            getSavedGuestProfile();


        if (
            savedProfile &&
            savedProfile.guestName
        ) {

            if (nameInput) {

                nameInput.value =
                    savedProfile.guestName;

            }


            fetchWeddingData(
                savedProfile.guestName,
                null,
                true
            );

        } else {

            showWelcomeScreen();

        }

    }
);