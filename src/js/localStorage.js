import { sendActivityNotificationEmail } from "./Notifications";

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

window.addEventListener("DOMContentLoaded", async () => {
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

    //Check Notifications EasyCredit
    if(localStorage.getItem("easyCreditNotifications") == null) {
        localStorage.setItem("easyCreditNotifications", 0);
    }

    //Check Others Activity Notification EasyCredit
    if(localStorage.getItem("activityNotifications") == null){
        localStorage.setItem("activityNotifications", "false");
    }

    if(localStorage.getItem("activityNotifications") == "false"){
        let data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
        let response_data_user = await data_user.json();

        let fecha_activity = response_data_user.user_info[0].fecha_activity;
        localStorage.setItem("activityNotifications", fecha_activity);
    }


    setInterval( async () => {
        const newDate = new Date();
        let nowDate = new Date(localStorage.getItem("activityNotifications"));

        // console.log(formattHour(newDate));
        // console.log(formattHour(nowDate));

        if(formattHour(newDate) == formattHour(nowDate) || newDate.getTime() > nowDate.getTime()){

            let data = {
                id_user: getCookie("ID-USER"),
                fecha_activity: new Date(new Date().getTime() + 10 * 60000)
            }

            const set_fecha_activity = await fetch("http://localhost:4000/update/date", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json'
                }
            });

            const response_set_fecha_activity = await set_fecha_activity.json();

            if(response_set_fecha_activity.state == "Good Request"){
                let list_options = ["Nuevo Registro", "Publicación de Contenido", "Oferta Especial", "Default"]
                sendActivityNotificationEmail(getCookie("ID-USER"), list_options[Math.floor(Math.random() * (list_options.length - 1 - 0 + 1)) + 0]);
                localStorage.setItem("activityNotifications", data.fecha_activity);
            }else{
                console.log(response_set_fecha_activity.message)
            }
        }
    }, 1000);
});

//Eventos de los checkbox
for(let key in emailNotificationsElements) {
    emailNotificationsElements[key].addEventListener("change", (e) => {
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

function formattHour(date){
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function getCookie(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

export {emailNotificationsElements, smsNotificationsElements};