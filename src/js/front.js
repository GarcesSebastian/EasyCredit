import {emailNotificationsElements, smsNotificationsElements} from "./localStorage";
import * as Notifications from './Notifications'
import platform from 'platform'

const info = platform.parse(navigator.userAgent);
let type_device;
const deviceInfo = {
    browserName: info.name,
    browserVersion: info.version,
    browserLayout: info.layout,
    operatingSystem: info.os,
    browserDescription: info.description,
    productType: info.product,
    manufacturer: info.manufacturer
};

if (deviceInfo.operatingSystem.family === 'Mac' || deviceInfo.operatingSystem.family === 'Windows' || deviceInfo.operatingSystem.family === 'Linux') {
    type_device = "desktop";
} else {
    type_device = "mobile"
}

let response_data_user, data_user, data_movements_incomplete, initial_value_movements;

window.addEventListener("DOMContentLoaded", async () => {

    const res_get_disccount = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
    const get_disccount = await res_get_disccount.json();
    
    let disccount_rate = get_disccount?.user_info[0]?.discount_tasa;
    let rate = await obtenerTasa();
    let rate_disccount = rate - disccount_rate ? rate - disccount_rate : await obtenerTasa();

    if(document.querySelector("#input-tasa-loan")){
        document.querySelector("#input-tasa-loan").value = (rate_disccount) + "%";
    }

    if(document.querySelector("#tasa-simulate-loan")){
        document.querySelector("#tasa-simulate-loan").value = rate_disccount + "%";
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

function simulateLoanJSON(monto, tasa, frecuencia, plazo){
    monto = Number(monto)
    tasa = Number(tasa.split("%")[0])
    frecuencia = frecuencia;
    plazo = plazo;

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

    let table = []
    for(let i = 1; i <= total_pagos; i++){
        let data = {
            saldo_capital:1,
            pago_capital: 1,
            pago_interes: 1,
            monto: 1,
            plazo: 30,
            saldo_final: 1,
            numero_pago: 1,
            fecha: 1
        }

        let pago_interes = pago_restante * tasa_interes_mensual;
        let pago_principal = pago_mensual - pago_interes;
        let pago_total = pago_interes + pago_principal;
        let pago_final = pago_restante - pago_principal
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + i * frecuencia_value);

        data.saldo_capital = pago_restante.toFixed(2)
        data.pago_capital = pago_principal.toFixed(2)
        data.pago_interes = pago_interes.toFixed(2)
        data.monto = pago_total.toFixed(2)
        data.plazo = 30
        data.saldo_final = pago_final.toFixed(2)
        data.numero_pago = i
        data.fecha = currentDate

        pago_restante = pago_final;
        table.push(data);
    }

    return table;
}

function simulateLoan(monto, tasa, frecuencia, plazo){
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
        let data = {
            saldo_capital:1,
            pago_capital: 1,
            pago_interes: 1,
            monto: 1,
            plazo: 30,
            saldo_final: 1,
            numero_pago: 1,
            fecha: 1
        }

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
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_restante.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_principal.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_interes.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_total.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_final.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">${i}</td>
            <td class="text-center py-2 px-4 rounded-tr-lg">${formattedDate}</td>
        `;
        }else if(i == total_pagos){
            row.innerHTML = `
            <td class="text-center py-2 px-4 rounded-bl-lg">1</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_restante.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_principal.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_interes.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_total.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_final.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">${i}</td>
            <td class="text-center py-2 px-4 rounded-br-lg">${formattedDate}</td>
        `;
        }else{
            row.innerHTML = `
            <td class="text-center py-2 px-4 ">1</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_restante.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_principal.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_interes.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_total.toFixed(2))}</td>
            <td class="text-center py-2 px-4 ">30</td>
            <td class="text-center py-2 px-4 ">$${formatNumber(pago_final.toFixed(2))}</td>
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
    let value_simulate = document.querySelector("#tasa-simulate-loan")?.value;

    if(value_simulate == "Loading..."){
        document.querySelector("#content-warning-rate-simulate").style.display = "flex"
        return;
    }

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

let activateTwoStep = document.getElementById("activateTwoStep");
activateTwoStep?.addEventListener("change", async (e) => {
    const res = await fetch("http://localhost:4000/2fa/change", {
        method: "POST",
        body: JSON.stringify({value: e.target.checked, id_user: getCookie("ID-USER")}),
        headers: {
            'Content-type': 'application/json'
        }
    });

    if(!res.ok){
        alert("Ha ocurrido un error " + res.ok)
    }
});

let content_code_promo = document.querySelector("#content-code-promo");
let err_code_promo = document.querySelector("#err-code-promo");

const date_now = new Date();

content_code_promo?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let code = document.querySelector("#input-code-promo").value;

    const data = {
        code: code,
        id: getCookie("ID-USER")
    }

    inputSucess(document.querySelector("#input-code-promo"), "#err-code-promo");

    const res_code_promo = await fetch("http://localhost:4000/promo/validate", {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    });

    const code_promo = await res_code_promo.json();

    if(res_code_promo.ok){
        window.location.reload();
    }else{
        inputErr(document.querySelector("#input-code-promo"), "#err-code-promo", code_promo.message);
    }
});

