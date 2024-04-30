import {emailNotificationsElements, smsNotificationsElements} from "./localStorage";
import * as Notifications from './Notifications'

let response_data_user, data_user, data_movements_incomplete, initial_value_movements;

window.addEventListener("DOMContentLoaded", async () => {
    if(document.querySelector("#input-tasa-loan")){
        document.querySelector("#input-tasa-loan").value = await obtenerTasa() + "%";
    }

    if(document.querySelector("#tasa-simulate-loan")){
        document.querySelector("#tasa-simulate-loan").value = await obtenerTasa() + "%";
    }

    verifyNoticiations();
});

async function obtenerTasa() {
    let response_data_gobierno;
    let data_gobierno;
    let tasa;
    let isContinue = true;

    try {
        response_data_gobierno = await fetch("https://www.datos.gov.co/resource/Captacion.json?$query=SELECT%20tipoentidad%2C%20codigoentidad%2C%20nombreentidad%2C%20fechacorte%2C%20uca%2C%20nombre_unidad_de_captura%2C%20subcuenta%2C%20descripcion%2C%20tasa%2C%20monto%20WHERE%20((%60codigoentidad%60%20%3D%20'7')%20AND%20%60codigoentidad%60%20IS%20NOT%20NULL)%20ORDER%20BY%20fechacorte%20DESC");
        data_gobierno = await response_data_gobierno.json();

        data_gobierno.forEach((item) => {
            if (item.fechacorte.split("-")[0] == (new Date().getFullYear()).toString() && item.uca == "4" && isContinue) {
                tasa = item.tasa;
                isContinue = false;
            }
        });

        return tasa;
    } catch (e) {
        return null;
    }
}

let btn_simulate_loan_offline = document.querySelector("#btn_simulate_loan_offline");

btn_simulate_loan_offline?.addEventListener("click", async () => {
    window.location.href = "/SimulateLoan";
});

function simulateLoan(monto, tasa, frecuencia, plazo){
    console.log(monto, tasa, frecuencia, plazo)
    const tasa_interes_mensual = (tasa / 100) / 12;
    let total_pagos;
    let frecuencia_value;
  
    switch (frecuencia) {
        case 'mensual':
            total_pagos = plazo;
            frecuencia_value = 1;
            break;
        case 'trimestral':
            total_pagos = plazo / 3;
            frecuencia_value = 3;
            break;
        case 'semestral':
            total_pagos = plazo / 6;
            frecuencia_value = 6;
            break;
        case 'anual':
            total_pagos = plazo / 12;
            frecuencia_value = 12;
            break;
        default:
            console.error('Frecuencia de pago no válida');
            return;
    }

    let pago_restante = monto;
    let pago_mensual = (monto * tasa_interes_mensual) / (1 - Math.pow(1 + tasa_interes_mensual, -total_pagos));

    let body_table_simulate_loan = document.querySelector("#body-table-simulate-loan");
    body_table_simulate_loan.innerHTML = '';

    for(let i = 1; i <= total_pagos; i++){
        console.log(i)
        let pago_interes = pago_restante * tasa_interes_mensual;
        let pago_principal = pago_mensual - pago_interes;
        let pago_total = pago_interes + pago_principal;
        let pago_final = pago_restante - pago_principal

        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + i * frecuencia_value);

        const formattedDate = currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

        const row = document.createElement('tr');
        
        if(i == 1){
            row.innerHTML = `
            <td class="text-center py-2 px-4 rounded-tl-lg">1</td>
            <td class="text-center py-2 px-4 ">${pago_restante.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_principal.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_interes.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_total.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">${pago_final.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${i}</td>
            <td class="text-center py-2 px-4 rounded-tr-lg">${formattedDate}</td>
        `;
        }else if(i == total_pagos){
            row.innerHTML = `
            <td class="text-center py-2 px-4 rounded-bl-lg">1</td>
            <td class="text-center py-2 px-4 ">${pago_restante.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_principal.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_interes.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_total.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">${pago_final.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${i}</td>
            <td class="text-center py-2 px-4 rounded-br-lg">${formattedDate}</td>
        `;
        }else{
            row.innerHTML = `
            <td class="text-center py-2 px-4 ">1</td>
            <td class="text-center py-2 px-4 ">${pago_restante.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_principal.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_interes.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${pago_total.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">${pago_final.toFixed(2)}</td>
            <td class="text-center py-2 px-4 ">${i}</td>
            <td class="text-center py-2 px-4 ">${formattedDate}</td>
        `;
        }

        body_table_simulate_loan.appendChild(row);
        pago_restante = pago_final;
    }
}

let popup_simulate_loan = document.querySelector("#popup-simulate-loan");
let span_simulate_loan = popup_simulate_loan.querySelector("#span-simulate-loan");

function showPopupInfo(message, e){
    popup_simulate_loan.style.display = "flex";
    popup_simulate_loan.style.top = `${e.clientY + 10}px`;
    popup_simulate_loan.style.left = `${e.clientX + 10}px`;
    span_simulate_loan.innerText = message;
}

function hiddenPopupInfo(){
    popup_simulate_loan.style.display = "none";
}

let info_monto_simulate_loan = document.querySelector("#info-monto-simulate-loan");
let tasa_monto_simulate_loan = document.querySelector("#tasa-monto-simulate-loan");

info_monto_simulate_loan?.addEventListener("mouseover", (e) => {
    showPopupInfo("El monto debe ser mayor a 500k y menor a 4000M", e);
});

