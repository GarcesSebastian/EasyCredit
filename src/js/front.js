window.addEventListener("DOMContentLoaded", async () => {
    let response_data_gobierno;
    let data_gobierno;
    let isContinue = true;
    let err;
    let tasa;

    try{
        response_data_gobierno = await fetch("https://www.datos.gov.co/resource/Captacion.json?$query=SELECT%20tipoentidad%2C%20codigoentidad%2C%20nombreentidad%2C%20fechacorte%2C%20uca%2C%20nombre_unidad_de_captura%2C%20subcuenta%2C%20descripcion%2C%20tasa%2C%20monto%20WHERE%20((%60codigoentidad%60%20%3D%20'7')%20AND%20%60codigoentidad%60%20IS%20NOT%20NULL)%20ORDER%20BY%20fechacorte%20DESC");
        data_gobierno = await response_data_gobierno.json();

        data_gobierno.forEach((item) => {
            if(item.fechacorte.split("-")[0] == (new Date().getFullYear()).toString() && item.uca == "4" && isContinue){
                tasa = item.tasa;
                if(document.querySelector("#input-tasa-loan")){
                    document.querySelector("#input-tasa-loan").value = tasa + "%";
                }
                console.log(tasa)
                isContinue = !isContinue;
            }
        });
    }catch(e){
        isContinue = !isContinue;
        err = e;
        console.log(err)
    }
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
let list_config = document.querySelector("#list_config");

if(button_config){
    button_config.addEventListener("click", () =>{
        if(window.getComputedStyle(list_config).display != "none"){
            list_config.style.display = "none";
        }else{
            list_config.style.display = "flex";
        }
    });
}

let button_logout = document.querySelector("#button_logout");

if(button_logout){
    button_logout.addEventListener("click", () => {
        let encryptedInitiated = encrypt("false");
        localStorage.setItem("W-INIT-ENT", encryptedInitiated);

        let encryptedEmail = encrypt("false");
        localStorage.setItem("W-I-D", encryptedEmail);

        let data = {
            flag: localStorage.getItem("flag"),
            initiated: localStorage.getItem("W-INIT-ENT"),
            email: localStorage.getItem("W-I-D"),
        }

        fetch("http://localhost:4000/variables", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })

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
                    localStorage.setItem("flag", "es");
                }else if(item.getAttribute("data-flag") == "en"){
                    actual_element.setAttribute("data-flag-now", "en")
                    item.setAttribute("data-flag", "es")
                    localStorage.setItem("flag", "en");
                }
        
                let srcImage = item.querySelector("img")?.src.split("/");
                let src = transformSrc(srcImage);
                let srcImageNow = actual_element.querySelector("img")?.src.split("/");
                let srcNow = transformSrc(srcImageNow);
                let imgActualElement = actual_element.querySelector("img");
                imgActualElement.src = src;
                let imgItem = item.querySelector("img");
                imgItem.src = srcNow;
        
                let data = {
                    flag: localStorage.getItem("flag"),
                    initiated: localStorage.getItem("W-INIT-ENT"),
                    email: localStorage.getItem("W-I-D"),
                }
        
                fetch("http://localhost:4000/variables", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
        
                let svg = actual_element?.querySelector("span");
        
                svg.style.transform = "rotate(90deg)";
                list_flags.style.display = "none";
        
                window.location.reload();
            })
        }
    });
}

