#version 300 es

//initializing values for the shader
in vec3 vPosition;    
in vec3 vNormal;
in vec2 vCoord;

uniform mat4 viewMat;
uniform mat4 modelMat;
uniform mat4 transformMat;

uniform vec3 lightColor;
uniform float ambientFactor;

uniform vec3 materialColor;
uniform float shiny;

uniform bool isSun;
      
// Interpolated values for the fragment shader
out vec3 fColor;
out vec2 fTexCoord;

void main() {
    //single light position for origin(sun)
    vec3 lightPosition = vec3(0.0, 0.0, 0.0);
    
    vec4 posVC4 = viewMat * modelMat * vec4(vPosition.xyz, 1.0); 
    vec4 normVC4 = viewMat * modelMat * vec4(vNormal.xyz, 0.0);
    vec4 lightVC4 = viewMat * vec4(lightPosition.xyz, 1.0);

    //using transformation matrix to get the position
    gl_Position = transformMat * vec4(vPosition, 1.0);
    
    vec3 normVC3 = normalize(normVC4.xyz); 

    vec3 posVC3 = posVC4.xyz;
    vec3 lightVC3 = lightVC4.xyz;
    
    vec3 unitL = normalize(lightVC3 - posVC3);
    vec3 unitV = normalize(vec3(0, 0, 0) - posVC3);
    vec3 unitH = normalize(unitL + unitV);

    vec3 ambientComponent = lightColor * materialColor * ambientFactor;

    float diffuseFactor = dot(unitL, normVC3);
    if (diffuseFactor < 0.0) {
        diffuseFactor = 0.0;
    }
    vec3 diffuseComponent = lightColor * materialColor * diffuseFactor;
    
    float specularFactor = dot(unitH, normVC3);
    vec3 specularComponent = lightColor * materialColor * specularFactor;
    
    vec3 phong = vec3(0,0,0);
    
    //if it is emanating light then add a bunch of ambient componenets
    if (isSun) {
        
        phong += ambientComponent + ambientComponent + ambientComponent;

    }
    //if it is not emanating add all components together
    else {
        phong += ambientComponent;
        phong += diffuseComponent;
        phong += specularComponent;
    }
    //transfer to fshader
    fColor = phong;
    fTexCoord = vCoord;
   
}
