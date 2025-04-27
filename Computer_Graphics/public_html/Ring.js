//Jack Warder - Solar System - Project 2
"use strict";

//Ring class creates rings that show the orbit path for the planets
function Ring(canvasID, shaderProgram, innerRadius, outerRadius, isSaturn) {
    
    //constructoring
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.translateMat = mat4();
    this.tiltMat = mat4();
    this.isSaturn = isSaturn;
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
    
    //Math for single rings
    this.numSections = 100;
    var normals = [];
    var vertices = [];
    
    for (var long=0; long<=this.numSections; long++) {

          var angleDeg = (360.0 / this.numSections)*long;
          var angleRad = angleDeg*Math.PI/180.0;
          var x = Math.cos(angleRad);
          var z = Math.sin(angleRad);

          vertices.push(x * innerRadius, 0, z * innerRadius);
          normals.push(normalize(vec3(x * innerRadius, 1.0, z * innerRadius)));

          vertices.push(x * outerRadius, 0, z * outerRadius);
          normals.push(normalize(vec3(x * outerRadius, 1.0, z * outerRadius)));
    }
    
   // Vertex array to store buffer and pointer data
  this.vao = this.gl.createVertexArray();
  this.gl.bindVertexArray(this.vao);
  
  var floatBytes = 4;
  //Creating buffers for vertices, normals, camera, light, color
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
    
    
  this.projectionMat = this.gl.getUniformLocation(shaderProgram, "projectionMat");
  this.viewMat = this.gl.getUniformLocation(shaderProgram, "viewMat");
  this.modelMatr = this.gl.getUniformLocation(shaderProgram, "modelMat");
    
  this.lightColor = this.gl.getUniformLocation(shaderProgram, "lightColor");
  this.ambientFactor = this.gl.getUniformLocation(shaderProgram, "ambientFactor");
  this.ringColor = this.gl.getUniformLocation(shaderProgram, "ringColor");
    
  this.materialColor = this.gl.getUniformLocation(shaderProgram, "materialColor");
  this.materialShiny = this.gl.getUniformLocation(shaderProgram, "shiny");
  this.isSun = this.gl.getUniformLocation(shaderProgram, "isSun");
  
  this.transformMat = this.gl.getUniformLocation(shaderProgram, "transformMat");
}

//update function updates the rings based on parameters from planet
Ring.prototype.Update = function(orbitX, orbitY, orbitZ, orbitTilt, translateMat) {
    //if the planet is saturn (is a personal not orbit ring)
    if (this.isSaturn) {
        this.translateMat = translateMat;
    } else {
        this.translateMat = translate(orbitX, orbitY, orbitZ);
    }
    this.tiltMat = rotate(orbitTilt, 0, 0, 1);  
};

//Function for planet to call to check if the ring is a personal ring
Ring.prototype.getSaturn = function() {
    return this.isSaturn;
};

//Render function that renders the orbit rings
Ring.prototype.Render = function(viewMat, isSun) {
    var gl = this.gl;
    //vertex array binding
    gl.bindVertexArray(this.vao);
    
    //Identity matrix
    this.modelMat = mat4();
    
    this.modelMat = mult(this.modelMat, this.translateMat);
    this.modelMat = mult(this.modelMat, this.tiltMat);
    
    var modelViewMat = mult(viewMat, this.modelMat);
    // Set transformation matrix for shader
    this.gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    this.gl.uniformMatrix4fv(this.modelMatr, false, flatten(this.modelMat));
    this.gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewMat));
   
   var lColor = vec3(1.0, 1.0, 1.0);
   if (!this.isSaturn) {
    var ambientFactor = 3;
   } else {
    var ambientFactor = 0.3;
   }
   
   var lightPosition = vec3(0, 0, 0);
   var ringColor = vec3(1.0,1.0,1.0);
   // Pass in the light info
   // No false for these as 2nd parameter
   this.gl.uniform3fv(this.lightPosition, flatten(lightPosition));
   this.gl.uniform3fv(this.lightColor, flatten(lColor));
   this.gl.uniform1f(this.ambientFactor, ambientFactor);
   this.gl.uniform3fv(this.ringColor, ringColor);
   
   var mColor = vec3(1.0, 1.0, 1.0);
   var mShiny = 50.0;
   this.gl.uniform3fv(this.materialColor, flatten(mColor));
   this.gl.uniform1f(this.materialShiny, mShiny);
   this.gl.uniform1f(this.isSun, isSun);
    
   //this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, (this.numSections + 1) * this.numSections);
   this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 2 * (this.numSections + 1));
    
   // Closes the planets saved vertex array of buffer and pointer data
   this.gl.bindVertexArray(null);
};



