import {pageMap} from "./pages.js";

// --- Helper Functions

function btnClickListener(btnID, listener) {
    let buttons = document.querySelectorAll(btnID);
    for (let button of buttons) {
        button.addEventListener('click', listener);
    }
}

function navBtn(btnID, destination) {
    btnClickListener(btnID, function () {
        renderPage(destination);
    });
}

function renderPage(destination) {

    // Get the Page Data
    let html = `<h1 id="page-not-found-error">404: Page not Found</h1>`;
    let css_filenames = [];
    let js_filenames = [];
    let callbacks = [];

    // -- See if this function exists
    if (destination in pageMap) {
        // Call the function and get the values for it
        [html, css_filenames, js_filenames, callbacks] = pageMap[destination]();
    }

    // --- Apply the main HTML Changes
    let mains = document.querySelectorAll("main");
    for (let main of mains) {
        main.innerHTML = html;
    }

    // --- Now figure out and apply CSS and JS changes

    // First, clear the import areas
    let importsAreas = document.querySelectorAll("#imports-area");
    for (let importsArea of importsAreas) {
        importsArea.innerHTML = "";
    }

    /*
    // Add CSS changes
    for (let filename of css_filenames) {
        for (let importsArea of importsAreas) {
            const style = document.createElement('style');
            style.rel = "stylesheet";
            style.type = "text/css";
            style.href = filename;
            importsArea.append(filename);
        }
    }

    // Add the JS Changes
    for (let filename of js_filenames) {
        for (let importsArea of importsAreas) {
            const script = document.createElement('script');
            script.src = filename;
            script.type = "module";
            importsArea.append(script);
        }
    }
    */

    for (let callback of callbacks) {
        callback();
    }
}

// --- Declare navigation buttons
navBtn("#raytracer1-nav", "raytracer1");

// --- Render Home Page
renderPage("home");