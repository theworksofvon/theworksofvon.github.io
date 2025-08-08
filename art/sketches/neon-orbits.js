(function() {
  const factory = (container) => (p) => {
    let t = 0;
    let w = container.clientWidth;
    let h = container.clientHeight;
    p.setup = () => {
      p.createCanvas(w, h);
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.noFill();
      p.frameRate(60);
    };
    p.windowResized = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      p.resizeCanvas(w, h);
    };
    p.draw = () => {
      p.background(10, 20);
      p.translate(w/2, h/2);
      for (let i = 0; i < 80; i++) {
        const angle = t * 0.5 + i * 0.1;
        const radius = 10 + i * 3 + 10 * p.sin(t + i * 0.2);
        const x = radius * p.cos(angle);
        const y = radius * p.sin(angle);
        p.stroke(130 + (i * 3) % 120, 100, 100, 60);
        p.ellipse(x, y, 6 + (i % 5), 6 + (i % 5));
      }
      t += 0.02;
    };
  };

  if (window.artLoader) {
    window.artLoader.register('neon-orbits', factory);
  }
})();


