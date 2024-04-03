let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

window.addEventListener("DOMContentLoaded", () =>{
    initFlagKeyCook()
    // initFlagKey();
    initFlagInitiated();
    initId();
})

let data = {
    flag: getCookie("flag"),
    initiated: localStorage.getItem("W-INIT-ENT") || encrypt("false"),
    email: localStorage.getItem("W-I-D") || encrypt("false"),
    id: localStorage.getItem("ID-USER") || encrypt("false"),
}

const res = await fetch("http://localhost:4000/variables", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
        "Content-Type": "application/json"
    }
})

const data_response = await res.json();

console.log(data_response.session)
localStorage.setItem("session", data_response.session)

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

function initFlagKeyCook(){
    if(actual_element && list_flags){
        if(getCookie("flag") === null){
            setCookie("flag", "es");
        }else{
            if(getCookie("flag") == "es"){
                if(actual_element.getAttribute("data-flag-now") != "es"){
                    changeFlag("es", "../../public/flags/espana.svg")
                }
            }else if(getCookie("flag") == "en"){
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

console.log(getCookie("flag"))

setInterval(() => {
    if(getCookie("flag") === null){
        setCookie("flag", "es");
    }else{
        setCookie("flag", getCookie("flag"));
    }

    console.log(getCookie("flag"));
}, 100);