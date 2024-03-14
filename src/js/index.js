let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

window.addEventListener("DOMContentLoaded", () =>{
    initFlagKey();
    initFlagInitiated();
})

let data = {
    flag: localStorage.getItem("flag"),
    initiated: localStorage.getItem("initiated"),
}

fetch("http://localhost:4000/variables", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
        "Content-Type": "application/json"
    }
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

function initFlagInitiated(){
    if(localStorage.getItem("initiated") === null){
        localStorage.setItem("initiated", "false")
    }
}