document.querySelector("#submit-signin")?.addEventListener("click", async () => {
    const email = document.querySelector("#input-email");
    const password = document.querySelector("#input-password");

    if (email.value.length > 0 && password.value.length > 0) {
        const data = {
            email: email.value,
            password: password.value
        };

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
            console.log("Logeado con éxito");
            
            let encryptedInitiated = encrypt("true");
            localStorage.setItem("W-INIT-ENT", encryptedInitiated);

            let encryptedId = encrypt(email.value);
            localStorage.setItem("W-I-D", encryptedId);

            let Info = {
                flag: localStorage.getItem("flag"),
                initiated: localStorage.getItem("W-INIT-ENT"),
                email: localStorage.getItem("W-I-D"),
            }

            fetch("http://localhost:4000/variables", {
                method: "POST",
                body: JSON.stringify(Info),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            window.location.href = "/"
        } else {
            if (responseJson.message === "Incorrect Password") {
                inputErr(document.querySelector("#input-password"), "#err-password", responseJson.message);
            }
            
            if(responseJson.message === "Incorrect Email") {
                inputErr(document.querySelector("#input-email"), "#err-email", responseJson.message);
            }

            console.log("Ocurrió un error " + responseJson.message);
        }
    }
});

if(document.querySelector("#background-popup-transfer") // Si existen los elementos
    && document.querySelector("#close-transfer") 
    && document.querySelector("#button-transfer") 
    && document.querySelector("#button-loan")
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
}

let response_data_user, data_user, response_data_variables, data_variables, data_movements_incomplete, initial_value_movements;

if(decrypt(localStorage.getItem("W-INIT-ENT")) === "true" && decrypt(localStorage.getItem("W-I-D")) != "false"){
    response_data_variables = await fetch(`http://localhost:4000/variables/res`);
    data_variables = await response_data_variables.json();

    if(data_variables.email){
        response_data_user = await fetch(`http://localhost:4000/user/data?email_user=${data_variables.email}`);
        data_user = await response_data_user.json();
    
        data_movements_incomplete = data_user.user_movements_incomplete.filter((data) => data.id_user === data_user.user_info[0].id_user);
    
        initial_value_movements = data_movements_incomplete.length;
    }
}else{
    console.log("No esta logeado el usuario.")
}

async function fetchDataAndUpdate() { // Falta agregar que solo lo haga cuando esta logeado el usuario
    if(decrypt(localStorage.getItem("W-INIT-ENT")) === "true" && decrypt(localStorage.getItem("W-I-D")) != "false"){
        response_data_variables = await fetch(`http://localhost:4000/variables/res`);
        data_variables = await response_data_variables.json();
    
        response_data_user = await fetch(`http://localhost:4000/user/data?email_user=${data_variables.email}`);
        data_user = await response_data_user.json();
    
        data_movements_incomplete = data_user.user_movements_incomplete.filter((data) => data.id_user === data_user.user_info[0].id_user);
    
        if(data_movements_incomplete.length != initial_value_movements){
            initial_value_movements = data_movements_incomplete.length;
            window.location.reload();
        }
        console.log("Esta logeado el usuario.")
    }else{
        console.log("No esta logeado el usuario.")
    }
}

fetchDataAndUpdate();

setInterval(fetchDataAndUpdate, 10000);


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

async function send_req_loan(){
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
        cuotas: elements_loan.input_cuotas.value,
        frecuencia: elements_loan.input_frecuencia.value,
        name_loan: elements_loan.input_name_loan.value,
        email_user: elements_loan.input_email.value,
        id_loan: elements_loan.input_id_loan.value,
        numero_telefono_loan: elements_loan.input_numero_telefono_loan.value,
        tasa_variable: elements_loan.tasa_variable.checked,
        tasa_fija: elements_loan.tasa_fija.checked,
    }

    let response_user_loan;
    let err;
    let isContinue = true;

    try{
        response_user_loan = await fetch("http://localhost:4000/user/loan", {
            method: "POST",
            body: JSON.stringify(data),
            headers:{ 'Content-Type': 'application/json' }
        });

        let response_message = await response_user_loan.json();

        if(response_message.state === "Bad Request"){
            if(response_message.message === "Numero de Identificacion Invalido."){
                let id = elements_loan.input_id_loan.id.toString();
                let id_without_input = id.split("input")[1];
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
            window.location.reload();
        }
    }catch(e){
        err = e;
        isContinue = !isContinue;
        console.log(err);
    }
    
    console.log(data);
}

document.querySelector("#form-loan")?.addEventListener("submit", (event) =>{
    event.preventDefault();
    send_req_loan();
})

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