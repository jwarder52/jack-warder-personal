#version 300 es

precision highp float;

uniform sampler2D fTexSampler;

in vec3 fColor;
in vec2 fTexCoord;

out vec4 final_color;

void main() {
  final_color = vec4(fColor, 1.0) * texture(fTexSampler, fTexCoord);
}