info_monto_simulate_loan?.addEventListener("mouseout", (e) => {
    hiddenPopupInfo();
});

tasa_monto_simulate_loan?.addEventListener("mouseover", (e) => {
    showPopupInfo("La Tasa de Interes es fija, es decir, no cambia durante el plazo del préstamo.", e);
});

tasa_monto_simulate_loan?.addEventListener("mouseout", (e) => {
    hiddenPopupInfo();
});

let form_simulate_loan = document.querySelector("#form-simulate-loan");
    
form_simulate_loan?.addEventListener("submit", async (event) => {
  event.preventDefault();
  let monto = parseFloat(document.querySelector("#monto-simulate-loan").value);
  let tasa = parseFloat(await obtenerTasa());
  let frecuencia = document.querySelector("#frecuencia-simulate-loan").value;
  let plazo = parseFloat(document.querySelector("#plazo-simulate-loan").value);
  document.querySelector("#content-table-simulate-loan").style.display = "initial";
  simulateLoan(monto, tasa, frecuencia, plazo);
});

let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

actual_element?.addEventListener("click", () =>{
    let svg = actual_element?.querySelector("span");
    if(window.getComputedStyle(list_flags).display == "none"){
        svg.style.transform = "rotate(0deg)";
        list_flags.style.display = "flex";
    }else{
        svg.style.transform = "rotate(90deg)";
        list_flags.style.display = "none";
    }
});

let button_config = document.querySelector("#button_config");
let contentConfig = document.getElementById("content-configurations");
let close_configurations = document.getElementById("close_configurations")

close_configurations?.addEventListener("click", () => {
    contentConfig.style.right = "-100%";
});

button_config?.addEventListener("click", () =>{
    contentConfig.style.right = window.getComputedStyle(contentConfig).right === 0 ? "-100%" : "0%";
});

let btnNotification = document.querySelector("#button-notifications");
let btn_all_notifications = document.querySelector("#btn-all-notifications");

let btns_notification = [
    btnNotification,
    btn_all_notifications
]

let contentNotifications = document.getElementById("mainContent");
let closeNotifications = document.getElementById("closeNotifications");
let close_notifications = document.getElementById("close_notifications"); 

btns_notification?.forEach(element => {
    element?.addEventListener('click', () => {
        contentNotifications.style.display = window.getComputedStyle(contentNotifications).display === "none" ? "flex" : "none";
        if(contentNotifications.style.display == "flex"){
            localStorage.setItem("easyCreditNotifications", document.querySelectorAll("#notification").length);
            verifyNoticiations();
        }
    });
});

closeNotifications.addEventListener("click", () => {
    contentNotifications.style.display = window.getComputedStyle(contentNotifications).display === "flex" ? "none" : "flex";
});

close_notifications.addEventListener("click", () => {
    contentNotifications.style.display = window.getComputedStyle(contentNotifications).display === "flex" ? "none" : "flex";
});

let sub_btn_configurations = document.querySelectorAll("#sub_btn_configurations");
let sub_sections_configurations = document.querySelectorAll("#sub_sections_configurations");

sub_btn_configurations?.forEach((element) => {
  element.addEventListener("click", () => {
    let attr = element.getAttribute("data-text");
    sub_sections_configurations.forEach((item) => {
      let attrItem = item.getAttribute("data-id");
      if(attrItem == attr){
        item.style.display = "flex";
      }else{
        item.style.display = "none";
      }
    });
  });
});

let button_logout = document.querySelector("#button_logout");
if(button_logout){
    button_logout.addEventListener("click", () => {
        setCookie("W-INIT-ENT", "false")
        setCookie("ID-USER", "false")
        window.location.reload();
    });
}

if(list_flags && actual_element){
    list_flags.querySelectorAll("div").forEach(item => {
        if(item){
            item.addEventListener("click", () => {
                if(item.getAttribute("data-flag") == "es"){
                    actual_element.setAttribute("data-flag-now", "es")
                    item.setAttribute("data-flag", "en")
                    setCookie("flag", "es")
                }else if(item.getAttribute("data-flag") == "en"){
                    actual_element.setAttribute("data-flag-now", "en")
                    item.setAttribute("data-flag", "es")
                    setCookie("flag", "en")
                }
        
                let srcImage = item.querySelector("img")?.src.split("/");
                let src = transformSrc(srcImage);
                let srcImageNow = actual_element.querySelector("img")?.src.split("/");
                let srcNow = transformSrc(srcImageNow);
                let imgActualElement = actual_element.querySelector("img");
                imgActualElement.src = src;
                let imgItem = item.querySelector("img");
                imgItem.src = srcNow;
        
                let svg = actual_element?.querySelector("span");
        
                svg.style.transform = "rotate(90deg)";
                list_flags.style.display = "none";
        
                window.location.reload();
            })
        }
    });
}

let isContinueSignUp = true;
let isContinueSignIn = true;

document.querySelector("#submit-signup-google")?.addEventListener("click", () => {
    
})

