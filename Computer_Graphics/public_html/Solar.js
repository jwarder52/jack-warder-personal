//Jack Warder - Solar System - Project 2
"use strict";

//Solar Class
var toggle = 0;
var isOrbit = true;
function Solar(canvasID) {
    //Constructoring
    var t = this;
    this.canvasID = canvasID;
    this.xPos = 0;
    this.yPos = 0;
    this.zPos = 75;
    this.rotation = 0;
    //Setting up canvas
    var canvas = this.canvas = document.getElementById(canvasID);
    if (!canvas) {
        alert("Canvas ID '" + canvasID + "' not found.");
        return;
    }

    var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
    if (!gl) {
        alert("WebGL isn't available in this browser");
        return;
    }
    
    var shaderProgram = initShaders(this.gl, "vShader.glsl", "fShader.glsl");
    this.gl.useProgram(shaderProgram);
    
    //Creating an instance of ship and giving it the canvas/shaders
    this.ship = new Ship (shaderProgram,this.canvasID);
    
    //Initializing Planets and attaching moons where necessary
    this.sun = new Planet(canvasID, shaderProgram,  8, 0, 0, 0, 0, 0, [1.0, 0.8, 0.2], "sun.bmp");
    this.mercury = new Planet(canvasID,shaderProgram,1,10,100,5,0,7, [0.9, 0.8, 0.8], "mercury.bmp");
    this.sun.AttachMoon(this.mercury);
    this.venus = new Planet(canvasID,shaderProgram,2,1,50,10,2,7, [1.0, 0.7, 0.1], "venus.bmp");
    this.sun.AttachMoon(this.venus);
    this.earth = new Planet(canvasID, shaderProgram, 2, 200, 15, 15, 24, 7, [0.5, 0.6, 0.8], "earth.bmp");
    this.sun.AttachMoon(this.earth);
    this.earthMoon = new Planet(canvasID,shaderProgram, 0.5,100,100,2,7,80, [1.0, 0.8, 0.8], "moon.bmp");
    this.earth.AttachMoon(this.earthMoon);
    this.mars = new Planet(canvasID,shaderProgram, 2, 210, 50, 20, 25, 7, [0.7, 0.3, 0.4], "mars.bmp");
    this.sun.AttachMoon(this.mars);
    this.jupiter = new Planet(canvasID,shaderProgram, 4, 500, 5, 30, 3, 7, [0.8, 0.9, 0.7], "jupiter.bmp");
    this.sun.AttachMoon(this.jupiter);
    this.jupiterEuropa = new Planet(canvasID,shaderProgram, 0.5, 100, 100, 2, 0, 10, [0.9, 0.2, 0.1], "moon.bmp");
    this.jupiter.AttachMoon(this.jupiterEuropa);
    this.jupiterIo = new Planet(canvasID,shaderProgram, 0.25, 100, 75, 2.5, 0, 40, [0.9, 0.9, 0.4], "moon.bmp");
    this.jupiter.AttachMoon(this.jupiterIo);
    this.jupiterGanymede = new Planet(canvasID,shaderProgram, 0.75, 100, 125, 3, 0, 90, [0.5, 0.7, 0.6], "moon.bmp");
    this.jupiter.AttachMoon(this.jupiterGanymede);
    this.saturn = new Planet(canvasID,shaderProgram, 4, 110, 6, 40, 27, 7, [0.9, 0.8, 0.7], "saturn.bmp");
    this.sun.AttachMoon(this.saturn);
    this.uranus = new Planet(canvasID,shaderProgram, 3, 250, 2, 50, 82, 7, [0.9, 0.9, 0.9], "uranus.bmp");
    this.sun.AttachMoon(this.uranus);
    this.neptune = new Planet(canvasID,shaderProgram, 3, 260, 1, 60, 28, 7, [0.2, 0.3, 0.4], "neptune.bmp");
    this.sun.AttachMoon(this.neptune);
    this.deltaMove = 1;
    this.deltaRotate = 2;
    
    //Initializing and Attaching each planets' rings
    this.mercuryRing = new Ring(canvasID, shaderProgram,5, 5.1, false);
    this.mercury.AttachRing(this.mercuryRing);
    
    this.venusRing = new Ring(canvasID, shaderProgram, 10, 10.1, false);
    this.venus.AttachRing(this.venusRing);
    
    this.earthRing = new Ring(canvasID, shaderProgram, 15, 15.1, false);
    this.earth.AttachRing(this.earthRing);
    
    this.earthMoonRing = new Ring(canvasID, shaderProgram, 2, 2.1, false);
    this.earthMoon.AttachRing(this.earthMoonRing);
    
    this.marsRing = new Ring(canvasID, shaderProgram, 20, 20.1, false);
    this.mars.AttachRing(this.marsRing);
    
    this.jupiterRing = new Ring(canvasID, shaderProgram, 30, 30.1, false);
    this.jupiter.AttachRing(this.jupiterRing);
    
    this.jupiterEuropaRing = new Ring(canvasID, shaderProgram, 2, 2.1, false);
    this.jupiterEuropa.AttachRing(this.jupiterEuropaRing);
    
    this.jupiterIoRing = new Ring(canvasID, shaderProgram, 2.5, 2.6, false);
    this.jupiterIo.AttachRing(this.jupiterIoRing);
    
    this.jupiterGanymedeRing = new Ring(canvasID, shaderProgram, 3, 3.1, false);
    this.jupiterGanymede.AttachRing(this.jupiterGanymedeRing);
    
    this.saturnRing = new Ring(canvasID, shaderProgram, 40, 40.1, false);
    this.saturn.AttachRing(this.saturnRing);
    
    this.saturnPersonalRing = new Ring(canvasID, shaderProgram, 1.5, 2, true);
    this.saturn.AttachRing(this.saturnPersonalRing);
    
    this.uranusRing = new Ring(canvasID, shaderProgram, 50, 50.1, false);
    this.uranus.AttachRing(this.uranusRing);
    
    this.neptuneRing = new Ring(canvasID, shaderProgram, 60, 60.1, false);
    this.neptune.AttachRing(this.neptuneRing);
    
    //Adding the event listeners for the keybopard controls of the ship movement
    document.addEventListener("keypress", (e) => {
        if (e.key === 'x') {
            this.ship.MoveForward(this.deltaMove);
        }
        if (e.key === 'z') {
            this.ship.MoveBackward(this.deltaMove);
        }
        if (e.key === 'd') {
            this.ship.MoveRight(this.deltaMove);
        }
        if (e.key === 'a') {
            this.ship.MoveLeft(this.deltaMove);
        }
        if (e.key === 'w') {
            this.ship.MoveUp(this.deltaMove);
        }
        if (e.key === 's') {
            this.ship.MoveDown(this.deltaMove);
        }
        if (e.key === 'q') {
            this.ship.RotateCW(this.deltaRotate);
        }
        if (e.key === 'e') {
            this.ship.RotateCCW(this.deltaRotate);
        }
    }, false);
    
    //Button to toggle the viewports
    var viewButton = document.getElementById(this.canvasID + "-view-button");
    viewButton.addEventListener("click", function () {
        toggle++;
        console.log(toggle);
    });
    
    
    
    
    //animation code
    var Render = function () {
        t.Render();
    };
    Solar.prototype.Animate = function() {
        requestAnimationFrame(Render);
        requestAnimationFrame(animate);
    };
  
    var animate = function() {
        t.Animate();
    };
    
    requestAnimationFrame(animate);

}

