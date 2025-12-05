// Imports removed for local file compatibility


class App {
    constructor() {
        this.simulation = new Simulation();
        this.renderer = new Renderer('simulationCanvas');
        // this.chartHandler = new ChartHandler('evolutionChart'); // Removed

        this.isRunning = false;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.simSpeed = 2; // Generations per second (approx)

        this.initUI();
        this.loop = this.loop.bind(this);
    }

    initUI() {
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.startBtn.addEventListener('click', () => this.toggleSimulation());
        this.resetBtn.addEventListener('click', () => this.resetSimulation());

        // Scenario Buttons
        const scenarioBtns = document.querySelectorAll('.btn-scenario');
        scenarioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                scenarioBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                e.target.classList.add('active');

                const scenario = e.target.dataset.scenario;
                this.setScenario(scenario);
            });
        });

        // Sliders
        this.sliders = {}; // Store references to disable/enable
        this.sliders.insect = this.bindSlider('insectPop', 'insectVal', (val) => this.simulation.setEnv('insects', val));
        this.sliders.fruit = this.bindSlider('fruitPop', 'fruitVal', (val) => this.simulation.setEnv('fruits', val));
        this.sliders.predator = this.bindSlider('predatorPop', 'predatorVal', (val) => this.simulation.setEnv('predators', val));
        this.sliders.tree = this.bindSlider('treeDensity', 'treeVal', (val) => this.simulation.setEnv('trees', val));

        this.bindSlider('initPop', 'popVal', (val) => {
            this.simulation.setEnv('population', val);
            return val;
        });

        this.bindSlider('simSpeed', 'speedVal', (val) => {
            this.simSpeed = val;
            return val + 'x';
        });

        // Initial Render
        this.renderer.resize();
        this.renderer.draw(this.simulation.state);

        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.renderer.draw(this.simulation.state);
        });
    }

    setScenario(type) {
        // Reset simulation first
        this.resetSimulation();

        const setSlider = (id, val) => {
            const el = document.getElementById(id);
            el.value = val;
            el.dispatchEvent(new Event('input'));
        };

        const disableSliders = (disabled) => {
            ['insectPop', 'fruitPop', 'predatorPop', 'treeDensity'].forEach(id => {
                document.getElementById(id).disabled = disabled;
                document.getElementById(id).parentElement.style.opacity = disabled ? '0.5' : '1';
            });
        };

        this.simulation.targetTrait = null; // Clear previous target

        switch (type) {
            case 'visual-predation':
                setSlider('insectPop', 100);
                setSlider('fruitPop', 10);
                setSlider('predatorPop', 10);
                setSlider('treeDensity', 60);
                disableSliders(true);
                this.simulation.targetTrait = 'depth_perception_trait';
                break;
            case 'savanna':
                setSlider('insectPop', 30);
                setSlider('fruitPop', 30);
                setSlider('predatorPop', 20);
                setSlider('treeDensity', 25); // Low trees (Woodland)
                disableSliders(true);
                this.simulation.targetTrait = 'speed_trait';
                break;
            case 'predator':
                setSlider('insectPop', 50);
                setSlider('fruitPop', 50);
                setSlider('predatorPop', 90); // High predators
                setSlider('treeDensity', 60);
                disableSliders(true);
                this.simulation.targetTrait = 'intelligence_trait';
                break;
            case 'free':
            default:
                disableSliders(false);
                break;
        }
    }

    bindSlider(id, displayId, callback) {
        const slider = document.getElementById(id);
        const display = document.getElementById(displayId);

        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            const displayVal = callback(val);
            display.textContent = displayVal !== undefined ? displayVal : val + '%';
        });
    }

    toggleSimulation() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.startBtn.innerHTML = '<span class="icon">⏸</span> Pause';
        this.startBtn.classList.add('active');
        this.lastFrameTime = performance.now();
        this.loop();
    }

    pause() {
        this.isRunning = false;
        this.startBtn.innerHTML = '<span class="icon">▶</span> Resume';
        this.startBtn.classList.remove('active');
        cancelAnimationFrame(this.animationId);
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        try {
            const deltaTime = timestamp - this.lastFrameTime;
            const interval = 1000 / this.simSpeed;

            if (deltaTime > interval) {
                this.simulation.evolve();
                // this.chartHandler.update(this.simulation.generation, this.simulation.getStats());
                this.updateStats();
                this.lastFrameTime = timestamp;
            }

            // Render every frame for smooth animations (even if sim updates slower)
            this.renderer.draw(this.simulation.state);
        } catch (e) {
            console.error("Simulation Loop Error:", e);
            this.pause();
        }

        this.animationId = requestAnimationFrame(this.loop);
    }

    updateStats() {
        document.getElementById('genCounter').textContent = this.simulation.generation;
        document.getElementById('popStat').textContent = this.simulation.monkeys.length;

        const stats = this.simulation.getStats();

        // Update Trait Panel
        // Intelligence (1-10 scale)
        const intelPct = Math.min(100, (stats.avgBrain / 10) * 100);
        document.getElementById('meter-intel').style.width = `${intelPct}%`;
        document.getElementById('val-intel').textContent = stats.avgBrain.toFixed(1);

        // Depth Perception (1-10 scale)
        const depthPct = Math.min(100, (stats.avgDepth / 10) * 100);
        document.getElementById('meter-depth').style.width = `${depthPct}%`;
        document.getElementById('val-depth').textContent = stats.avgDepth.toFixed(1);

        // Speed (0.05 base, max ~0.2)
        const speedPct = Math.min(100, (stats.avgBipedal / 200) * 100); // avgBipedal is scaled * 1000 in sim, so 0.05*1000 = 50. 
        // Wait, getStats returns: avgBipedal: (totalSpeed / length) * 1000.
        // Base speed 0.05 -> 50. Max speed maybe 0.2 -> 200.
        // So 50/200 = 25%.
        document.getElementById('meter-speed').style.width = `${Math.min(100, stats.avgBipedal / 2)}%`; // 200 -> 100%
        document.getElementById('val-speed').textContent = (stats.avgBipedal / 1000).toFixed(3);

        let domTrait = 'Balanced';
        let maxVal = 0;
        // Simple logic for dominant trait text
        if (stats.avgDepth > 5) domTrait = 'Depth Perception';
        if (stats.avgBrain > 5) domTrait = 'Intelligence';
        if (stats.avgBipedal > 100) domTrait = 'Bipedalism';

        document.getElementById('domTrait').textContent = domTrait;
    }

    resetSimulation() {
        this.pause();
        this.simulation.reset();
        // this.chartHandler.reset();
        this.updateStats();
        this.renderer.draw(this.simulation.state);
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
