const PI = Math.PI;

const canvasCols = 220;
const canvasRows = 72;
const canvasArea = canvasCols * canvasRows;
const canvasCenterX = canvasCols / 2;
const canvasCenterY = canvasRows / 2;

const majorRad = 22;
const minorRad = 4.2;
const poloidalStep = 0.07;
const toroidalStep = 0.02;

const cameraDist = 28;
const frameIntervalMs = 50;
const shadingRamp = ".,-~:;=!*#$@";

let axialRot = 1;
let elevRot = 1;

/**
 * @param {{
 *   sinPoloidal: number,
 *   cosPoloidal: number,
 *   sinToroidal: number,
 *   cosToroidal: number,
 *   sinAxialRot: number,
 *   cosAxialRot: number,
 *   sinElevRot: number,
 *   cosElevRot: number,
 * }} trig
 * @returns {number}
 */
function getBrightnessIndex({
  sinPoloidal,
  cosPoloidal,
  sinToroidal,
  cosToroidal,
  sinAxialRot,
  cosAxialRot,
  sinElevRot,
  cosElevRot,
}) {
  return (
    0 |
    (8 *
      ((sinPoloidal * sinAxialRot - sinToroidal * cosPoloidal * cosAxialRot) *
        cosElevRot -
        sinToroidal * cosPoloidal * sinAxialRot -
        sinPoloidal * cosAxialRot -
        cosToroidal * cosPoloidal * sinElevRot))
  );
}

/**
 * @param {HTMLElement} torusFrame
 * @returns {void}
 */
function renderFrame(torusFrame) {
  const characterBuffer = [];
  const depthBuffer = [];
  const cosAxialRot = Math.cos(axialRot);
  const sinAxialRot = Math.sin(axialRot);
  const cosElevRot = Math.cos(elevRot);
  const sinElevRot = Math.sin(elevRot);

  axialRot += 0.011;
  elevRot += 0.005;

  for (let bufferIndex = 0; bufferIndex < canvasArea; bufferIndex += 1) {
    characterBuffer[bufferIndex] =
      bufferIndex % canvasCols === canvasCols - 1 ? "\n" : " ";
    depthBuffer[bufferIndex] = 0;
  }

  for (
    let poloidalAngle = 0;
    poloidalAngle < 2 * PI;
    poloidalAngle += poloidalStep
  ) {
    const cosPoloidal = Math.cos(poloidalAngle);
    const sinPoloidal = Math.sin(poloidalAngle);

    for (
      let toroidalAngle = 0;
      toroidalAngle < 2 * PI;
      toroidalAngle += toroidalStep
    ) {
      const sinToroidal = Math.sin(toroidalAngle);
      const cosToroidal = Math.cos(toroidalAngle);
      const radialDist = majorRad + minorRad * cosPoloidal;
      const tubeOffsetY = minorRad * sinPoloidal;
      const invDepth =
        1 /
        (sinToroidal * radialDist * sinAxialRot +
          tubeOffsetY * cosAxialRot +
          cameraDist);
      const projY =
        sinToroidal * radialDist * cosAxialRot - tubeOffsetY * sinAxialRot;
      const x =
        0 |
        (canvasCenterX +
          40 *
            invDepth *
            (cosToroidal * radialDist * cosElevRot - projY * sinElevRot));
      const y =
        0 |
        (canvasCenterY +
          18 *
            invDepth *
            (cosToroidal * radialDist * sinElevRot + projY * cosElevRot));
      const bufferOffset = x + canvasCols * y;
      const brightnessIndex = getBrightnessIndex({
        sinPoloidal,
        cosPoloidal,
        sinToroidal,
        cosToroidal,
        sinAxialRot,
        cosAxialRot,
        sinElevRot,
        cosElevRot,
      });

      if (
        y >= 0 &&
        y < canvasRows &&
        x >= 0 &&
        x < canvasCols - 1 &&
        invDepth > depthBuffer[bufferOffset]
      ) {
        depthBuffer[bufferOffset] = invDepth;
        characterBuffer[bufferOffset] =
          shadingRamp[Math.max(brightnessIndex, 0)];
      }
    }
  }

  torusFrame.textContent = characterBuffer.join("");
}

/**
 * @returns {void}
 */
function startTorusAnimation() {
  const TorusFrameElement = document.getElementById("torus-frame");

  if (!TorusFrameElement) {
    return;
  }

  /** @type {HTMLElement} */
  const TorusFrame = TorusFrameElement;
  let isAnimating = false;

  /** @type {ReturnType<typeof setInterval> | undefined} */
  let animationTimerId;

  function startAnimation() {
    if (isAnimating) {
      return;
    }

    animationTimerId = setInterval(function animateTorus() {
      renderFrame(TorusFrame);
    }, frameIntervalMs);
    isAnimating = true;
  }

  function stopAnimation() {
    if (!isAnimating) {
      return;
    }

    clearInterval(animationTimerId);
    animationTimerId = undefined;
    isAnimating = false;
  }

  function toggleAnimation() {
    if (isAnimating) {
      stopAnimation();
      return;
    }

    startAnimation();
  }

  renderFrame(TorusFrame);
  startAnimation();

  globalThis.addEventListener("click", toggleAnimation);

  globalThis.addEventListener("beforeunload", function cleanupAnimation() {
    stopAnimation();
  });
}

globalThis.addEventListener("load", startTorusAnimation, { once: true });
