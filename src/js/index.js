let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

window.addEventListener("DOMContentLoaded", () =>{
    initFlagKey();
    initFlagInitiated();
    initId();
})

let data = {
    flag: localStorage.getItem("flag"),
    initiated: localStorage.getItem("W-INIT-ENT") || encrypt("false"),
    email: localStorage.getItem("W-I-D") || encrypt("false"),
}

fetch("https://localhost:4000/variables", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
        "Content-Type": "application/json"
    }
})

function changeFlag(flag, src){
    let attrSrc = actual_element.getAttribute("data-flag-src");
    let attrFlag = actual_element.getAttribute("data-flag-now");
    actual_element.setAttribute("data-flag-now", flag);
    actual_element.setAttribute("data-flag-src", src);

    list_flags.querySelectorAll("div").forEach((item) =>{
        if(item.getAttribute("data-flag") == flag){
            item.setAttribute("data-flag", attrFlag);
            item.setAttribute("data-flag-src", attrSrc);
        }
    })
}

function initFlagKey(){
    if(actual_element && list_flags){
        if(localStorage.getItem("flag") === null){
            localStorage.setItem("flag", "es")
        }else{
            if(localStorage.getItem("flag") == "es"){
                if(actual_element.getAttribute("data-flag-now") != "es"){
                    changeFlag("es", "../../public/flags/espana.svg")
                }
            }else if(localStorage.getItem("flag") == "en"){
                if(actual_element.getAttribute("data-flag-now") != "en"){
                    changeFlag("en", "../../public/flags/usa.svg")
                }
            }
    
            actual_element.querySelector("img").src = actual_element.getAttribute("data-flag-src");
            list_flags.querySelectorAll("div").forEach((item) =>{
                item.querySelector("img").src = item.getAttribute("data-flag-src");
            });
        }
    }
}

async function initFlagInitiated() {
    if (localStorage.getItem("W-INIT-ENT") === null) {
        let encryptedInitiated = encrypt("true");
        localStorage.setItem("W-INIT-ENT", encryptedInitiated);
    }
}

function initId(){
    if (localStorage.getItem("W-I-D") === null) {
        let encryptedData = encrypt("false");
        localStorage.setItem("W-I-D", encryptedData);
        localStorage.setItem("W-INIT-ENT", encryptedData);
    }else{
        if(localStorage.getItem("W-I-D") == "false"){
            let encryptedData = encrypt("false");
            localStorage.setItem("W-I-D", encryptedData);
            localStorage.setItem("W-INIT-ENT", encryptedData);
        }
    }
}

function encrypt(value) {
    var encryptedValue = CryptoJS.AES.encrypt(value, 'clave_secreta').toString();
    return encryptedValue;
}