document.querySelector("#formSignIn")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(isContinueSignIn == true){
        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");
    
        if (email.value.length > 0 && password.value.length > 0) {
            const data = {
                email: email.value,
                password: password.value
            };
    
            isContinueSignIn = false;
    
            const res = await fetch("http://localhost:4000/login/auth", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            const responseJson = await res.json();
            inputSucess(document.querySelector("#input-email"), "#err-email");
            inputSucess(document.querySelector("#input-password"), "#err-password");
    
            if (res.ok) {
                setCookie("ID-USER", responseJson.id)
                setCookie("W-INIT-ENT", "true")
                isContinueSignIn = true;
                window.location.href = "/"
            } else {
                isContinueSignIn = true;
    
                if (responseJson.message === "Contraseña incorrecta.") {
                    inputErr(document.querySelector("#input-password"), "#err-password", responseJson.message);
                }
                
                if(responseJson.message === "Correo electrónico incorrecto.") {
                    inputErr(document.querySelector("#input-email"), "#err-email", responseJson.message);
                }
    
                console.log("Ocurrió un error " + responseJson.message);
            }
        }
    }
});

let items_movements = document.querySelectorAll("#item_movement");
let movements_list = document.querySelectorAll("#movement");
let item_movement = document.querySelectorAll("#item_movement");
let options_movements = document.querySelector("#options_movements");
let content_options_movements = document.querySelector("#content_options_movements");
let delete_all_movements = document.querySelector("#delete_all_movements");
let delete_movements = document.querySelectorAll("#delete_movement");

