//Jack Warder - Solar System - Project 2
"use strict";
/**
 * Constructor
 * 
 * @param canvasID - string containing name of canvas to render.
 */
//Initialize global variables for radian conversion and play button
var playCount = 0;
var isOrbit = true;
//Planet Class
function Planet(canvasID, shaderProgram, scale, dayPeriod, yearPeriod, orbitDistance, axisTilt, orbitTilt, color, texName) {
  var t = this;  // save reference to this object for callbacks
  //Constructoring
  this.scale = scale;
  this.dayPeriod = dayPeriod;
  this.yearPeriod = yearPeriod;
  this.orbitDistance = orbitDistance;
  this.axisTilt = axisTilt;
  this.orbitTilt = orbitTilt;
  this.canvasID = canvasID;
  this.color = color;
  this.texName = texName;
  this.modelMat = mat4();
  this.moons = [];
  this.rings = [];
  this.orbit = 0;
  this.tilt = 0;
  this.rotation = 0;
  this.translateMat = mat4();
  
  //Setting up the canvas
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

  gl.viewport(0, 0, canvas.width, canvas.height);
  var aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1.0) {
    this.aspectScale = scalem(1.0/aspectRatio, 1.0, 1.0);
  } else {
    this.aspectScale = scalem(1.0, aspectRatio, 1.0);
  }
  gl.clearColor(0.3, 0.1, 0.1, 1.0);
  // Enable hidden-surface removal (draw pixel closest to viewer)
  gl.enable(gl.DEPTH_TEST);
  
  //Math to create the shperes 
  this.numSections = 50;
  var vertices = [];
  var normals = [];
  var texCoords = [];
    
  var radius = .25 * scale;
  var latIncrement = 180 / this.numSections;
    
  for (var lat = 0; lat < this.numSections; lat++) {
        
        
      var radius1 = (90 - (latIncrement * lat)) * (Math.PI / 180);
      var radius2 = (90 - (latIncrement * (lat + 1))) * (Math.PI / 180);
        
      var topRad = radius * Math.cos(radius1);
      var bottomRad = radius * Math.cos(radius2);
       
      var y1 = radius * Math.sin(radius1);
      var y2 = radius * Math.sin(radius2);
        
      for (var long=0; long<=this.numSections; long++) {

          var angleDeg = (360.0 / this.numSections)*long;
          var angleRad = angleDeg*Math.PI/180.0;
          var x = Math.cos(angleRad);
          var z = Math.sin(angleRad);

          var x1 = topRad * Math.cos(angleRad);
          var z1 = topRad * Math.sin(angleRad);
          vertices.push(vec3(x1, y1, z1));
          normals.push(normalize(vec3(x1, y1, z1)));
          var u1 = Math.atan2(x1, z1) / (2*Math.PI) + 0.5;
          var v1 = (y1 * 0.5) + 0.5;
          texCoords.push(u1);
          texCoords.push(v1);
            
          var x2 = bottomRad * Math.cos(angleRad);
          var z2 = bottomRad * Math.sin(angleRad);
          vertices.push(vec3(x2, y2, z2));
          normals.push(normalize(vec3(x2, y2, z2)));
          var u2 = Math.atan2(x2, z2) / (2*Math.PI) + 0.5;
          var v2 = (y2 * 0.5) + 0.5;
          texCoords.push(u2);
          texCoords.push(v2);
      }     
  }
  
  
  // Vertex array to store buffer and pointer data
  this.vao = this.gl.createVertexArray();
  this.gl.bindVertexArray(this.vao);
  
  var floatBytes = 4;
  
  //Creating all of the buffers for color, lighting, normals, corrdinates, vertices, textures
  this.vertexBuffer = this.gl.createBuffer();  // get unique buffer ID number
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(vertices), this.gl.STATIC_DRAW);
  this.vPosition = this.gl.getAttribLocation(shaderProgram, "vPosition");
  this.gl.vertexAttribPointer(this.vPosition, 3, this.gl.FLOAT, false, 3 * floatBytes, 0);
  this.gl.enableVertexAttribArray(this.vPosition);
  

  this.normalBuffer = this.gl.createBuffer();  // get unique buffer ID number
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(normals), this.gl.STATIC_DRAW);
  this.vNormal = this.gl.getAttribLocation(shaderProgram, "vNormal");
  this.gl.vertexAttribPointer(this.vNormal, 3, this.gl.FLOAT, false, 3 * floatBytes, 0);
  this.gl.enableVertexAttribArray(this.vNormal);
    

  this.cubeTexCoordVB = this.gl.createBuffer();  // get unique buffer ID number
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeTexCoordVB);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(texCoords), this.gl.STATIC_DRAW);
  this.vCoord = this.gl.getAttribLocation(shaderProgram, "vCoord");
  this.gl.vertexAttribPointer(this.vCoord, 2, this.gl.FLOAT, false, 2 * floatBytes, 0);
  this.gl.enableVertexAttribArray(this.vCoord);
    

  this.projectionMat = this.gl.getUniformLocation(shaderProgram, "projectionMat");
  this.viewMat = this.gl.getUniformLocation(shaderProgram, "viewMat");
  this.modelMatr = this.gl.getUniformLocation(shaderProgram, "modelMat");
    
  this.lightColor = this.gl.getUniformLocation(shaderProgram, "lightColor");
  this.ambientFactor = this.gl.getUniformLocation(shaderProgram, "ambientFactor");
    
  this.materialColor = this.gl.getUniformLocation(shaderProgram, "materialColor");
  this.materialShiny = this.gl.getUniformLocation(shaderProgram, "shiny");
  this.isSun = this.gl.getUniformLocation(shaderProgram, "isSun");
    
  this.vTexCoord = this.gl.getAttribLocation(shaderProgram, "vTexCoord");
  this.fTexSampler = this.gl.getUniformLocation(shaderProgram, "fTexSampler");
    
  this.InitTexture(this.texName);
    
  this.gl.bindVertexArray(null);
    
  this.transformMat = this.gl.getUniformLocation(shaderProgram, "transformMat");
  
  //Setting up an event listener for my play/pause button
  //Keeps count of button presses so every other one stops the animation
  var playButton = document.getElementById(this.canvasID + "-play-button");
  playButton.addEventListener("click", function () {
            playCount++;
  });
  //Orbit button that gets rid of the orbit rings
  var orbitButton = document.getElementById(this.canvasID + "-orbit-button");
  orbitButton.addEventListener("click", function () {
            isOrbit = !isOrbit;
            console.log(isOrbit);
  });
};