let button_config = document.querySelector("#button_config");
let contentConfig = document.getElementById("content-configurations");
let button_promo = document.querySelector("#button_promo");
let close_configurations = document.getElementById("close_configurations")

button_promo?.addEventListener("click", () => {
    document.querySelector("#content-code-promo").style.display = window.getComputedStyle(document.querySelector("#content-code-promo")).display == "none" ? "flex" : "none";
});

close_configurations?.addEventListener("click", () => {
    contentConfig.style.right = "-100%";
});

button_config?.addEventListener("click", () =>{
    contentConfig.style.right = window.getComputedStyle(contentConfig).right === 0 ? "-100%" : "0%";
});

let view_info_loan = document.querySelector("#view-info-loan");

view_info_loan?.addEventListener("click", () => {
    let info_loan = document.querySelector("#info-loan");
    info_loan.style.display = window.getComputedStyle(info_loan).display === "none" ? "flex" : "none";
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

const _SaveImage = async (img) => {
    const data = {
        image: img,
        id: getCookie("ID-USER")
    }

    const res_save_image = await fetch("http://localhost:4000/save/image_profile", {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    });

    const save_image = await res_save_image.json();

    if(res_save_image.ok){
        localStorage.setItem("img", img);
    }
};

const loadImageFromStorage = async () => {
    const res_get_image = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
    const get_image = await res_get_image.json();
    let image = document.querySelector("#image_profile");

    if(image.src != "http://localhost:4321/"){
        return;
    }

    let image_value = get_image.user_info[0].image_profile;

    if(image_value){
        image_profile.forEach((item) => {
            item.src = image_value;
        })
    }
};

const dropzoneFile = document.querySelector("#dropzone-file");
const image_profile = document.querySelectorAll("#image_profile");

window.addEventListener("load", () => {
    if(getCookie("ID-USER") != "false"){
        loadImageFromStorage();
    }
});

dropzoneFile?.addEventListener("change", (event) => {
    const inputElement = event.target;
    const file = inputElement?.files?.[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
        const imageDataUrl = e.target?.result;
        _SaveImage(imageDataUrl);
        image_profile.forEach((item) => {
            item.src = imageDataUrl;
        })
        };
        reader.readAsDataURL(file);
    }
});

let isContinueSignUp = true;
let isContinueSignUpCode = true;
let isContinueSignIn = true;

document.querySelector("#formSignIn")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(isContinueSignIn == true){
        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");
    
        if (email.value.length > 0 && password.value.length > 0) {
            
            let deviceId = generateDeviceId(deviceInfo);
            
            if(getCookie("device_id") != null){
                deviceId = getCookie("device_id");
            }else{
                setCookie("device_id", deviceId);
            }

            const data = {
                email: email.value,
                password: password.value,
                deviceId: deviceId,
                type_device: type_device,
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

                if(!responseJson.isFind){
                    document.querySelector("#popup-center-validate-2fa").style.display = "flex";

                    const res_code = await fetch("http://localhost:4000/email/send_code", {
                        method: 'POST',
                        body: JSON.stringify({email: data.email, isEmail: true}),
                        headers:{
                            'Content-Type': 'application/json'
                        }
                    });
    
                    const responseJson_code = await res_code.json();
    
                    if(!res_code.ok){
                        inputErr(document.querySelector("#input-email"), "#err-email", responseJson_code.message);
                    }
                    return;
                }

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
    
            }
        }
    }
});


