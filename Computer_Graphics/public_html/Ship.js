//Jack Warder - Solar System - Project 2
////Ship class
//Controls the camera of the solar system
var radianConv = Math.PI/180;
function Ship(shaderProgram, canvasID) {
    
    //Setting up canvas
    this.canvasID = canvasID;
    
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
    
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);
    this.transformMat = this.gl.getUniformLocation(shaderProgram, "transformMat");
    this.gl.useProgram(shaderProgram);
    this.gl.enable(this.gl.DEPTH_TEST);
    
    //Initiazlizing variables
    this.xPos = 0;
    this.yPos = 0;
    this.zPos = 40;
    
    this.rotation = 0;
    this.projectionMat = mat4();
    this.viewMat = mat4();
    var scale = 5;
    
    //Creating triangle vertices
    Ship.prototype.triangleArray = Float32Array.of(
        0.0, 1.5 * scale, 0.0,
        1.0 *scale, 0.0, 0.0,
        -0.5 *scale, -0.5*scale, 0.0, 
        0.0, 1.0*scale, 0.0,
        0.5*scale, -0.5*scale, 0.0,
        0.0, 0.0, 1.0*scale
    );
    
    //Creating buffer for the triangle
    this.shipBuffer = this.gl.createBuffer(); // get unique buffer ID number
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shipBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.triangleArray, this.gl.STATIC_DRAW);

    // Specify locations of vertex coordinates in buffer for vPosition
    var floatBytes = 4; // number of bytes in a float value
    this.vPosition = this.gl.getAttribLocation(shaderProgram, "vPosition");
    this.gl.vertexAttribPointer(this.vPosition, 3, this.gl.FLOAT, false, 6 * floatBytes, 0);
    this.gl.enableVertexAttribArray(this.vPosition);

    // Specify locations of vertex colors in buffer for vColor
    this.vColor = this.gl.getAttribLocation(shaderProgram, "vColor");
    this.gl.vertexAttribPointer(this.vColor, 3, this.gl.FLOAT, false, 6 * floatBytes, 3 * floatBytes);
    this.gl.enableVertexAttribArray(this.vColor);
    
    this.Update();
    
}

//Functions that control the movement of the camera based off of the delta 
//value passed to us in Solar event listener
Ship.prototype.MoveForward = function(delta) {
    this.zPos += (Math.cos(this.rotation*radianConv) * delta);
    this.xPos += (Math.sin(this.rotation*radianConv) * delta);
    this.Update();
};

Ship.prototype.MoveBackward = function(delta) {
    this.zPos -= (Math.cos(this.rotation*radianConv) * delta);
    this.xPos -= (Math.sin(this.rotation*radianConv) * delta);
    this.Update();
};

Ship.prototype.MoveLeft = function(delta) {
    this.xPos -= (Math.cos(this.rotation*radianConv) * delta);
    this.zPos += (Math.sin(this.rotation*radianConv) * delta);
    this.Update();
};

Ship.prototype.MoveRight = function(delta) {
    this.xPos += (Math.cos(this.rotation*radianConv) * delta);
    this.zPos -= (Math.sin(this.rotation*radianConv) * delta);
    this.Update();
};

Ship.prototype.MoveUp = function(delta) {
    this.yPos += delta;
    this.Update();
};

Ship.prototype.MoveDown = function(delta) {
    this.yPos -= delta;
    this.Update();
};

Ship.prototype.RotateCW = function(delta) {
    this.rotation += delta;
    this.Update();
};

Ship.prototype.RotateCCW = function(delta) {
    this.rotation -= delta;
    this.Update();
};

//Ship updates the view Matrix (camera) for our solar system
Ship.prototype.Update = function() {
    
    // Setup of viewing matrix
    var aspectRat = this.canvas.width/this.canvas.height;
    this.projectionMat = perspective(90, aspectRat, .1, 100);
    var lookX = this.xPos - Math.sin(this.rotation*radianConv);
    var lookY = this.yPos;
    var lookZ = this.zPos - Math.cos(this.rotation*radianConv);
    this.viewMat = lookAt(vec3(this.xPos, this.yPos, this.zPos), vec3(lookX, lookY, lookZ), vec3(0, 1, 0));
    this.viewMat = mult(this.projectionMat, this.viewMat);
    
};

//Function to get the view matrix of the ship in Solars render to give to Planet
Ship.prototype.GetViewMatrix = function() {
    return this.viewMat;
};

//Function that renders the ship onto the second viewport
Ship.prototype.RenderShip = function(viewMat) {   
    //vertex array binding
   this.gl.bindVertexArray(this.vao);
   
   //Caculate matrix based off of ship rotation and position
   var t = translate(this.xPos,this.yPos,this.zPos);
   var rotY = rotateY(this.rotation);
   var modelMat = mat4();


   modelMat = mult(modelMat,t);
   modelMat = mult(modelMat, rotY);

   
   var modelViewMat = mult(viewMat, modelMat);
   this.gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewMat));
   
  //Draw ship using TRIANGLES
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  
  //unbind vao
  this.gl.bindVertexArray(null);
};