//AttachMoon function pushes a planet(moon) into this planets moon array
Planet.prototype.AttachMoon = function(moon) {
    this.moons.push(moon);
};
//Attach Rings function pushes a ring into this planets ring array
Planet.prototype.AttachRing = function(ring) {
    this.rings.push(ring);
};

//Update function updates the titl, orbit, rotation of the planet
Planet.prototype.Update = function (posX, posY, posZ) {
    //If animation isnt paused
    if (playCount % 2 === 0) {
        var radianConv = Math.PI/180;
        //Changing .001 will change the speed of tilt, rotation, orbit
        //Changing rotation,tilt, and orbit based off of planets parameters
        this.rotation = this.rotation - (.01 * this.dayPeriod);
    
        this.tilt = this.tilt + (.001 * this.axisTilt);
    
        this.orbit = this.orbit + (.01 * this.yearPeriod);
        //Doing this math for orbiting
        var orbitX = posX + (this.orbitDistance * Math.cos(this.orbit*radianConv) * Math.cos(this.orbitTilt*radianConv));
        var orbitY = posY + (this.orbitDistance * Math.cos(this.orbit*radianConv) * Math.sin(this.orbitTilt*radianConv)); 
        var orbitZ = posZ + (this.orbitDistance * Math.sin(this.orbit*radianConv));
        //Updating the translation Matrix for the orbit
        this.translateMat = translate(orbitX, orbitY, orbitZ);

    
        // Update moons
        for(var i = 0; i < this.moons.length; i++) {
            this.moons[i].Update(orbitX, orbitY, orbitZ);
        }
        //Update rings (only saturn if they are toggled off)
        if (isOrbit) {
            for(var i = 0; i < this.rings.length; i++) {
                this.rings[i].Update(posX, posY, posZ, this.orbitTilt, this.translateMat);
            }
        }  else {
            for (var i = 0; i < this.rings.length; i++) {
                if(this.rings[i].getSaturn() === true) {
                    this.rings[i].Update(posX, posY, posZ, this.orbitTilt, this.translateMat);
                }
            }
        }   
    }
};
/**
 * Render - draw the scene on the canvas
 * 
 *   */