const form_2fa = document.querySelector("#form-validate-2fa");
let formInputs2fa = document.querySelectorAll('#validate_email_input_2fa');
const inputs2fa = [...formInputs2fa];

let isContinueValidate2FA = true;

form_2fa?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if(isContinueValidate2FA){
        
        let value = "";
        inputs2fa.forEach(item => {
            value += item.value;
        })

        inputSuccessArray(inputs2fa, "#err-validate-code-2fa");

        isContinueValidate2FA = false;

        const validate_code = await fetch("http://localhost:4000/validate/code", {
            method: 'POST',
            body: JSON.stringify({code: value}),
            headers:{
                'Content-Type': 'application/json'
            }
        });

        const res_validate_code = await validate_code.json();

        if(res_validate_code.state == "Bad Request"){
            isContinueValidate2FA = true;
            inputErrArray(inputs2fa, "#err-validate-code-2fa", res_validate_code.message);
            return;
        }

        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");

        let deviceId = generateDeviceId(deviceInfo);
            
        if(getCookie("device_id") != null){
            deviceId = getCookie("device_id");
        }else{
            setCookie("device_id", deviceId);
        }

        const data_2fa = {
            email: email.value,
            deviceId: deviceId,
            type_device: type_device,
        };

        const res_2fa = await fetch("http://localhost:4000/2fa/auth", {
            method: "POST",
            body: JSON.stringify(data_2fa),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!res_2fa.ok){
            alert("Ha ocurrido un error")
            return;
        }

        const data = {
            email: email.value,
            password: password.value,
            deviceId: deviceId,
            type_device: type_device,
        };

        const res = await fetch("http://localhost:4000/login/auth", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const responseJson = await res.json();

        if(res.ok){
            setCookie("ID-USER", responseJson.id)
            setCookie("W-INIT-ENT", "true")
            isContinueSignIn = true;
            window.location.href = "/"
        }
    }
})

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
                }
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
                }
            }
        });
    });
});