//Solars render takes in the view matrix from the ship and updates and renders the sun, 
//which renders and updates all of the other planets connected to it
Solar.prototype.Render = function () {
    var currentViewport = toggle % 3;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.sun.Update(0, 0, 0);
    
    //Swich case handles the different viewports
    switch (currentViewport) {
        case 1:
            //first viewport for ship view
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height/2);
            this.sun.Render(this.ship.GetViewMatrix(), true);
            
            this.gl.viewport(0, this.canvas.height/2, this.canvas.width, this.canvas.height/2);
            //Second viewport for minimap
            var longitude = 0;
            var latitude = 90;
            var radius = 70;
            var fov = 90;
            var near_plane = 0.1;
            var far_plane = 100;

            var x = radius * Math.cos(radians(longitude)) * Math.cos(radians(latitude));
            var y = radius * Math.sin(radians(latitude));
            var z = radius * Math.sin(radians(longitude)) * Math.cos(radians(latitude));

            // Set the camera view using the lookAt function
            var overhead = lookAt(vec3(x,y,z), vec3(0,0,0), vec3(0,0,-1));
            var projectionMat = perspective(fov, 1.0, near_plane, far_plane);
            var viewMat = mat4();
            viewMat = mult(viewMat,overhead);
            viewMat = mult(projectionMat,viewMat);
            
            this.sun.Render(viewMat, true);
            this.ship.RenderShip(viewMat);
              
        break;
        
        case 2:
            
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            var longitude = 0;
            var latitude = 90;
            var radius = 70;
            var fov = 90;
            var near_plane = 0.1;
            var far_plane = 100;

            var x = radius * Math.cos(radians(longitude)) * Math.cos(radians(latitude));
            var y = radius * Math.sin(radians(latitude));
            var z = radius * Math.sin(radians(longitude)) * Math.cos(radians(latitude));

            // Set the camera view using the lookAt function
            var overhead = lookAt(vec3(x,y,z), vec3(0,0,0), vec3(0,0,-1));
            var projectionMat = perspective(fov, 1.0, near_plane, far_plane);
            var viewMat = mat4();
            viewMat = mult(viewMat,overhead);
            viewMat = mult(projectionMat,viewMat);

            this.sun.Render(viewMat, true);
            this.ship.RenderShip(viewMat);
        break;
        
        case 0:
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.sun.Render(this.ship.GetViewMatrix(), true);
        break;
    }
};