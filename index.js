
function btnClickListener(btnID, listener) {
    let buttons = document.querySelectorAll(btnID);
    for (let button of buttons) {
        button.addEventListener('click', listener);
    }
}

function navBtn(btnID, destination) {
    btnClickListener(btnID, function () {
        window.location.href = destination;
    });
}

// --- Declare navigation buttons
navBtn("#raytracer1-nav", "raytracerPage1.html");
navBtn("#raytracer2-nav", "raytracerPage2.html");
navBtn("#raytracer3-nav", "raytracerPage3.html");
navBtn("#raytracer4-nav", "raytracerPage4.html");
navBtn("#raytracer5-nav", "rayTracerFinalReport.html");