document.querySelector("#form-signup")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if(isContinueSignUpCode == true){
        const username = document.querySelector("#input-username");
        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");
        const numero_identidad = document.querySelector("#input-numero_identidad");
        const numero_telefono = document.querySelector("#input-numero_telefono");
        const ingreso_mensual = document.querySelector("#input-ingreso-mensual");
        const gasto_mensual = document.querySelector("#input-gasto-mensual");

        inputSucess(document.querySelector("#input-email"), "#err-email");
        inputSucess(document.querySelector("#input-password"), "#err-password");
        inputSucess(document.querySelector("#input-username"), "#err-username");
        inputSucess(document.querySelector("#input-numero_telefono"), "#err-numero_telefono");
        inputSucess(document.querySelector("#input-numero_identidad"), "#err-numero_identidad");
        inputSucess(document.querySelector("#input-ingreso-mensual"), "#err-ingreso-mensual");
        inputSucess(document.querySelector("#input-gasto-mensual"), "#err-gasto-mensual");
    
        if ((username.value.length >= 6 && username.value.length <= 15) 
            && email.value.length > 0 
            && (password.value.length >= 8 && password.value.length <= 24) 
            && numero_telefono.value.length >= 10 
            && numero_identidad.value.length >= 10
            && ingreso_mensual.value >= 1000
            && gasto_mensual.value >= 1000
            ) 
            {
            const data = {
                email: email.value,
                numero_identidad: numero_identidad.value,
                numero_telefono: numero_telefono.value,
            };
    
            isContinueSignUpCode = false;
    
            const res = await fetch("http://localhost:4000/validate/data", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            const responseJson = await res.json();
    
            if (res.ok) {
                isContinueSignUpCode = true;
                document.querySelector("#popup-center-validate").style.display = "flex";

                const res_code = await fetch("http://localhost:4000/email/send_code", {
                    method: 'POST',
                    body: JSON.stringify({email: data.email, isEmail: true}),
                    headers:{
                        'Content-Type': 'application/json'
                    }
                });

                const responseJson_code = await res_code.json();

                if(!res_code.ok){
                    inputErr(document.querySelector("#input-email"), "#err-email", responseJson_code.message);
                }
            } else {
                isContinueSignUpCode = true;
                if (responseJson.message === "Correo electrónico ya registrado.") {
                    inputErr(document.querySelector("#input-email"), "#err-email", responseJson.message);
                }

                if(responseJson.message === "Numero de Identificacion ya registrado."){
                    inputErr(document.querySelector("#input-numero_identidad"), "#err-numero_identidad", responseJson.message);
                }

            }
        }else{
            if(numero_telefono.value.length < 10){
                inputErr(document.querySelector("#input-numero_telefono"), "#err-numero_telefono", "El numero de telefono es incorrecto.");
            }

            if(numero_identidad.value.length < 10){
                inputErr(document.querySelector("#input-numero_identidad"), "#err-numero_identidad", "El numero de identidad es incorrecto.");
            }
            
            if(username.value.length < 6 || username.value.length > 15){
                inputErr(document.querySelector("#input-username"), "#err-username", "El nombre de usuario debe tener entre 6 y 15 caracteres.");
            }

            if(password.value.length < 8 || password.value.length > 24){
                inputErr(document.querySelector("#input-password"), "#err-password", "La contraseña debe tener entre 8 y 24 caracteres.");
            }

            if(ingreso_mensual.value <= 1000){
                inputErr(document.querySelector("#input-ingreso-mensual"), "#err-ingreso-mensual", "El ingreso mensual debe ser mayor a 1k.");
            }

            if(gasto_mensual.value <= 1000){
                inputErr(document.querySelector("#input-gasto-mensual"), "#err-gasto-mensual", "El gasto mensual debe ser mayor a 1k.");
            }
        }
    }
});

const form = document.getElementById('form-validate');
let formInputs = document.querySelectorAll('#validate_email_input');
const inputs = [...formInputs];

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if(isContinueSignUp == true){

        let value = "";
        inputs.forEach(item => {
            value += item.value;
        })

        inputSuccessArray(inputs, "#err-validate-code");

        isContinueSignUp = false;

        const validate_code = await fetch("http://localhost:4000/validate/code", {
            method: 'POST',
            body: JSON.stringify({code: value}),
            headers:{
                'Content-Type': 'application/json'
            }
        });

        const res_validate_code = await validate_code.json();

        if(res_validate_code.state == "Bad Request"){
            isContinueSignUp = true;
            inputErrArray(inputs, "#err-validate-code", res_validate_code.message);
            return;
        }

        const username = document.querySelector("#input-username");
        const email = document.querySelector("#input-email");
        const password = document.querySelector("#input-password");
        const numero_identidad = document.querySelector("#input-numero_identidad");
        const numero_telefono = document.querySelector("#input-numero_telefono");
        const ingreso_mensual = document.querySelector("#input-ingreso-mensual");
        const gasto_mensual = document.querySelector("#input-gasto-mensual");

        const data = {
            username: username.value,
            email: email.value,
            password: password.value,
            numero_identidad: numero_identidad.value,
            numero_telefono: numero_telefono.value,
            ingreso_mensual: ingreso_mensual.value,
            gasto_mensual: gasto_mensual.value,
        };

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
        }
    }

})

let form_update = document.querySelector("#form_update");

