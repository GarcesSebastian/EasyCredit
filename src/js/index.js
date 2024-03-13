let actual_element = document.querySelector("#actual-flag");
let list_flags = document.querySelector("#list-flags");
let state_flag = "";

window.addEventListener("DOMContentLoaded", () =>{
    if(localStorage.getItem("flag") === null){
        localStorage.setItem("flag", "es")
        state_flag = "es";
    }else{
        if(localStorage.getItem("flag") == "es"){
            console.log("En Español")
            list_flags.querySelectorAll("div").forEach(item => {
                if(item.querySelector("img").src.split("/")[item.querySelector("img").src.split("/").length - 1] == "espana.svg"){
                    let srcImage = item.querySelector("img")?.src.split("/");
                    let src = transformSrc(srcImage);
                    let srcImageNow = actual_element.querySelector("img")?.src.split("/");
                    let srcNow = transformSrc(srcImageNow);
                    actual_element.querySelector("img").src = src;
                    item.querySelector("img").src = srcNow;
        
                    actual_element?.querySelector("svg").style.transform = "rotate(90deg)";
                    list_flags.style.display = "none";
                }
            })
            state_flag = "es";
        }else if(localStorage.getItem("flag") == "en"){
            console.log("In English")
            list_flags.querySelectorAll("div").forEach(item => {
                if(item.querySelector("img").src.split("/")[item.querySelector("img").src.split("/").length - 1] == "usa.svg"){
                    let srcImage = item.querySelector("img")?.src.split("/");
                    let src = transformSrc(srcImage);
                    let srcImageNow = actual_element.querySelector("img")?.src.split("/");
                    let srcNow = transformSrc(srcImageNow);
                    actual_element.querySelector("img").src = src;
                    item.querySelector("img").src = srcNow;
    
                    actual_element?.querySelector("svg").style.transform = "rotate(90deg)";
                    list_flags.style.display = "none";
                }
            })
            state_flag = "en";
        }
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

export default {state_flag};