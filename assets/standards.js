function startStandardsStarfield() {
  const canvas = document.querySelector("#starfield");
  const context = canvas.getContext("2d");
  const stars = Array.from({ length: 90 }, function () {
    return { x: Math.random(), y: Math.random(), z: Math.random() * 1.5 + 0.2 };
  });

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(237, 255, 249, .78)";
    stars.forEach(function (star) {
      star.y += 0.00055 * star.z;
      if (star.y > 1) star.y = 0;
      context.globalAlpha = 0.24 + star.z * 0.22;
      context.beginPath();
      context.arc(star.x * canvas.width, star.y * canvas.height, star.z, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

startStandardsStarfield();