form_update?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let inputs = e.target.querySelectorAll("input");

    inputSucess(inputs[0], "#err-username-update");
    inputSucess(inputs[1], "#err-id-update");
    inputSucess(inputs[2], "#err-phone-update");
    inputSucess(inputs[3], "#err-email-update");
    inputSucess(inputs[4], "#err-income-update");
    inputSucess(inputs[5], "#err-bills-update");

    if ((inputs[0].value.length >= 6 && inputs[0].value.length <= 15) && inputs[3].value.length > 0 && inputs[2].value.length >= 10 && inputs[1].value.length >= 10 && inputs[4].value > 0 && inputs[5].value > 0) {
        const data = {
            id_user: getCookie("ID-USER"),
            username: inputs[0].value,
            id: inputs[1].value,
            phone: inputs[2].value,
            email: inputs[3].value,
            income_monthly: inputs[4].value,
            bills_monthly: inputs[5].value
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
        if(inputs[5].value <= 0){
            inputErr(inputs[5], "#err-bills-update", "Los gastos mensuales deben ser mayores a 0.");
        }

        if(inputs[4].value <= 0){
            inputErr(inputs[4], "#err-income-update", "Los ingresos mensuales deben ser mayores a 0.");
        }

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

let bg_popup_pay = document.querySelector("#background-popup-pay");
let close_pay = document.querySelector("#close-pay");
let button_loan_pay = document.querySelector("#button-loan-pay");
let closeLoans = document.querySelector("#closeLoans")
let close_loans = document.querySelector("#close_loans")

bg_popup_pay?.addEventListener("click", () => {
    document.querySelector("#popup-center-pay").style.display = "none";
});

close_pay?.addEventListener("click", () => {
    document.querySelector("#popup-center-pay").style.display = "none";
});

button_loan_pay?.addEventListener("click", () => {
    document.querySelector("#content-loan-pay").style.display = "flex"
})

closeLoans?.addEventListener("click", () => {
    document.querySelector("#content-loan-pay").style.display = "none"
});

close_loans?.addEventListener("click", () => {
    document.querySelector("#content-loan-pay").style.display = "none"
});

let form_pay = document.querySelector("#form-pay");
let value_cuotas_use = 0;
let attrPay;

let excedent_now = document.querySelectorAll("#excedent_now");

excedent_now.forEach(item => {
    item?.addEventListener("click", () => {
        let id_loan = item.getAttribute("data-id")
        createPdfLoan(id_loan)
    });
});

form_pay?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let value_cuotas = document.querySelector("#input-numero-cuotas-pay").value;
    attrPay = form_pay.getAttribute("data-pay");

    const input_total_pay = document.querySelector("#input-total-pay");

    inputSucess(document.querySelector("#input-numero-cuotas-pay"), "#err-numero-cuotas-pay")
    inputSucess(document.querySelector("#input-total-pay"), "#err-total-pay")

    if(e.submitter.id == "submit-pay-cuotas"){
        const res_data_loan = await fetch(`http://localhost:4000/user/loan?id_loan=${attrPay}`);

        const data_loan = await res_data_loan.json();
    
        const simulate = JSON.parse(data_loan[0].simulate);
    
        if(value_cuotas > simulate.length){
            inputErr(document.querySelector("#input-numero-cuotas-pay"), "#err-numero-cuotas-pay", "El numero maximo de cuotas del prestamo es de " + simulate.length)
            return;
        }
    
        document.querySelector("#result-pay").style.display = "flex"

        let total_pays = 0;

        for(let i = 0; i < value_cuotas; i++){
            total_pays += Number(simulate[i].monto);
        }

        input_total_pay.setAttribute("data-value", total_pays.toString())
        input_total_pay.value = "$" + formatNumber(total_pays.toFixed(2)).toString();
        value_cuotas_use = value_cuotas;
    }else{
        const res_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);

        const data_user = await res_data_user.json();

        const amount_avaible = data_user.user_info[0].saldo_disponible;

        if(Number(input_total_pay.getAttribute("data-value")) > Number(amount_avaible)){
            inputErr(document.querySelector("#input-total-pay"), "#err-total-pay", "No tienes saldo suficiente.")
            return;
        }

        let amount_avaible_new = (Number(amount_avaible) - Number(input_total_pay.getAttribute("data-value"))).toFixed(2);

        const res_data_loan = await fetch(`http://localhost:4000/user/loan?id_loan=${attrPay}`);

        const data_loan = await res_data_loan.json();
    
        const simulate = JSON.parse(data_loan[0].simulate);

        for(let i = 1; i <= value_cuotas_use; i++){
            simulate.splice(0,1);
        }

        const data = {
            simulate: simulate,
            id_user: getCookie("ID-USER"),
            id_loan: attrPay,
            saldo: amount_avaible_new.toString(),
        }

        const res_update_user_loan = await fetch("http://localhost:4000/update/user_loan",{
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json'
            }
        });


        const update_user_loan = await res_update_user_loan.json();

        if(res_update_user_loan.ok){
            window.location.reload();
        }else{
            inputErr(document.querySelector("#input-total-pay"), "#err-total-pay", update_user_loan.message)
        }
    }

})

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

        const data_user_loans = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);

        const user_loans_complete = await data_user_loans.json();

        const user_loans = user_loans_complete.user_info[0];

        let limit_prestamo = user_loans.limit_prestamo;
        let state_prestamo = user_loans.state_prestamo;
        let CPM = user_loans.limit_monto;
        let discount_tasa = user_loans.discount_tasa;
        let multiplier = user_loans.multiplier;
        
        let input_tasa_loan = parseFloat(elements_loan.input_tasa_loan.value.split("%")[0]);
        discount_tasa = input_tasa_loan - discount_tasa;
        
        let tasa_interes_mensual = (discount_tasa / 100) / 12;
        
        let cuotas = Number(elements_loan.input_cuotas.value);
        
        let rm1 = Math.pow(1 + tasa_interes_mensual, cuotas);
        let rm2 = rm1 - 1;
        let denom = tasa_interes_mensual * rm1;
        let amount_max = (CPM * rm2) / denom;
        
        let amount_max_rounded = Math.round(amount_max / 1000) * 1000;
        

        if(state_prestamo >= (limit_prestamo * multiplier)){
            document.querySelector("#content-warning-loan-rate").style.display = "flex"
            document.querySelector("#content-text-warning-loan").style.textContent = "Usted ha excedido el limite de prestamos en su cuenta, por favor resuelva los prestamos."
            return;
        }

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
    
        if(parseFloat(elements_loan.input_action_loan.value) < 1000 || parseFloat(elements_loan.input_action_loan.value) > amount_max_rounded) {
            let id = elements_loan.input_action_loan.id.toString();
            let id_without_input = id.split("input")[1];
            let id_with_err = "err" + id_without_input;
            document.querySelector("#" + id_with_err).style.display = "initial";
            document.querySelector("#" + id_with_err).innerHTML = `Por favor, introduce un monto entre $1.000,00 y $${formatNumber(amount_max_rounded)}`
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
            tasa_loan: discount_tasa,
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
            is_active: smsNotificationsElements.check_sms_loans.checked,
            table: simulateLoanJSON(elements_loan.input_action_loan.value, elements_loan.input_tasa_loan.value, elements_loan.input_frecuencia.value, Number(elements_loan.input_cuotas.value)),
            state_prestamo: state_prestamo,
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



                window.location.href = "/"
            }
        }catch(e){
            err = e;
            isContinue = false;
        }
    }
}

