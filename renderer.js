class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
    }

    resize() {
        // Use the CSS-determined size
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    draw(state) {
        if (!state.terrain || state.terrain.length === 0) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const rows = state.rows;
        const cols = state.cols;
        const cellWidth = this.width / cols;
        const cellHeight = this.height / rows;
        const fontSize = Math.min(cellWidth, cellHeight) * 1.2;

        this.ctx.font = `${fontSize}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw Terrain & Static Objects
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const type = state.terrain[i][j];
                const cx = (j + 0.5) * cellWidth;
                const cy = (i + 0.5) * cellHeight;

                // Background
                let color;
                if (type === 0) color = '#3b82f6'; // Water
                else if (type === 1) color = '#86efac'; // Meadow
                else color = '#14532d'; // Forest

                this.ctx.fillStyle = color;
                this.ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth + 0.5, cellHeight + 0.5);

                // Tree Emoji for Forest
                if (type === 2) {
                    // Make trees BIGGER
                    this.ctx.font = `${fontSize * 1.5}px serif`;
                    this.ctx.fillText('🌳', cx, cy);
                    this.ctx.font = `${fontSize}px serif`; // Reset
                }

                // Banana
                if (state.bananas[i][j]) {
                    this.ctx.fillText('🍌', cx, cy);
                }
            }
        }

        // Draw Insects
        if (state.insects) {
            state.insects.forEach(ins => {
                const cx = (ins.x + 0.5) * cellWidth; // Adjust for center if x is grid coord
                // Actually ins.x is float 0..cols. So x * cellWidth is correct for top-left? 
                // No, ins.x is 0..64. So x*cellWidth is pixel coord.
                // Text is drawn at center.
                const x = ins.x * cellWidth;
                const y = ins.y * cellHeight;
                this.ctx.fillText('🦗', x, y);
            });
        }

        // Draw Tigers
        if (state.tigers) {
            state.tigers.forEach(tiger => {
                const x = tiger.x * cellWidth;
                const y = tiger.y * cellHeight;
                this.ctx.font = `${fontSize * 1.5}px serif`; // Bigger tiger
                this.ctx.fillText('🐅', x, y);
                this.ctx.font = `${fontSize}px serif`; // Reset
            });
        }

        // Draw Monkeys
        state.monkeys.forEach(monkey => {
            const x = monkey.x * cellWidth;
            const y = monkey.y * cellHeight;

            this.ctx.save();
            if (monkey.gender === 'female') {
                this.ctx.filter = 'hue-rotate(45deg) brightness(1.2)'; // Pinkish/Lighter
            } else {
                this.ctx.filter = 'brightness(0.9)'; // Darker
            }
            this.ctx.fillText('🐒', x, y);
            this.ctx.restore();
        });
    }
}
