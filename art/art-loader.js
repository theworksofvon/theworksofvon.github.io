/**
 * Art Loader - dynamically loads computational art sketches
 */
(function() {
  class ArtLoader {
    constructor() {
      this.registry = new Map(); // id -> factory(container) => p5 sketch
      this.instances = []; // active p5 instances
      this.initialized = false;
      this.manifest = [];
    }

    register(id, factory) {
      this.registry.set(id, factory);
    }

    async init() {
      if (this.initialized) return;
      try {
        const res = await fetch('/art/index.json');
        if (res.ok) {
          this.manifest = await res.json();
        } else {
          console.warn('Art index not found, using fallback');
          this.manifest = this.getFallback();
        }
      } catch (e) {
        console.warn('Failed to load art index:', e);
        this.manifest = this.getFallback();
      }
      this.initialized = true;
    }

    getFallback() {
      return [
        { id: 'neon-orbits', title: 'Neon Orbits', script: '/art/sketches/neon-orbits.js' },
        { id: 'matrix-flow', title: 'Matrix Flow', script: '/art/sketches/matrix-flow.js' }
      ];
    }

    async loadScripts() {
      // Load each sketch script exactly once
      const promises = this.manifest.map(item => this.loadScript(item.script));
      await Promise.all(promises);
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        // Avoid duplicate loads
        if (document.querySelector(`script[data-art-src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.dataset.artSrc = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load art script: ' + src));
        document.head.appendChild(s);
      });
    }

    clearInstances() {
      while (this.instances.length) {
        const inst = this.instances.pop();
        try { inst.remove && inst.remove(); } catch (_) {}
      }
    }

    async renderGrid() {
      await this.init();
      const grid = document.getElementById('art-grid');
      if (!grid) return;

      // Build cards
      grid.innerHTML = this.manifest.map(item => `
        <div class="art-card">
          <div class="art-title">${item.title}</div>
          <div class="art-canvas" data-sketch-id="${item.id}"></div>
        </div>
      `).join('');

      // Ensure scripts are loaded then initialize sketches
      await this.loadScripts();
      this.initializeArt();
    }

    initializeArt() {
      this.clearInstances();
      const canvases = document.querySelectorAll('.art-canvas');
      canvases.forEach(container => {
        const id = container.getAttribute('data-sketch-id');
        const factory = this.registry.get(id);
        if (factory) {
          const sketch = factory(container);
          const instance = new p5(sketch, container);
          this.instances.push(instance);
        }
      });
    }
  }

  // Expose singleton
  window.artLoader = new ArtLoader();

  // Auto-render when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('art-grid')) {
      window.artLoader.renderGrid().catch(err => console.error(err));
    }
  });
})();


