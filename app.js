const API_URL = "https://script.google.com/macros/s/AKfycbxRp30PWubIX9FOOMJBvn0vFxaSgT7NS8WPNrWnX3ggg06GAGFD_OUEENSTElQOGYvl1w/exec";


function welcomeGuest() {


    const nameInput =
        document.getElementById("guestName");


    const guestName =
        nameInput.value.trim();



    if (!guestName) {

        alert("Please enter your name");

        return;

    }



    fetch(
        API_URL + "?name=" + encodeURIComponent(guestName)
    )


    .then(response => response.json())


    .then(data => {


        console.log(data);



        // Hide welcome screen

        document
        .getElementById("welcomeScreen")
        .classList
        .add("hidden");



        // Show guest screen

        document
        .getElementById("guestScreen")
        .classList
        .remove("hidden");



        // Guest name

        document
        .getElementById("displayName")
        .innerText =
        data.guestName;



        // Personal message

        document
        .getElementById("personalMessage")
        .innerText =
        data.message;



        // Welcome title

        if(data.settings.WelcomeTitle){

            document
            .getElementById("welcomeTitle")
            .innerText =
            data.settings.WelcomeTitle;

        }



        // Subtitle

        if(data.settings.WelcomeSubtitle){

            document
            .getElementById("welcomeSubtitle")
            .innerText =
            data.settings.WelcomeSubtitle;

        }



        // WiFi

        const wifi =
        document.getElementById("wifiDetails");


        if(
            data.settings.WifiName &&
            data.settings.WifiPassword
        ){

            wifi.innerHTML =
            `
            Network:
            <strong>${data.settings.WifiName}</strong>
            <br><br>

            Password:
            <strong>${data.settings.WifiPassword}</strong>
            `;

        }




        // House Rules

        const rulesList =
        document.getElementById("rulesList");


        rulesList.innerHTML = "";


        data.houseRules.forEach(rule => {


            const li =
            document.createElement("li");


            li.innerText = rule;


            rulesList.appendChild(li);


        });




        // Actions

        const actionsContainer =
        document.getElementById("actionsContainer");


        actionsContainer.innerHTML = "";



        data.actions.forEach(action => {


            const button =
            document.createElement("a");


            button.className =
            "action-button";


            button.href =
            action.url;


            button.target =
            "_blank";


            button.innerHTML =
            `
            ${action.icon}
            ${action.title}
            `;


            actionsContainer.appendChild(button);


        });



    })


    .catch(error => {


        console.error(error);


        alert(
        "Something went wrong. Please try again."
        );


    });


}