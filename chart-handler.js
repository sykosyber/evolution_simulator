class ChartHandler {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = null;
        this.initChart();
    }

    initChart() {
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Depth Perception',
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Bipedalism',
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Brain Size',
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Tool Use',
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        data: [],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        // max: 100, // Removed to allow auto-scaling
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                },
                animation: false // Disable animation for performance
            }
        });
    }

    update(generation, stats) {
        if (this.chart.data.labels.length > 50) {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(ds => ds.data.shift());
        }

        this.chart.data.labels.push(generation);
        this.chart.data.datasets[0].data.push(stats.avgDepth);
        this.chart.data.datasets[1].data.push(stats.avgBipedal);
        this.chart.data.datasets[2].data.push(stats.avgBrain);
        this.chart.data.datasets[3].data.push(stats.avgTool);

        this.chart.update();
    }

    reset() {
        this.chart.data.labels = [];
        this.chart.data.datasets.forEach(ds => ds.data = []);
        this.chart.update();
    }
}