delete_all_movements.addEventListener("click", async () => {
    let movements_id = [];
    movements_list.forEach(item => {
        movements_id.push(item.getAttribute("data-id-movement"));
    });

    const response_delete_all_movements = await fetch("http://localhost:4000/delete/allmovements", {
        method: "POST",
        body: JSON.stringify({id_movements: movements_id}),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const delete_all_movements = await response_delete_all_movements.json();

    if(delete_all_movements.state == "Good Request"){
        movements_list.forEach(item => {
            item.remove();
        });

        item_movement.forEach((item) => {
            item.remove();
        });

        initial_value_movements = 0;
        document.querySelector("#slot_card").style.display = "none";
        document.querySelector("#not_found_movements").style.display = "flex";
        document.querySelector("#movement_hidden").style.display = "flex";
    }else{
        console.log(delete_all_movements.message);
    }
});

options_movements?.addEventListener("click", () => {
    content_options_movements.style.display = window.getComputedStyle(content_options_movements).display === "none" ? "flex" : "none";
})

items_movements.forEach((item) => {
    item.addEventListener("click", async () => {
        let movements = document.querySelector("#showMore");
        if (window.getComputedStyle(movements).display == "none") {
            movements.style.display = "flex";        
            movements_list.forEach((element, index_element) => {
                if(item.getAttribute("data-id-movement") == element.getAttribute("data-id-movement")){
                    if (window.getComputedStyle(element.querySelector("#info")).display == "none") {
                        element.querySelector("#info").style.display = "flex";
                    }
                }
            });
        } else {
            movements.style.display = "none";
        }
    });
});

delete_movements.forEach((item, index) => {
    item.addEventListener("click", () => {
        let attrDelete = item.getAttribute("data-id-movement");
        movements_list.forEach(async (element, index_element) => {
            let attrElement = element.getAttribute("data-id-movement");
            if(attrDelete == attrElement){
                const response_delete_movement = await fetch("http://localhost:4000/delete/movement", {
                    method: "POST",
                    body: JSON.stringify({id: element.getAttribute("data-id-movement")}),
                    headers:{
                        'Content-Type': 'application/json'
                    }
                });

                const delete_movement = await response_delete_movement.json();

                if(delete_movement.state == "Good Request"){
                    console.log(delete_movement.message);
                    movements_list[index_element].remove();
                    
                    item_movement.forEach((item) => {
                        let attrItem = item.getAttribute("data-id-movement");
                        if(attrDelete == attrItem){
                            item.remove();
                        }
                    });

                    movements_list = document.querySelectorAll("#movement");
                    item_movement = document.querySelectorAll("#item_movement");
                    initial_value_movements -= 1;
                    if(movements_list.length <= 0){
                        document.querySelector("#slot_card").style.display = "none";
                        document.querySelector("#not_found_movements").style.display = "flex";
                        document.querySelector("#movement_hidden").style.display = "flex";
                    }
                }else{
                    console.log(delete_movement.message);
                }
            }else{
                console.log("nono")
                console.log(index == index_element, index, index_element)
            }
        });
    });
});

let item_notification = document.querySelectorAll("#delete_notification");
let items_notifications = document.querySelectorAll("#item_notification");
let notifications_list = document.querySelectorAll("#notification");
let options_notifications = document.querySelector("#options_notifications");
let content_options_notifications = document.querySelector("#content_options_notifications");
let delete_all_notifications = document.querySelector("#delete_all_notifications");

delete_all_notifications.addEventListener("click", async () => {
    let notifications_id = [];
    notifications_list.forEach(item => {
        notifications_id.push(item.getAttribute("data-notification"));
    });

    const response_delete_all_notifications = await fetch("http://localhost:4000/delete/allnotifications", {
        method: "POST",
        body: JSON.stringify({id_notifications: notifications_id}),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const delete_all_notifications = await response_delete_all_notifications.json();

    if(delete_all_notifications.state == "Good Request"){
        notifications_list.forEach(item => {
            item.remove();
        });
        localStorage.setItem("easyCreditNotifications", 0);
        document.querySelector("#notification_hidden").style.display = "flex";
    }else{
        console.log(delete_all_notifications.message);
    }
});

options_notifications?.addEventListener("click", () => {
    content_options_notifications.style.display = window.getComputedStyle(content_options_notifications).display === "none" ? "flex" : "none";
});

items_notifications.forEach((item) => {
    item.addEventListener("click", async () => {
        document.querySelector("#showMore").style.display = window.getComputedStyle(document.querySelector("#showMore")).display === "none" ? "flex" : "none";
    });
});

item_notification.forEach((item, index) => {
    item.addEventListener("click", () => {
        let attrItem = item.getAttribute("data-notification");
        notifications_list.forEach(async (element, index_element) => {
            let attrElement = element.getAttribute("data-notification");
            if(attrItem == attrElement){
                const response_delete_notification = await fetch("http://localhost:4000/delete/notification", {
                    method: "POST",
                    body: JSON.stringify({id: element.getAttribute("data-notification")}),
                    headers:{
                        'Content-Type': 'application/json'
                    }
                });

                const delete_notification = await response_delete_notification.json();

                if(delete_notification.state == "Good Request"){
                    notifications_list[index_element].remove();
                    notifications_list = document.querySelectorAll("#notification");
                    document.querySelector("#point_red").style.display = "none";
                    localStorage.setItem("easyCreditNotifications", (notifications_list.length) || 0);
                    if(notifications_list.length <= 0){
                        document.querySelector("#notification_hidden").style.display = "flex";
                    }
                }else{
                    console.log(delete_notification.message);
                }
            }
        });
    });
});

document.querySelector("#form-signup")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if(isContinueSignUp == true){
        const username = document.querySelector("#input-username");
        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");
        const numero_identidad = document.querySelector("#input-numero_identidad");
        const numero_telefono = document.querySelector("#input-numero_telefono");

        inputSucess(document.querySelector("#input-email"), "#err-email");
        inputSucess(document.querySelector("#input-password"), "#err-password");
        inputSucess(document.querySelector("#input-username"), "#err-username");
        inputSucess(document.querySelector("#input-numero_telefono"), "#err-numero_telefono");
        inputSucess(document.querySelector("#input-numero_identidad"), "#err-numero_identidad");
    
        if ((username.value.length >= 6 && username.value.length <= 15) && email.value.length > 0 && (password.value.length >= 8 && password.value.length <= 24) && numero_telefono.value.length >= 10 && numero_identidad.value.length >= 10) {
            const data = {
                username: username.value,
                email: email.value,
                password: password.value,
                numero_identidad: numero_identidad.value,
                numero_telefono: numero_telefono.value,
            };
    
            isContinueSignUp = false;
    
            const res = await fetch("http://localhost:4000/register/auth", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            const responseJson = await res.json();
    
            if (res.ok) {
                isContinueSignUp = true;
                window.location.href = "/SignIn";
            } else {
                isContinueSignUp = true;
                if (responseJson.message === "Correo electrónico ya registrado.") {
                    inputErr(document.querySelector("#input-email"), "#err-email", responseJson.message);
                }

                if(responseJson.message === "Numero de Identificacion ya registrado."){
                    inputErr(document.querySelector("#input-numero_identidad"), "#err-numero_identidad", responseJson.message);
                }

                console.log("Ocurrió un error al intentar registrarse");
            }
        }else{
            if(numero_telefono.value.length < 10){
                inputErr(document.querySelector("#input-numero_telefono"), "#err-numero_telefono", "El numero de telefono es incorrecto.");
                console.log("EL numero de telefono es incorrecto.");
            }

            if(numero_identidad.value.length < 10){
                inputErr(document.querySelector("#input-numero_identidad"), "#err-numero_identidad", "El numero de identidad es incorrecto.");
                console.log("EL numero de identidad es incorrecto.");
            }
            
            if(username.value.length < 6 || username.value.length > 15){
                inputErr(document.querySelector("#input-username"), "#err-username", "El nombre de usuario debe tener entre 6 y 15 caracteres.");
                console.log("El nombre de usuario debe tener entre 6 y 15 caracteres.");
            }

            if(password.value.length < 8 || password.value.length > 24){
                inputErr(document.querySelector("#input-password"), "#err-password", "La contraseña debe tener entre 8 y 24 caracteres.");
                console.log("La contraseña debe tener entre 8 y 24 caracteres.");
            }
        }
    }
});

let form_update = document.querySelector("#form_update");

form_update?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let inputs = e.target.querySelectorAll("input");

    inputSucess(inputs[0], "#err-username-update");
    inputSucess(inputs[1], "#err-id-update");
    inputSucess(inputs[2], "#err-phone-update");
    inputSucess(inputs[3], "#err-email-update");

    if ((inputs[0].value.length >= 6 && inputs[0].value.length <= 15) && inputs[3].value.length > 0 && inputs[2].value.length >= 10 && inputs[1].value.length >= 10) {
        const data = {
            id_user: getCookie("ID-USER"),
            username: inputs[0].value,
            id: inputs[1].value,
            phone: inputs[2].value,
            email: inputs[3].value,
        }

        const response_update_data = await fetch("http://localhost:4000/update/data", {
            method: "POST",
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        });

        const update_data = await response_update_data.json();

        if(update_data.message === "Update Successful") {
            document.querySelector("#toast-update")?.classList.remove("hidden");
            document.querySelector("#toast-update")?.classList.add("fixed");
            startTimer("#toast-update");
        }else{
            alert("Se ha encontrado un error.");
            window.location.reload();
        }
    }else{
        if(inputs[3].value.length <= 0){
            inputErr(inputs[3], "#err-email-update", "El correo electrónico es incorrecto.");
        }

        if(inputs[2].value.length < 10){
            inputErr(inputs[2], "#err-phone-update", "El numero de telefono es incorrecto.");
        }

        if(inputs[1].value.length < 10){
            inputErr(inputs[1], "#err-id-update", "El numero de identidad es incorrecto.");
        }
        
        if(inputs[0].value.length < 6 || inputs[0].value.length > 15){
            inputErr(inputs[0], "#err-username-update", "El nombre de usuario debe tener entre 6 y 15 caracteres.");
        }
    }
});

if(document.querySelector("#background-popup-transfer") // Si existen los elementos
    && document.querySelector("#close-transfer") 
    && document.querySelector("#button-transfer") 
    && document.querySelector("#button-loan")
    && document.querySelector("#button-simulate-loan")
){
    document.querySelector("#background-popup-transfer").addEventListener("click", () => {
        document.querySelector("#popup-center").style.display = "none";
    });
    
    document.querySelector("#close-transfer").addEventListener("click", () => {
        document.querySelector("#popup-center").style.display = "none";
    });

    document.querySelector("#button-transfer").addEventListener("click", () =>{
        document.querySelector("#popup-center").style.display = "flex";
    });
    
    document.querySelector("#button-loan").addEventListener("click", () =>{
        window.location.href="/Loan"
    });

    document.querySelector("#button-simulate-loan").addEventListener("click", () =>{
        window.location.href="/SimulateLoan"
    });
}

if(
    document.querySelector("#background-popup-forward")
    && document.querySelector("#popup-center-forward")
    && document.querySelector("#close-forward") 
    && document.querySelector("#background-popup-forward-code")
){
    document.querySelector("#background-popup-forward").addEventListener("click", () => {
        document.querySelector("#popup-center-forward").style.display = "none";
    });

    document.querySelector("#close-forward").addEventListener("click", () => {
        document.querySelector("#popup-center-forward").style.display = "none";
    });

    document.querySelector("#background-popup-forward-code").addEventListener("click", () => {
        document.querySelector("#popup-center-forward-code").style.display = "none";
    });

    document.querySelector("#close-forward-code").addEventListener("click", () => {
        document.querySelector("#popup-center-forward-code").style.display = "none";
    });

    document.querySelector("#background-popup-forward-password").addEventListener("click", () => {
        document.querySelector("#popup-center-forward-password").style.display = "none";
    });

    document.querySelector("#close-forward-password").addEventListener("click", () => {
        document.querySelector("#popup-center-forward-password").style.display = "none";
    });

    document.querySelector("#btn-forward").addEventListener("click", () =>{
        document.querySelector("#popup-center-forward").style.display = "flex";
    });
}

let elements_loan = {
    input_action_loan: document.querySelector("#input-action-loan"),
    input_tasa_loan: document.querySelector("#input-tasa-loan"),
    input_cuotas: document.querySelector("#input-cuotas"),
    input_frecuencia: document.querySelector("#input-frecuencia"),
    input_name_loan: document.querySelector("#input-name-loan"),
    input_email: document.querySelector("#input-email"),
    input_id_loan: document.querySelector("#input-id-loan"),
    input_numero_telefono_loan: document.querySelector("#input-numero_telefono-loan"),
    tasa_fija: document.querySelector("#tasa_fija"),
    tasa_variable: document.querySelector("#tasa_variable"),
}

elements_loan.tasa_fija?.addEventListener("change", () => {
    if(!elements_loan.tasa_fija.required){
        elements_loan.tasa_fija.required = true;
        elements_loan.tasa_variable.required = false;
        elements_loan.tasa_variable.checked = false;
    }else{
        elements_loan.tasa_fija.checked = true;
    }
});

elements_loan.tasa_variable?.addEventListener("change", () => {
    if(!elements_loan.tasa_variable.required){
        elements_loan.tasa_variable.required = true;
        elements_loan.tasa_fija.required = false;
        elements_loan.tasa_fija.checked = false;
    }else{
        elements_loan.tasa_variable.checked = true;
    }
});

let isContinueSendEmail = true;
let isContinueLoanReq = true;
let isContinueTransferReq = true;
let isContinueSendCode = true;
let isContinueChangePassword = true;

async function send_req_loan(){
    if(isContinueLoanReq == true){
        let isContinueLoan = true;

        for(let key in elements_loan){
            if(elements_loan.hasOwnProperty(key)){
                let item = elements_loan[key];
                let id = item.id.toString();
                let id_without_input = id.split("input")[1];
                let id_with_err = "err" + id_without_input;
                if(document.querySelector("#" + id_with_err)){
                    document.querySelector("#" + id_with_err).style.display = "none";
                    document.querySelector("#" + id_with_err).innerHTML = ""
                }
                item.style.borderColor = "transparent";
            }
        }
    
        if(parseFloat(elements_loan.input_action_loan.value) < 500000 || parseFloat(elements_loan.input_action_loan.value) > 4000000000) {
            let id = elements_loan.input_action_loan.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            document.querySelector("#" + id_with_err).style.display = "initial";
            document.querySelector("#" + id_with_err).innerHTML = "* El monto debe ser menor a 4000M y mayor a 500k."
            elements_loan.input_action_loan.style.borderColor = "tomato";
            isContinueLoan = false;
        }
    
        if(elements_loan.input_name_loan.value.length > 40){
            let id = elements_loan.input_name_loan.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            document.querySelector("#" + id_with_err).style.display = "initial";
            document.querySelector("#" + id_with_err).innerHTML = "* El numero maximo de caracteres es de 40 caracteres."
            elements_loan.input_name_loan.style.borderColor = "tomato";
            isContinueLoan = false;
        }
    
        if(elements_loan.input_numero_telefono_loan.value.length != 10){
            let id = elements_loan.input_numero_telefono_loan.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            document.querySelector("#" + id_with_err).style.display = "initial";
            document.querySelector("#" + id_with_err).innerHTML = "* El numero de telefono es incorrecto."
            elements_loan.input_numero_telefono_loan.style.borderColor = "tomato";
            isContinueLoan = false;
        }
    
        if(!isContinueLoan){
            return null;
        }
    
        let data = {
            action_loan: elements_loan.input_action_loan.value,
            tasa_loan: elements_loan.input_tasa_loan.value,
            cuotas: Number(elements_loan.input_cuotas.value),
            frecuencia: elements_loan.input_frecuencia.value,
            name_loan: elements_loan.input_name_loan.value,
            email_user: elements_loan.input_email.value,
            id_loan: elements_loan.input_id_loan.value,
            numero_telefono_loan: elements_loan.input_numero_telefono_loan.value,
            tasa_variable: elements_loan.tasa_variable.checked,
            tasa_fija: elements_loan.tasa_fija.checked,
            date: new Date().toLocaleDateString(),
            id_client: getCookie("ID-USER"),
            is_active: smsNotificationsElements.check_sms_loans.checked
        }
    
        let response_user_loan;
        let err;
        let isContinue = true;
    
        isContinueLoanReq = false;
    
        try{
            response_user_loan = await fetch("http://localhost:4000/user/loan", {
                method: "POST",
                body: JSON.stringify(data),
                headers:{ 'Content-Type': 'application/json' }
            });
    
            let response_message = await response_user_loan.json();
    
            if(response_message.state === "Bad Request"){
                isContinueLoanReq = true;
                if(response_message.message === "Numero de Identificacion Invalido."){
                    let id_without_input = elements_loan.input_id_loan.id.split("input")[1];
                    let id_with_err = "err" + id_without_input;
                    document.querySelector("#" + id_with_err).style.display = "initial";
                    document.querySelector("#" + id_with_err).innerHTML = "* " + response_message.message
                    elements_loan.input_id_loan.style.borderColor = "tomato";
                }else if(response_message.message === "Correo Electronico no valido."){
                    let id = elements_loan.input_email.id.toString();
                    let id_without_input = id.split("input")[1];
                    let id_with_err = "err" + id_without_input;
                    document.querySelector("#" + id_with_err).style.display = "initial";
                    document.querySelector("#" + id_with_err).innerHTML = "* " + response_message.message
                    elements_loan.input_email.style.borderColor = "tomato";
                }
            }else{
                isContinueLoanReq = true;
                document.querySelector("#input-action-loan").value = ""
                document.querySelector("#input-name-loan").value = ""
                document.querySelector("#input-email").value = ""
                document.querySelector("#input-id-loan").value = ""
                document.querySelector("#input-numero_telefono-loan").value = ""

                if(emailNotificationsElements.check_email_loans.checked){
                    Notifications.sendLoanNotificationEmail(data);
                }

                if(smsNotificationsElements.check_sms_loans.checked){
                    Notifications.sendLoanNotificationsEA(data);
                }

                window.location.href = "/"
            }
        }catch(e){
            err = e;
            isContinue = false;
            console.log(err);
        }
    }
}

function simulate_loan(){
    let cuotas = elements_loan.input_cuotas.selectedIndex;
    let monto = elements_loan.input_action_loan.value;
    let frecuencia = elements_loan.input_frecuencia.selectedIndex;
    let tasa = elements_loan.input_tasa_loan.value;

    console.log(cuotas, monto, frecuencia);
    window.location.href = `/SimulateLoan?monto=${monto}&frecuencia=${frecuencia}&cuotas=${cuotas}&tasa=${tasa.split("%")[0]}`
}

document.querySelector("#button-simulate-loan")?.addEventListener("click", () => {
    //simulate_loan();
});

document.querySelector("#form-loan")?.addEventListener("submit", (event) => {
    event.preventDefault();

    let submitter = event.submitter;
    if(submitter.id == "button-simulate-loan"){
        simulate_loan();
    }else{
        send_req_loan();
    }
});

let elements_transfer = {
    input_numero_tarjeta: document.querySelector("#input-numero-tarjeta-transfer"),
    input_action: document.querySelector("#input-action-transfer"),
    input_message: document.querySelector("#input-message-transfer"),
}

async function send_req_transfer(){
    if(isContinueTransferReq == true){
        let isContinueLoan = true;

        for(let key in elements_transfer){
            if(elements_transfer.hasOwnProperty(key)){
                let item = elements_transfer[key];
                let id = item.id.toString();
                let id_without_input = id.split("input")[1];
                let id_with_err = "err" + id_without_input;
                let element_err = document.querySelector("#" + id_with_err);
                if(element_err){
                    element_err.style.display = "none";
                    element_err.innerHTML = ""
                }
                item.style.borderColor = "transparent";
            }
        }
    
        if(parseFloat(elements_transfer.input_action.value) < 1000 || parseFloat(elements_transfer.input_action.value) > 4000000) {
            let id = elements_transfer.input_action.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            let element_err = document.querySelector("#" + id_with_err);
            element_err.style.display = "initial";
            element_err.innerHTML = "* El monto debe ser menor a 4M y mayor a 1k."
            elements_transfer.input_action.style.borderColor = "tomato";
            isContinueLoan = false;
        }
    
        if(elements_transfer.input_message.value.length > 200){
            let id = elements_transfer.input_message.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            let element_err = document.querySelector("#" + id_with_err);
            element_err.style.display = "initial";
            element_err.innerHTML = "* El numero maximo de caracteres es de 200 caracteres."
            elements_transfer.input_message.style.borderColor = "tomato";
            isContinueLoan = false;
        }
    
        if(!isContinueLoan){
            return null;
        }
    
        let numero_card_string = elements_transfer.input_numero_tarjeta.value.toString();
        let arr_numero_card_string = [];
        
        for (var i = 0; i < numero_card_string.length; i += 4) {
            arr_numero_card_string.push(numero_card_string.substring(i, i + 4));
        }
    
        let data = {
            numero_card: arr_numero_card_string,
            action: elements_transfer.input_action.value,
            message: elements_transfer.input_message.value,
            origin: getCookie("ID-USER"),
            is_active: smsNotificationsElements.check_sms_transfers.checked
        }
    
        let response_user_loan;
        let err;
        let isContinue = true;
    
        isContinueTransferReq = false;

        try{
            response_user_loan = await fetch("http://localhost:4000/user/transfer", {
                method: "POST",
                body: JSON.stringify(data),
                headers:{ 'Content-Type': 'application/json' }
            });
    
            let response_message = await response_user_loan.json();
    
            if(response_message.state === "Bad Request"){
                isContinueTransferReq = true;
                let id = elements_transfer.input_numero_tarjeta.id.toString();
                let id_without_input = id.split("input")[1];
                let id_with_err = "err" + id_without_input;
                let element_err = document.querySelector("#" + id_with_err);
                element_err.style.display = "initial";
                element_err.innerHTML = "* " + response_message.message
                elements_transfer.input_numero_tarjeta.style.borderColor = "tomato";
            }else{
                // socket.emit("transfer", (data))
                isContinueTransferReq = true;
                document.querySelector("#input-numero-tarjeta-transfer").value = ""
                document.querySelector("#input-action-transfer").value = ""
                document.querySelector("#input-message-transfer").value = ""
                if(emailNotificationsElements.check_email_transfers.checked){
                    Notifications.sendTransferNotificationEmail(data);
                }
                window.location.reload();
            }
        }catch(e){
            err = e;
            isContinue = false;
            console.log(err);
        }
    }
}

document.querySelector("#form-transfer")?.addEventListener("submit", (event) =>{
    event.preventDefault();
    send_req_transfer();
})

async function send_code_email(){
    if(isContinueSendEmail == true){
        const data = {
            email: document.querySelector("#input-email-forward").value
        };
    
        document.querySelector("#text-submit-code").style.display = "none"
        document.querySelector("#loader-submit-code").style.display = "flex"
        
        isContinueSendEmail = false;
        inputSucess(document.querySelector("#input-email-forward"), "#err-email-forward");

        const res = await fetch("http://localhost:4000/email/send_code", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        
        });
    

        const responseJson = await res.json();
        if(responseJson.state == "Good Request"){
            document.querySelector("#popup-center-forward").style.display = "none";
            document.querySelector("#popup-center-forward-code").style.display = "flex";
            document.querySelector("#input-email-forward").value = "";
            isContinueSendEmail = true;
        }else{
            isContinueSendEmail = true;
            inputErr(document.querySelector("#input-email-forward"), "#err-email-forward", responseJson.message);
        }
        document.querySelector("#text-submit-code").style.display = "flex"
        document.querySelector("#loader-submit-code").style.display = "none"
    }
}

