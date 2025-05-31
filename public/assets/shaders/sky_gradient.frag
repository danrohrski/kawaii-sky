precision mediump float;

void main() {
    // Use built-in gl_FragCoord and estimate resolution
    // Most game canvases are around 800x600, so we'll normalize accordingly
    vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0);

    // Clamp UV to 0-1 range to handle different resolutions
    uv = clamp(uv, 0.0, 1.0);

    // Define beautiful kawaii pastel colors
    vec3 skyTop = vec3(0.86, 0.93, 1.0);      // Light sky blue (#DCE9FF)
    vec3 skyMiddle = vec3(1.0, 0.94, 0.96);    // Soft pink (#FFF0F5)
    vec3 skyBottom = vec3(1.0, 0.98, 0.85);   // Warm cream (#FFF9D9)

    // Create a smooth vertical gradient
    vec3 color;
    if (uv.y > 0.6) {
        // Top portion - transition from pink to sky blue
        float t = (uv.y - 0.6) / 0.4;
        color = mix(skyMiddle, skyTop, t);
    } else {
        // Bottom portion - transition from cream to pink
        float t = uv.y / 0.6;
        color = mix(skyBottom, skyMiddle, t);
    }

    // Add very subtle static texture for depth
    float noise = sin(uv.x * 15.0) * sin(uv.y * 8.0) * 0.008;
    color += noise;

    // Ensure colors stay in valid range
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
