let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");

window.addEventListener("DOMContentLoaded", () =>{
    if(localStorage.getItem("flag") === null){
        localStorage.setItem("flag", "es")
    }else{
        if(localStorage.getItem("flag") == "es"){
            if(actual_element.getAttribute("data-flag-now") != "es"){
                let attrSrc = actual_element.getAttribute("data-flag-src");
                let attrFlag = actual_element.getAttribute("data-flag-now");
                actual_element.setAttribute("data-flag-now", "es");
                actual_element.setAttribute("data-flag-src", "../../public/flags/espana.svg");

                list_flags.querySelectorAll("div").forEach((item) =>{
                    if(item.getAttribute("data-flag") == "es"){
                        item.setAttribute("data-flag", attrFlag);
                        item.setAttribute("data-flag-src", attrSrc);
                    }
                })
            }
        }else if(localStorage.getItem("flag") == "en"){
            if(actual_element.getAttribute("data-flag-now") != "en"){
                let attrSrc = actual_element.getAttribute("data-flag-src");
                let attrFlag = actual_element.getAttribute("data-flag-now");
                actual_element.setAttribute("data-flag-now", "en");
                actual_element.setAttribute("data-flag-src", "../../public/flags/usa.svg");

                list_flags.querySelectorAll("div").forEach((item) =>{
                    if(item.getAttribute("data-flag") == "en"){
                        item.setAttribute("data-flag", attrFlag);
                        item.setAttribute("data-flag-src", attrSrc);
                    }
                })
            }
        }

        actual_element.querySelector("img").src = actual_element.getAttribute("data-flag-src");
        list_flags.querySelectorAll("div").forEach((item) =>{
            item.querySelector("img").src = item.getAttribute("data-flag-src");
        });
    }
})

fetch("http://localhost:4000/flag", {
    method: "POST",
    body: JSON.stringify({flag: localStorage.getItem("flag")}),
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