let close_warning_loan = document.querySelector("#close-warning-loan");
let content_warning_loan_rate = document.querySelector("#content-warning-loan-rate");

close_warning_loan?.addEventListener("click", () => {
    content_warning_loan_rate.style.display = window.getComputedStyle(content_warning_loan_rate).display == "none" ? "flex" : "none";  
});

async function simulate_loan(){
    const data_user_loans = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);

    const user_loans_complete = await data_user_loans.json();

    const user_loans = user_loans_complete.user_info[0];

    let discount_tasa = user_loans.discount_tasa;
    discount_tasa = (parseFloat(elements_loan.input_tasa_loan.value.split("%")[0]) - discount_tasa.toString() + "%");

    let cuotas = elements_loan.input_cuotas.selectedIndex;
    let monto = elements_loan.input_action_loan.value;
    let frecuencia = elements_loan.input_frecuencia.selectedIndex;

    window.location.href = `/SimulateLoan?monto=${monto}&frecuencia=${frecuencia}&cuotas=${cuotas}&tasa=${discount_tasa.split("%")[0]}`
}
document.querySelector("#form-loan")?.addEventListener("submit", (event) => {
    event.preventDefault();

    let value_loan = document.querySelector("#input-tasa-loan")?.value;

    if(value_loan == "Loading..."){
        document.querySelector("#content-warning-loan-rate").style.display = "flex"
        document.querySelector("#content-text-warning-loan").textContent = "Por favor, espere a que la tasa de interes cargue."
        return;
    }

    let submitter = event.submitter;
    if(submitter.id == "button-simulate-loan"){
        simulate_loan();
    }else{
        send_req_loan();
    }
});

