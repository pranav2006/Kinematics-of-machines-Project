const ctx = document.getElementById('chart').getContext('2d');
const mechCanvas = document.getElementById('mechanism');
const mechCtx = mechCanvas.getContext('2d');

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
                { label: 'vs', data: [], borderColor: 'blue' },
                { label: 'as', data: [], borderColor: 'red' },
                {
                    label: 'Current Point',
                    data: [],
                    backgroundColor: 'green',
                    pointRadius: 6,
                    showLine: false
                }
                ]
    },
    options: {
        animation: false,
        responsive: true
    }
});

function syncInputs(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);

    slider.addEventListener("input", () => {
        input.value = slider.value;
        compute();
    });

    input.addEventListener("input", () => {
        slider.value = input.value;
        compute();
    });
}

function computeValues(r, l, w, theta) {
    let sin_phi = (r/l) * Math.sin(theta);
    sin_phi = Math.max(-1, Math.min(1, sin_phi));
    let cos_phi = Math.sqrt(1 - sin_phi*sin_phi);

    let w2 = (r * w * Math.cos(theta)) / (l * cos_phi);
    let alpha2 = (-r * w*w * Math.sin(theta) + l * w2*w2 * sin_phi) / (l * cos_phi);

    let vs = -r * w * Math.sin(theta) - l * w2 * sin_phi;
    let as = -r * w*w * Math.cos(theta)
           - l * alpha2 * sin_phi
           - l * w2*w2 * cos_phi;

    return { w2, alpha2, vs, as, sin_phi, cos_phi };
}

function drawMechanism(r, l, theta, cos_phi) {
    mechCtx.clearRect(0, 0, 500, 200);

    let scale = 100;

    let x0 = 50;
    let y0 = 100;

    let x_crank = x0 + r * scale * Math.cos(-theta);
    let y_crank = y0 + r * scale * Math.sin(-theta);

    let x_slider = x_crank + l * scale * cos_phi;

    mechCtx.beginPath();
    mechCtx.moveTo(x0, y0);
    mechCtx.lineTo(x_crank, y_crank);
    mechCtx.stroke();

    mechCtx.beginPath();
    mechCtx.moveTo(x_crank, y_crank);
    mechCtx.lineTo(x_slider, y0);
    mechCtx.stroke();

    mechCtx.fillRect(x_slider - 5, y0 - 5, 20, 10);
}

function compute() {
    let r = parseFloat(document.getElementById("r_input").value);
    let l = parseFloat(document.getElementById("l_input").value);
    let w = parseFloat(document.getElementById("w_input").value);
    let thetaDeg = parseFloat(document.getElementById("theta_input").value);
    let thetaRad = thetaDeg * Math.PI/180;

    document.getElementById("r_val").innerText = r.toFixed(2);
    document.getElementById("l_val").innerText = l.toFixed(2);
    document.getElementById("w_val").innerText = w.toFixed(2);
    document.getElementById("theta_val").innerText = thetaDeg;

    let theta_vals = [];
    let vs_vals = [];
    let as_vals = [];

    for (let deg = 0; deg <= 360; deg++) {
        let th = deg * Math.PI/180;
        let {vs, as} = computeValues(r, l, w, th);
        theta_vals.push(deg);
        vs_vals.push(vs);
        as_vals.push(as);
    }

    chart.data.labels = theta_vals;
    chart.data.datasets[0].data = vs_vals;
    chart.data.datasets[1].data = as_vals;

    let current = computeValues(r, l, w, thetaRad);

    chart.data.datasets[2].data = [{
        x: thetaDeg,
        y: current.vs
    }];

    chart.update();


    document.getElementById("w2").innerText = current.w2.toFixed(2);
    document.getElementById("alpha2").innerText = current.alpha2.toFixed(2);
    document.getElementById("vs").innerText = current.vs.toFixed(2);
    document.getElementById("as").innerText = current.as.toFixed(2);


    drawMechanism(r, l, thetaRad, current.cos_phi);
}

document.querySelectorAll("input").forEach(el => {
    el.addEventListener("input", compute);
});

compute();
syncInputs("r", "r_input");
syncInputs("l", "l_input");
syncInputs("w", "w_input");
syncInputs("theta", "theta_input");