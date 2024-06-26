let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

window.addEventListener("DOMContentLoaded", () =>{
    initFlagKeyCook()
    initFlagInitiated();
    initId();
})

let response_data_user;

let data_user;

if(getCookie("ID-USER") != "false" && getCookie("W-INIT-ENT") != "false"){
    try{
        response_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
        data_user = await response_data_user.json();
    }catch(e){
        setCookie("ID-USER", "false");
        setCookie("W-INIT-ENT", "false");
        window.location.reload();
    }
}

if(getCookie("W-INIT-ENT") != "true" && getCookie("ID-USER") != "false"){
    setCookie("ID-USER", "false");
    setCookie("W-INIT-ENT", "false");
    window.location.reload();
}

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
                    changeFlag("es", "../../flags/espana.svg")
                }
            }else if(getCookie("flag") == "en"){
                if(actual_element.getAttribute("data-flag-now") != "en"){
                    changeFlag("en", "../../flags/usa.svg")
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
    if (getCookie("W-INIT-ENT") === null) {
        setCookie("W-INIT-ENT", "false");
        window.location.reload();
    }
}

function initId(){
    if (getCookie("ID-USER") === null) {
        setCookie("ID-USER", "false");
        setCookie("W-INIT-ENT", "false");
        window.location.reload();
    }else{
        if(getCookie("ID-USER") == "false"){
            setCookie("ID-USER", "false");
            setCookie("W-INIT-ENT", "false");
        }
    }
}

function encrypt(value) {
    var encryptedValue = CryptoJS.AES.encrypt(value, 'clave_secreta').toString();
    return encryptedValue;
}

function setCookie(cookieName, cookieValue) {
    const expirationDate = new Date('9999-12-31'); 
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

// setInterval(() => {
//     if(getCookie("flag") === null){
//         setCookie("flag", "es");
//     }else{
//         setCookie("flag", getCookie("flag"));
//     }
// }, 100);