let form_change_password_settings = document.querySelector("#form-change-password-settings");

form_change_password_settings?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const current_password = document.querySelector("#current-password");
    const new_password = document.querySelector("#new-password");
    const confirm_password = document.querySelector("#confirm-password");

    inputSucess(document.querySelector("#current-password"), "#err-current-password");
    inputSucess(document.querySelector("#new-password"), "#err-new-password");
    inputSucess(document.querySelector("#confirm-password"), "#err-confirm-password");

    if(new_password.value != confirm_password.value){
        inputErr(document.querySelector("#new-password"), "#err-new-password", "Las contraseñas no concuerdan.");
        inputErr(document.querySelector("#confirm-password"), "#err-confirm-password", "Las contraseñas no concuerdan.");
    }

    let data = {
        current: current_password.value,
        password: new_password.value,
        id: getCookie("ID-USER")
    }

    const res_change_password = await fetch("http://localhost:4000/password/change/settings", {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    });

    const change_password = await res_change_password.json();

    if(res_change_password.ok){
        document.querySelector("#change-password-success")?.classList.remove("hidden");
        document.querySelector("#change-password-success")?.classList.add("fixed");
    }else{
        if(change_password.message == "Contraseña incorrecta."){
            inputErr(document.querySelector("#current-password"), "#err-current-password", change_password.message);
        }

        if(change_password.message == "La nueva contraseña no puede ser igual a la anterior."){
            inputErr(document.querySelector("#current-password"), "#err-current-password", change_password.message);
            inputErr(document.querySelector("#new-password"), "#err-new-password", change_password.message);
            inputErr(document.querySelector("#confirm-password"), "#err-confirm-password", change_password.message);
        }

    }

})

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

const generateUniqueNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
};

const generateDeviceId = (deviceInfo) => {
    const { family, version } = deviceInfo.operatingSystem;

    const randomNumber = generateUniqueNumber();

    const uniqueId = `${family}_${version}_${randomNumber}`;

    return uniqueId;
};

function formatNumber(number) {
    let [integerPart, decimalPart] = String(number).split('.');

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart) {
        return `${integerPart},${decimalPart}`;
    } else {
        return integerPart;
    }
}

function formatNumberAbbreviaton(num) {
    const abbreviations = {
        K: 1000,
        M: 1000000,
        B: 1000000000
    };

    if (num >= 1000000000) {
        return (num / abbreviations.B).toFixed(1) + 'B';
    }

    if (num >= 1000000) {
        return (num / abbreviations.M).toFixed(1) + 'M';
    }

    if (num >= 1000) {
        return (num / abbreviations.K).toFixed(1) + 'K';
    }

    return num.toString();
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
        errElement.style.display = "flex";
        errElement.innerHTML = message;
    } else {
        console.error("El elemento de error no se encontró.");
    }
}

function inputErrArray(input, id, message){
    if (!input) {
        console.error("El elemento de entrada es nulo.");
        return;
    }

    input.forEach(item => {
        item.style.border = "1px solid tomato";

        var errElement = document.querySelector(id);
        
        if (errElement) {
            errElement.style.opacity = "1";
            errElement.innerHTML = message;
        } else {
            console.error("El elemento de error no se encontró.");
        }
    });
}

function inputSuccessArray(input, id){
    if (!input) {
        console.error("El elemento de entrada es nulo.");
        return;
    }

    input.forEach(item => {
        item.style.border = "1px solid rgb(30,41,59)";

        var errElement = document.querySelector(id);
        
        if (errElement) {
            errElement.style.opacity = "1";
            errElement.innerHTML = "";
        } else {
            console.error("El elemento de error no se encontró.");
        }
    });
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
        errElement.style.display = "none";
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

async function createPdfLoan(id_loan) {
    window.location.href = `http://localhost:4000/create/pdf_loan?id_loan=${id_loan}`;
}

export {simulateLoan}