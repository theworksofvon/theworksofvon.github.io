(function() {
  const factory = (container) => (p) => {
    let w = container.clientWidth;
    let h = container.clientHeight;
    const chars = '01';
    const fontSize = 16;
    let columns, drops;
    p.setup = () => {
      p.createCanvas(w, h);
      p.textFont('monospace');
      p.fill(0, 255, 65);
      p.noStroke();
      columns = Math.floor(w / fontSize);
      drops = Array(columns).fill(1);
    };
    p.windowResized = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      p.resizeCanvas(w, h);
      columns = Math.floor(w / fontSize);
      drops = Array(columns).fill(1);
    };
    p.draw = () => {
      p.background(10, 50);
      p.fill(0, 255, 65);
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        p.text(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
  };

  if (window.artLoader) {
    window.artLoader.register('matrix-flow', factory);
  }
})();


