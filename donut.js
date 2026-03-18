function startDonutAnimation() {
    const outputElement = document.getElementById("donut-frame");

    if (!outputElement) {
        return;
    }

    let animationTimerId;
    let horizontalRotation = 1;
    let verticalRotation = 1;

    function renderFrame() {
        const characterBuffer = [];
        const depthBuffer = [];
        const cosineHorizontalRotation = Math.cos(horizontalRotation);
        const sineHorizontalRotation = Math.sin(horizontalRotation);
        const cosineVerticalRotation = Math.cos(verticalRotation);
        const sineVerticalRotation = Math.sin(verticalRotation);

        horizontalRotation += 0.07;
        verticalRotation += 0.03;

        for (let bufferIndex = 0; bufferIndex < 1760; bufferIndex += 1) {
            characterBuffer[bufferIndex] = bufferIndex % 80 === 79 ? "\n" : " ";
            depthBuffer[bufferIndex] = 0;
        }

        for (let tubeAngle = 0; tubeAngle < 6.28; tubeAngle += 0.07) {
            const cosineTubeAngle = Math.cos(tubeAngle);
            const sineTubeAngle = Math.sin(tubeAngle);

            for (let ringAngle = 0; ringAngle < 6.28; ringAngle += 0.02) {
                const sineRingAngle = Math.sin(ringAngle);
                const cosineRingAngle = Math.cos(ringAngle);
                const ringRadius = cosineTubeAngle + 2;
                const inverseDepth = 1 / (sineRingAngle * ringRadius * sineHorizontalRotation + sineTubeAngle * cosineHorizontalRotation + 5);
                const projectedY = sineRingAngle * ringRadius * cosineHorizontalRotation - sineTubeAngle * sineHorizontalRotation;
                const screenX = 0 | (40 + 30 * inverseDepth * (cosineRingAngle * ringRadius * cosineVerticalRotation - projectedY * sineVerticalRotation));
                const screenY = 0 | (12 + 15 * inverseDepth * (cosineRingAngle * ringRadius * sineVerticalRotation + projectedY * cosineVerticalRotation));
                const bufferOffset = screenX + 80 * screenY;
                const brightnessIndex = 0 | (8 * ((sineTubeAngle * sineHorizontalRotation - sineRingAngle * cosineTubeAngle * cosineHorizontalRotation) * cosineVerticalRotation - sineRingAngle * cosineTubeAngle * sineHorizontalRotation - sineTubeAngle * cosineHorizontalRotation - cosineRingAngle * cosineTubeAngle * sineVerticalRotation));

                if (screenY >= 0 && screenY < 22 && screenX >= 0 && screenX < 79 && inverseDepth > depthBuffer[bufferOffset]) {
                    depthBuffer[bufferOffset] = inverseDepth;
                    characterBuffer[bufferOffset] = ".,-~:;=!*#$@"[brightnessIndex > 0 ? brightnessIndex : 0];
                }
            }
        }

        outputElement.textContent = characterBuffer.join("");
    }

    renderFrame();
    animationTimerId = setInterval(renderFrame, 50);

    window.addEventListener("beforeunload", function cleanupAnimation() {
        clearInterval(animationTimerId);
    });
}

window.addEventListener("load", startDonutAnimation, { once: true });
