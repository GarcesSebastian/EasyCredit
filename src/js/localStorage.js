//Variables de estados

let emailNotificationsElements = {
    check_email_movement: document.querySelector("#check_email_movements"),
    check_email_loans: document.querySelector("#check_email_loans"),
    check_email_transfers: document.querySelector("#check_email_transfers"),
    check_email_others: document.querySelector("#check_email_others")
}

let smsNotificationsElements = {
    check_sms_movement: document.querySelector("#check_sms_movements"),
    check_sms_loans: document.querySelector("#check_sms_loans"),
    check_sms_transfers: document.querySelector("#check_sms_transfers"),
    check_sms_others: document.querySelector("#check_sms_others")
}

console.log(emailNotificationsElements, smsNotificationsElements);

window.addEventListener("DOMContentLoaded", () => {
    //Check Notifications Email
    if (localStorage.getItem("emailNotifications")) {
        let emailNotifications = JSON.parse(localStorage.getItem("emailNotifications"));
        for(let key in emailNotifications) {
            const index = Object.keys(emailNotifications).indexOf(key);
            let emailNotificationsElementsArray = Object.values(emailNotificationsElements);
            emailNotificationsElementsArray[index].checked = emailNotifications[key];
        }
    }else{
        localStorage.setItem("emailNotifications", JSON.stringify({
            emailMovements: true,
            emailLoans: true,
            emailTransfers: true,
            emailOthers: true
        }));
        let emailNotifications = JSON.parse(localStorage.getItem("emailNotifications"));
        for(let key in emailNotifications) {
            const index = Object.keys(emailNotifications).indexOf(key);
            let emailNotificationsElementsArray = Object.values(emailNotificationsElements);
            emailNotificationsElementsArray[index].checked = emailNotifications[key];
        }
    }

    //Check Notifications SMS
    if(localStorage.getItem("smsNotifications")) {
        let smsNotifications = JSON.parse(localStorage.getItem("smsNotifications"));
        for(let key in smsNotifications) {
            const index = Object.keys(smsNotifications).indexOf(key);
            let smsNotificationsElementsArray = Object.values(smsNotificationsElements);
            smsNotificationsElementsArray[index].checked = smsNotifications[key];
        }
    }else{
        localStorage.setItem("smsNotifications", JSON.stringify({
            smsMovements: true,
            smsLoans: true,
            smsTransfers: true,
            smsOthers: true
        }));
        let smsNotifications = JSON.parse(localStorage.getItem("smsNotifications"));
        for(let key in smsNotifications) {
            const index = Object.keys(smsNotifications).indexOf(key);
            let smsNotificationsElementsArray = Object.values(smsNotificationsElements);
            smsNotificationsElementsArray[index].checked = smsNotifications[key];
        }
    }

});

//Eventos de los checkbox
for(let key in emailNotificationsElements) {
    emailNotificationsElements[key].addEventListener("change", (e) => {
        console.log("jaskdla");
        let emailNotifications = JSON.parse(localStorage.getItem("emailNotifications"));
        emailNotificationsElements[key].checked = e.target.checked;
        const index = Object.keys(emailNotificationsElements).indexOf(key);
        emailNotifications[Object.keys(emailNotifications)[index]] = e.target.checked;
        localStorage.setItem("emailNotifications", JSON.stringify(emailNotifications));
    });
}

for(let key in smsNotificationsElements) {
    smsNotificationsElements[key].addEventListener("change", (e) => {
        let smsNotifications = JSON.parse(localStorage.getItem("smsNotifications"));
        smsNotificationsElements[key].checked = e.target.checked;
        const index = Object.keys(smsNotificationsElements).indexOf(key);
        smsNotifications[Object.keys(smsNotifications)[index]] = e.target.checked;
        localStorage.setItem("smsNotifications", JSON.stringify(smsNotifications));
    });
}

export {emailNotificationsElements, smsNotificationsElements};