//Render function draws to canvas
    Planet.prototype.Render = function(viewMat, isSun) {
        
    var gl = this.gl;
    //vertex array binding
    gl.bindVertexArray(this.vao);
    
    //Identity matrix
    this.modelMat = mat4();
    
    //Changing the planets model Matrix based off of the translation, rotation, tilt
    this.modelMat = mult(this.modelMat, this.translateMat);
    this.modelMat = mult(this.modelMat, rotate(this.rotation, 0, 1, 0));
    this.modelMat = mult(this.modelMat, rotate(this.tilt, 1, 0, 0));


    // combine the model and view together
    var modelViewMat = mult(viewMat, this.modelMat);
    // Set transformation matrix for shader
    this.gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    this.gl.uniformMatrix4fv(this.modelMatr, false, flatten(this.modelMat));
    this.gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewMat));
    
    var lColor = vec3(1.0, 1.0, 1.0);
    var ambientFactor = .3;
   

    this.gl.uniform3fv(this.lightColor, flatten(lColor));
    this.gl.uniform1f(this.ambientFactor, ambientFactor);
   
    var mColor = this.color;
    var mShiny = 50.0;
    this.gl.uniform3fv(this.materialColor, flatten(mColor));
    this.gl.uniform1f(this.materialShiny, mShiny);
    this.gl.uniform1f(this.isSun, isSun);
    
    this.gl.activeTexture(this.gl.TEXTURE0);  // which of the multiple texture units to use
    this.gl.uniform1i(this.fTexSampler, 0); // The texture unit to use
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    
    // Draw each face as a 2-triangle (4-vertex) strip
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 2 * (this.numSections + 1) * this.numSections);
    gl.bindVertexArray(null);
    
    //Render Moons
    for(var i = 0; i < this.moons.length; i++) {
        this.moons[i].Render(viewMat, false);
    }
    //Render rings (only saturn if toggled)
    if (isOrbit) {
        for (var i = 0; i < this.rings.length; i++) {
            this.rings[i].Render(viewMat, true);
        }
    } else {
         for (var i = 0; i < this.rings.length; i++) {
            if(this.rings[i].getSaturn() === true) {
                this.rings[i].Render(viewMat, true);
            }
         }
    }
    

};

//Function that deals with the textures
Planet.prototype.InitTexture = function (textureURL) {
    var gl = this.gl;
    
    // First make a white texture for when we don't want to have a texture
    //   This prevents shader warnings even if we don't sample from it
    this.whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    // Load the texture from url (with generated mipmaps)
    this.textureLoaded = false;

    var texture = this.texture = gl.createTexture();
    var textureImage = new Image();
    var t = this;
    
    // Set up function to run asynchronously after texture image loads
    textureImage.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
      
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);  // incase we need min mipmap
        
        t.textureLoaded = true;  // flag texture load complete
    };

    textureImage.src = textureURL;  // start load of texture image
    
};