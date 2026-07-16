import * as THREE from "three";

/* ==========================================================
   HRTECHIFY DESIGN SYSTEM
   Intelligence Core
   Version : v2.0.0
========================================================== */

const container = document.getElementById("dnaCoreCanvas");
window.GWHR_LOG?.("[GrowWithHR:LAYOUT]", { component: "intelligence-core", initialized: Boolean(container) });

if(container){

if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
}
container.style.overflow = "visible";

/* ==========================================================
   SCENE
========================================================== */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(

    45,

    container.clientWidth /

    container.clientHeight,

    0.1,

    1000

);

camera.position.z = 11;

/* ==========================================================
   RENDERER
========================================================== */

const renderer = new THREE.WebGLRenderer({

    alpha:true,

    antialias:true

});

renderer.setPixelRatio(

    Math.min(window.devicePixelRatio || 1, 2)

);

renderer.setSize(

    container.clientWidth,

    container.clientHeight

);

container.appendChild(

    renderer.domElement

);

/* ==========================================================
   GROUP
========================================================== */

const group = new THREE.Group();

scene.add(group);

/* ==========================================================
   COMPANY DNA MODEL
========================================================== */

const nodesData = [

    { id:"growth", label:"Growth" },

    { id:"leadership", label:"Leadership" },

    { id:"organization", label:"Organization" },

    { id:"workforce", label:"Workforce" },

    { id:"learning", label:"Learning" },

    { id:"compliance", label:"Compliance" },

    { id:"customer", label:"Customer Success" },

    { id:"rewards", label:"Rewards" },

    { id:"performance", label:"Performance" },

    { id:"culture", label:"Culture" }

];
   
   
/* ==========================================================
   NODE GROUPS
========================================================== */

let activePillar="company";
let activeStage = "startup";
let activeRecommendation = "company";   
const DEFAULT_PILLAR = "company";
   
const pillarGroups={

 company:[0,1,2],

    people:[3,4],

    operations:[5,7],

    growth:[6,8,9]

};

/* ==========================================================
   LABEL CONTAINER
========================================================== */

let labelContainer = document.getElementById("dnaLabels");

if (labelContainer) {
    labelContainer.remove();
}

labelContainer = document.createElement("div");
labelContainer.id = "dnaLabels";
labelContainer.style.position = "absolute";
labelContainer.style.inset = "0";
labelContainer.style.pointerEvents = "none";
labelContainer.style.zIndex = "2";

container.appendChild(labelContainer);

   
/* ==========================================================
   GEOMETRY
========================================================== */

const NODE_RADIUS = 3.05;

const sphereGeometry =

new THREE.SphereGeometry(

0.14,

32,

32

);

const nodes=[];

const labels=[];

/* ==========================================================
   CREATE NODES
========================================================== */

nodesData.forEach((item,index)=>{

const angle =

(-Math.PI / 2) +

(index * Math.PI * 2) /

nodesData.length;

const x =

Math.cos(angle) *

NODE_RADIUS;

const y =

Math.sin(angle) *

NODE_RADIUS;

const material=

new THREE.MeshPhysicalMaterial({

color:0xffb347,

emissive:0xff8800,

emissiveIntensity:1,

roughness:.08,

metalness:.25,

transmission:.55,

thickness:.7,

clearcoat:1,

clearcoatRoughness:0,

transparent:true,

opacity:.96

});

const sphere=

new THREE.Mesh(

sphereGeometry,

material

);

sphere.position.set(

x,

y,

0

);

group.add(sphere);

nodes.push(sphere);

/* ==========================================================
   HTML LABEL
========================================================== */

const label=

document.createElement("div");

label.className="dna-label";

label.innerText=item.label;

label.style.position="absolute";

label.style.pointerEvents="none";

label.style.transform=

"translate(-50%,-50%)";

labelContainer.appendChild(label);

labels.push(label);

});

/* ==========================================================
   LIGHTS
========================================================== */

const ambient=

new THREE.AmbientLight(

0xffffff,

0.75

);

scene.add(ambient);

const orangeLight=

new THREE.PointLight(

0xffb347,

4,

50

);

orangeLight.position.set(

0,

0,

6

);

scene.add(

orangeLight

);

const blueLight=

new THREE.PointLight(

0x2563eb,

2,

50

);

blueLight.position.set(

-4,

2,

5

);

scene.add(

blueLight

);

/* ==========================================================
   CONNECTION DATA
========================================================== */

const links=[];

for(

let i=0;

i<nodes.length;

i++

){

for(

let j=i+1;

j<nodes.length;

j++

){

links.push([i,j]);

}

}
    /* ==========================================================
   CONNECTION LINES
========================================================== */

const lineMaterial = new THREE.LineBasicMaterial({

    color:0x63b3ff,

    transparent:true,

    opacity:.38

});

const lines=[];

links.forEach(link=>{

    const geometry=new THREE.BufferGeometry()

    .setFromPoints([

        nodes[link[0]].position,

        nodes[link[1]].position

    ]);

    const line=new THREE.Line(

        geometry,

        lineMaterial.clone()

    );

    group.add(line);

    lines.push(line);

});

/* ==========================================================
   INTELLIGENCE FLOW
========================================================== */

const flowGeometry=

new THREE.SphereGeometry(

0.045,

16,

16

);

const flowParticles=[];

links.forEach((link,index)=>{

const particle=

new THREE.Mesh(

flowGeometry,

new THREE.MeshBasicMaterial({

color:0xffffff,

transparent:true,

opacity:.92

})

);

particle.userData={

start:link[0],

end:link[1],

offset:Math.random(),

speed:

0.15+

Math.random()*0.18

};

group.add(particle);

flowParticles.push(particle);

});

