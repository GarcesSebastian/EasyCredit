
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

list_flags.querySelectorAll("div").forEach(item => {
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
});

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