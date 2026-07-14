/* ==========================================================
   GrowWithHR
   Executive Intro Timeline
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.getElementById("introHero");

    const messages = document.getElementById("introMessages");

    const cards = document.getElementById("introCards");

    const transition = document.getElementById("introTransition");

    const coach = document.getElementById("coachIntroduction");

    const actions = document.getElementById("introActions");

    const messageScenes = document.querySelectorAll(".intro-scene");

    const briefingCards = document.querySelectorAll(".intro-card");

    const coachLines = document.querySelectorAll(".coach-line");

    const timeline = [

        {
            element: hero,
            duration: 3000
        },

        {
            element: messages,
            duration: 3500,
            callback: () => {

                activateScene(0);

            }
        },

        {
            element: messages,
            duration: 3500,
            callback: () => {

                activateScene(1);

            }
        },

        {
            element: messages,
            duration: 4500,
            callback: () => {

                activateScene(2);

            }
        },

        {
            element: cards,
            duration: 4000,
            callback: () => {

                activateCard(0);

            }
        },

        {
            element: cards,
            duration: 4000,
            callback: () => {

                activateCard(1);

            }
        },

        {
            element: cards,
            duration: 4000,
            callback: () => {

                activateCard(2);

            }
        },

        {
            element: cards,
            duration: 4000,
            callback: () => {

                activateCard(3);

            }
        },

        {
            element: cards,
            duration: 4000,
            callback: () => {

                activateCard(4);

            }
        },

        {
            element: cards,
            duration: 5000,
            callback: () => {

                activateCard(5);

            }
        },

        {
            element: transition,
            duration: 3500
        },

        {
            element: coach,
            duration: 3500,
            callback: () => {

                activateCoach(0);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(1);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(2);

            }
        },

        {
            element: coach,
            duration: 3000,
            callback: () => {

                activateCoach(3);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(4);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(5);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(6);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(7);

            }
        },

        {
            element: coach,
            duration: 4500,
            callback: () => {

                activateCoach(8);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(9);

            }
        },

        {
            element: coach,
            duration: 2500,
            callback: () => {

                activateCoach(10);

            }
        },

        {
            element: actions,
            duration: 0
        }

    ];

    function hideAllSections(){

        hero.style.display="none";
        messages.style.display="none";
        cards.style.display="none";
        transition.style.display="none";
        coach.style.display="none";
        actions.style.display="none";

    }

    function activateScene(index){

        messageScenes.forEach(scene=>scene.classList.remove("active"));

        messageScenes[index].classList.add("active");

    }

    function activateCard(index){

        briefingCards.forEach(card=>card.classList.remove("active"));

        briefingCards[index].classList.add("active");

    }

    function activateCoach(index){

        coachLines.forEach(line=>line.classList.remove("active"));

        coachLines[index].classList.add("active");

    }

    let current=0;

    function playTimeline(){

        if(current>=timeline.length){

            return;

        }

        hideAllSections();

        const step=timeline[current];

        step.element.style.display="flex";

        if(step.callback){

            step.callback();

        }

        current++;

        if(step.duration>0){

            setTimeout(playTimeline,step.duration);

        }

    }

    playTimeline();

});