document.querySelector("#form-forward")?.addEventListener("submit", (event) =>{
    event.preventDefault();
    send_code_email();
});

let email_response;

async function confirm_code(){
    if(isContinueSendCode == true){
        let data = {
            code: document.querySelector("#input-forward-code").value
        }
    
        isContinueSendCode = false;
        inputSucess(document.querySelector("#input-forward-code"), "#err-forward-code");

        const res = await fetch("http://localhost:4000/email/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
    
        const responseJson = await res.json();
    
        if(responseJson.state == "Good Request"){
            document.querySelector("#popup-center-forward-code").style.display = "none";
            document.querySelector("#popup-center-forward-password").style.display = "flex";
            email_response = responseJson.email;
            isContinueSendCode = true;
            document.querySelector("#input-forward-code").value = "";
        }else{
            isContinueSendCode = true;
            inputErr(document.querySelector("#input-forward-code"), "#err-forward-code", responseJson.message);
        }
    }
}

document.querySelector("#form-forward-code")?.addEventListener("submit", (event) =>{
    event.preventDefault();
    confirm_code();
});

async function change_password(){
    if(isContinueChangePassword == true){

        inputSucess(document.querySelector("#input-forward-password-first"), "#err-forward-password-first");
        inputSucess(document.querySelector("#input-forward-password-second"), "#err-forward-password-second");

        if(document.querySelector("#input-forward-password-first").value != document.querySelector("#input-forward-password-second").value){
            inputErr(document.querySelector("#input-forward-password-first"), "#err-forward-password-first", "Las contraseñas no coinciden.");
            inputErr(document.querySelector("#input-forward-password-second"), "#err-forward-password-second", "Las contraseñas no coinciden.");
        }else{
            let data = {
                password: document.querySelector("#input-forward-password-first").value,
                email: email_response,
            }
    
            isContinueChangePassword = false;
    
            const res = await fetch("http://localhost:4000/password/change", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            const responseJson = await res.json();
    
            if(responseJson.state == "Good Request"){
                document.querySelector("#popup-center-forward-password").style.display = "none";
                document.querySelector("#input-forward-password-first").value = "";
                document.querySelector("#input-forward-password-second").value = "";
                document.querySelector("#toast-success")?.classList.remove("hidden");
                document.querySelector("#toast-success")?.classList.add("fixed");
                isContinueChangePassword = true;
                startTimer("#toast-success");
            }else{
                isContinueChangePassword = true;
                inputErr(document.querySelector("#input-forward-password-first"), "#err-forward-password-first", responseJson.message);
                inputErr(document.querySelector("#input-forward-password-second"), "#err-forward-password-second", responseJson.message);
            }
        }
    }
}

document.querySelector("#form-forward-password")?.addEventListener("submit", (event) =>{
    event.preventDefault();
    change_password();
});

async function send_movements_daily(){
    const get_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
    const data_user = await get_data_user.json();
    if(!data_user || !data_user.user_info[0] || !data_user.user_info[0].fecha_update){
        return;
    }

    const fecha_update = data_user.user_info[0].fecha_update.split("/");

    if(fecha_update[0] == (new Date().getDate() < 9 ? "0" + (new Date().getDate()) : "" + new Date().getDate()) 
    && fecha_update[1] == ((new Date().getMonth() + 1) < 9 ? "0" + (new Date().getMonth() + 1) : "" + (new Date().getMonth() + 1)) 
    && fecha_update[2] == ("" + (new Date().getFullYear() % 100)))
    {
        Notifications.sendMovementNotificationEmail(data_user);
        console.log("enviado");
    }
}

send_movements_daily();

async function pullingFetch(){
    if(getCookie("W-INIT-ENT") == "true" && getCookie("ID-USER") != "false"){
        if(getCookie("ID-USER")){
            response_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
            data_user = await response_data_user.json();
            data_movements_incomplete = data_user.user_movements_complete.filter((data) => data.id_user === data_user.user_info[0].id_user);
            initial_value_movements = data_movements_incomplete.length;
        }
    }

    async function fetchDataAndUpdate() { 
        if(getCookie("W-INIT-ENT") == "true" && getCookie("ID-USER") != "false"){
            response_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
            data_user = await response_data_user.json();
            data_movements_incomplete = data_user.user_movements_complete.filter((data) => data.id_user === data_user.user_info[0].id_user);
            if(data_movements_incomplete.length != initial_value_movements){
                initial_value_movements = data_movements_incomplete.length;
                window.location.reload();
            }
        }
    }

    fetchDataAndUpdate();
    setInterval(fetchDataAndUpdate, 5000);
}

pullingFetch();

let button_logout_google = document.getElementById("button_logout_google");

button_logout_google?.addEventListener("click", () => {
    setCookie("W-INIT-ENT", "false");
    setCookie("ID-USER", "false");
})

function startTimer(id) {
    if (window.getComputedStyle(document.querySelector(id)).display !== 'none') {
        setTimeout(() => {
            document.querySelector(id)?.classList.remove("fixed");
            document.querySelector(id)?.classList.add("hidden");
        }, 5000);
    }
}

function verifyNoticiations(){
    let length_notifications_storage = localStorage.getItem("easyCreditNotifications");
    let length_notifications = document.querySelectorAll("#notification").length;

    let point_red = document.querySelector("#point_red");

    if(!point_red){
        return;
    }

    if(length_notifications_storage != length_notifications){
        point_red.style.display = "flex";
    }else{
        point_red.style.display = "none";
    }
    console.log("Verify");

    let number_notifications = document.querySelector("#number_notifications");
    if(number_notifications){
        number_notifications.innerText = length_notifications - length_notifications_storage;
    }
}

function transformSrc(srcImage){
    let src = "";
    for(let i = 0; i < srcImage.length; i++){
            if(i > 2){
                src += "/" + srcImage[i]
            }
    }
    return src;
}

function encrypt(value){
    value = CryptoJS.AES.encrypt(value, 'clave_secreta').toString();
    return value;
}

function decrypt(value){
    value = CryptoJS.AES.decrypt(value, 'clave_secreta').toString(CryptoJS.enc.Utf8);
    return value;
}

function inputErr(input, id, message) {
    if (!input) {
        console.error("El elemento de entrada es nulo.");
        return;
    }

    input.style.border = "1px solid tomato";

    var errElement = input.parentNode.parentNode.querySelector(id);
    
    if (errElement) {
        errElement.style.opacity = "1";
        errElement.innerHTML = message;
    } else {
        console.error("El elemento de error no se encontró.");
    }
}

function inputSucess(input, id) {
    if (!input) {
        console.error("El elemento de entrada es nulo.");
        return;
    }

    input.style.border = "1px solid rgb(30,41,59)";

    var errElement = input.parentNode.parentNode.querySelector(id);
    
    if (errElement) {
        errElement.style.opacity = "1";
        errElement.innerHTML = "";
    } else {
        console.error("El elemento de error no se encontró.");
    }
}

function setCookie(cookieName, cookieValue) {
    const expirationDate = new Date('9999-12-31'); // Establecer la fecha de vencimiento en el año 9999
    document.cookie = `${cookieName}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;
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

export {simulateLoan}