let window_width = window.innerWidth;

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

let btn_create_information = document.querySelector("#btn-create-information");
let btn_delete_information = document.querySelector("#btn-delete-information");

btn_create_information?.addEventListener("click", async () => {
    const res = await fetch("http://localhost:4000/create/information", {
        method: 'POST',
        body: JSON.stringify({id: getCookie("ID-USER")}),
        headers: {'Content-Type': 'application/json'}
    });

    const responseJSON = await res.json();

    if(responseJSON.status == "Good Request"){
        window.location.reload();
    }
});

btn_delete_information?.addEventListener("click", async () => {
    const res = await fetch("http://localhost:4000/delete/information", {
        method: 'POST',
        body: JSON.stringify({id: getCookie("ID-USER")}),
        headers: {'Content-Type': 'application/json'}
    });

    const responseJSON = await res.json();

    if(responseJSON.status == "Good Request"){
        window.location.reload();
    }
});

function ordenarFechasAsc(fechas) {
    let fechasDate = fechas.map((fecha) => new Date(fecha));

    fechasDate.sort((a, b) => a - b);
    
    let fechasOrdenadas = fechasDate.map((fecha) => fecha.toISOString().slice(0, 10));
    
    return fechasOrdenadas;
}

let response_data_user;

let data_user;

let isContinue = true;
let err;

let movements = [];
let eje_x = [];

try{
    response_data_user = await fetch(`http://localhost:4000/user/data?id_user=${getCookie("ID-USER")}`);
    data_user = await response_data_user.json();

    console.log(data_user);

    data_user.user_movements_complete.forEach((item) => {
        eje_x.push(item.fecha_movement);
    });

    eje_x = ordenarFechasAsc(eje_x);

    function normalizarFecha(fecha) {
        const partes = fecha.split('-');
        const año = partes[0];
        const mes = partes[1].length === 1 ? '0' + partes[1] : partes[1];
        const dia = partes[2].length === 1 ? '0' + partes[2] : partes[2];
        return `${año}-${mes}-${dia}`;
    }

    data_user.user_movements_complete.forEach((item) => {
        const fechaMovimientoNormalizada = normalizarFecha(item.fecha_movement);
        for (let i = 0; i < eje_x.length; i++) {
            const fechaEjeXNormalizada = normalizarFecha(eje_x[i]);

            if (fechaMovimientoNormalizada === fechaEjeXNormalizada) {
                if(item.state_movement == "negativo"){
                    movements[i] = parseInt(item.action_movement) * -1;
                }else{
                    movements[i] = parseInt(item.action_movement);
                }
                break;
            }
        }
    });

    eje_x.push("");

}catch(e){
    isContinue = !isContinue;
    console.log(e);
    err = e;
}

let ctx = document.getElementById('grafico');

Chart.defaults.backgroundColor = '#9BD0F5'; // Color de fondo
Chart.defaults.borderColor = '#36A2EB'; // El color de los border
Chart.defaults.color = '#fafafa'; // Elegir el color de la grafica en general

Chart.defaults.elements.point.pointStyle = 'rectRounded'; // Elegir el tipo de puntos, en este caso se escogio circulo
Chart.defaults.elements.point.borderWidth = 5; // Aumentar el tamaño de los puntos, en este caso circulos
Chart.defaults.elements.point.radius = 7; // Aumentar el tamaño de los puntos, en este caso circulos
Chart.defaults.elements.point.hoverRadius = 20; // Aumentar el tamaño de los puntos, en este caso al hacer hover
Chart.defaults.elements.point.hoverBorderWidth = 4; // Aumentar el tamaño de los puntos, en este caso al hacer hover

Chart.defaults.elements.line.tension = 0.25; // Determina la tension de las lineas

(async function() {

    let datasets = [
        {
            label: 'Movimientos',
            data: movements,
            animations: {
                y: {
                duration: 1500
                }
            }
        }
    ];

    const data = { // Toda esta mierta decide la longitud y la cantidad de valores en el eje horizontal (X)
        labels: eje_x,
        datasets: datasets
    };

    const totalDuration = 500;
    const delayBetweenPoints = totalDuration / (data.datasets.length * 2);
    const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
    const animation = {
    x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
        if (ctx.type !== 'data' || ctx.xStarted) {
            return 0;
        }
        ctx.xStarted = true;
        return ctx.index * delayBetweenPoints;
        }
    },
    y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
        if (ctx.type !== 'data' || ctx.yStarted) {
            return 0;
        }
        ctx.yStarted = true;
        return ctx.index * delayBetweenPoints;
        }
    }
    };

    const options = {
        animation,
        interaction: {
            intersect: false
        },
        scales: {
            x: {
                ticks: {

                },
                display: false,
            },
            y: {
                display: true,
                title: {
                    display: true,
                    font: {
                        family: 'sans-serif',
                        size: window_width < 500 ? .1 : 10,
                        weight: 'bold',
                        lineHeight: 1.2
                    }
                },
                min: -10000000,
                max: 10000000,
            }
        },
        plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            }
        },
    };

    new Chart(ctx.getContext("2d"), {
        type: 'line',
        data: data,
        options: options,
        plugins: [],
    });

})();