/* ==========================================================
   COMPANY DNA EVENTS
========================================================== */

document.addEventListener(

"dnaChange",

event=>{

activePillar=

event.detail.pillar;

}

);

document.addEventListener(

    "growthStageChange",

    event=>{

        activeStage = event.detail.stage;

    }

);   

document.addEventListener(

    "recommendationChange",

    event=>{

        activeRecommendation = event.detail.recommendation;

    }

);
   
/* ==========================================================
   NODE HIGHLIGHT
========================================================== */

function updateNodeHighlight(){


const activeNodes =
pillarGroups[activePillar] ??
pillarGroups[DEFAULT_PILLAR];
   

nodes.forEach((node,index)=>{

const material=node.material;

const target=

activeNodes.includes(index)

?2.2

:0.7;

material.emissiveIntensity=

THREE.MathUtils.lerp(

material.emissiveIntensity,

target,

0.08

);

});

}

/* ==========================================================
   LINE HIGHLIGHT
========================================================== */

function updateLines(){

const activeNodes =
pillarGroups[activePillar] ??
pillarGroups[DEFAULT_PILLAR];

lines.forEach((line,index)=>{

const a=links[index][0];

const b=links[index][1];

const active=

activeNodes.includes(a)||

activeNodes.includes(b);

line.material.opacity=

THREE.MathUtils.lerp(

line.material.opacity,

active?.95:.18,

.08

);

line.material.color.set(

active

?0xffb347

:0x63b3ff

);

});

}

/* ==========================================================
   FLOW PARTICLES
========================================================== */

function updateParticles(time){

const activeNodes =
pillarGroups[activePillar] ??
pillarGroups[DEFAULT_PILLAR];

flowParticles.forEach(particle=>{

const start=

nodes[particle.userData.start];

const end=

nodes[particle.userData.end];

const t=(

time*

particle.userData.speed+

particle.userData.offset

)%1;

particle.position.lerpVectors(

start.position,

end.position,

t

);

const active=

activeNodes.includes(

particle.userData.start

)||

activeNodes.includes(

particle.userData.end

);

particle.material.color.set(

active

?0xffd27a

:0xffffff

);

particle.material.opacity=

active?.95:.45;

});

}

/* ==========================================================
   LABEL POSITIONING
========================================================== */

function updateLabels(){

    nodes.forEach((node,index)=>{

        const world = node.getWorldPosition(

            new THREE.Vector3()

        );

        const direction = world.clone().normalize();

        // push labels further out from the ring so they clear the lines/nodes
        world.add(
            direction.multiplyScalar(0.55)
        );

        world.project(camera);

        const left = (world.x + 1) * 0.5 * container.clientWidth;
        const top  = (-world.y + 1) * 0.5 * container.clientHeight;

        labels[index].style.left = left + "px";
        labels[index].style.top  = top + "px";

        // anchor text away from the circle based on which side it's on,
        // instead of always centering on the point
        const dx = direction.x;
        const dy = direction.y;

        let translateX = "-50%";
        let translateY = "-50%";

        if (dx > 0.35) translateX = "0%";        // right side -> anchor left edge
        else if (dx < -0.35) translateX = "-100%"; // left side -> anchor right edge

        if (dy > 0.35) translateY = "-100%";      // top -> anchor bottom edge
        else if (dy < -0.35) translateY = "0%";   // bottom -> anchor top edge

        labels[index].style.transform =
            `translate(${translateX}, ${translateY})`;

    });

}
   
/* ==========================================================
   GRAPH PULSE
========================================================== */

function updateNodes(time){

    nodes.forEach((node,index)=>{

        const pulse =

            1 +

            Math.sin(

                time*2 +

                index

            ) * 0.05;

        node.scale.set(

            pulse,

            pulse,

            pulse

        );

    });

}

/* ==========================================================
   LIGHT ANIMATION
========================================================== */

function updateLights(time){

    orangeLight.intensity =

        3.8 +

        Math.sin(

            time*2

        ) * 0.35;

    blueLight.intensity =

        2 +

        Math.cos(

            time*1.6

        ) * 0.25;

}

/* ==========================================================
   GRAPH CENTERING
========================================================== */

const bounds = new THREE.Box3()

.setFromObject(group);

const center = bounds.getCenter(

    new THREE.Vector3()

);

group.position.sub(center);
group.position.y += 0.25;

/* ==========================================================
   ANIMATION LOOP
========================================================== */

const clock = new THREE.Clock();

function animate(){

    requestAnimationFrame(

        animate

    );

    const time =

        clock.getElapsedTime();

    updateNodes(

        time

    );

    updateNodeHighlight();

    updateLines();

    updateParticles(

        time

    );

    updateLights(

        time

    );

    updateLabels();

    renderer.render(

        scene,

        camera

    );

}

animate();

/* ==========================================================
   RESIZE
========================================================== */

let resizeTimer = null;
function resizeGraph(){
    const rect = container.getBoundingClientRect();
    const width = Math.max(260, Math.floor(rect.width || container.clientWidth));
    const height = Math.max(260, Math.floor(rect.height || container.clientHeight || width * 0.75));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    updateLabels();
}
function scheduleResize(){
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeGraph, 120);
}

if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleResize).observe(container);
}
window.addEventListener("resize", scheduleResize);
window.addEventListener("orientationchange", scheduleResize);

/* ==========================================================
   INITIAL LABEL POSITION
========================================================== */

updateLabels();

}
