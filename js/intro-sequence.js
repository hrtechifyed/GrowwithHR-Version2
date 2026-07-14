/* ==========================================================
   GrowWithHR
   Executive Intro Engine
   Version 2.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const steps = [

        document.getElementById("introHero"),

        document.getElementById("introMessages"),

        document.getElementById("introCards"),

        document.getElementById("introTransition"),

        document.getElementById("coachIntroduction"),

        document.getElementById("introActions")

    ];

    function hideAllSteps(){

        steps.forEach(step=>{

            if(step){

                step.classList.remove("is-active");

            }

        });

    }

    function showStep(index){

        hideAllSteps();

        if(steps[index]){

            steps[index].classList.add("is-active");

        }

    }

 window.introEngine = {

    current:0,

    showStep,

    hideAllSteps

};

/* ==========================================================
   INTRO TIMELINE
========================================================== */

const introMessages = document.querySelectorAll(".intro-scene");
const introCards = document.querySelectorAll(".intro-card");
   

let currentScene = 0;
let currentCard = 0;
   
function showMessage(index){

    introMessages.forEach(scene=>{

        scene.classList.remove("active");

    });

    introMessages[index].classList.add("active");

}

function showCard(index){

    introCards.forEach(card=>{

        card.classList.remove("active");

    });

    introCards[index].classList.add("active");

}
   
function playIntroMessages(){

    if(currentScene >= introMessages.length){

        currentCard = 0;

        playCards();

        return;

    }

    showStep(1);

    showMessage(currentScene);

    currentScene++;

    const delay = currentScene === 3 ? 2500 : 2000;

    setTimeout(playIntroMessages, delay);

}

function playCards(){

    if(currentCard >= introCards.length){

        showStep(4);

        return;

    }

    showStep(2);

    showCard(currentCard);

    currentCard++;

    setTimeout(playCards,2250);

}
   
/* ---------- START ---------- */

showStep(0);

setTimeout(() => {

    playIntroMessages();

}, 2000);

});
