export class ChartContainer {
    constructor(config) {
        this.id = config.id;
        this.type = config.type || 'line';
        this.chart = null;
        this.datasets = config.datasets;
        this.chartLength = 0;
        this.renderPeriod = config.renderPeriod || 1000;

        if (document.getElementById(config.id)) {
            this.title = config.title;
            this.desc = config.desc;
            this.titleEl = document.getElementById(config.id).closest('.chart_container').querySelector('.chart_title_wrap p');
        }

        this.options = {
            animation: {
                duration: 0,
            },
            pointStyle: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'start',
                    labels: {
                        boxWidth: 10,
                        boxHeight: 10,
                        font: {
                            family: 'Tossface, Pretendard-Regular',
                        },
                    },
                },
            },
            scales: {},
            interaction: {
                // 툴팁을 완전히 비활성화하는 설정
                mode: 'none',
            },
            datasetOptions: {
                borderWidth: 1,
                tension: 0.5,
            },
        };
    }

    init(map, type) {
        if (!document.getElementById(this.id)) return;
        this.map = map;

        this.titleEl.innerText = this.title;
        if (this.desc) this.titleEl.innerHTML += `<span>${this.desc}</span>`;

        const ctx = document.getElementById(this.id);
        this.chart = new Chart(ctx, {
            type: this.type,
            data: {
                labels: [],
                datasets: this.datasets.map((dataset) => {
                    return {
                        label: dataset[0],
                        borderColor: dataset[1],
                        data: [],
                        ...this.options.datasetOptions,
                    };
                }),
            },
            options: this.options,
        });

        switch (type) {
            case 'object-count':
                this.chart.options.scales = {
                    y: {
                        suggestedMin: 0,
                    },
                };

                this.timer = setInterval(() => {
                    if (this.chart.data.labels.length > 1000) {
                        this.chart.data.labels.shift();
                        this.chart.datasets.forEach((dataset) => {
                            dataset.data.shift();
                        });
                    }

                    this.chart.data.labels.push(this.chartLength);
                    this.datasets.forEach((dataset, index) => {
                        if(dataset[2] === 'K'){
                            this.chart.data.datasets[index].data.push(180);
                        }else if(dataset[2] === 'food'){
                            this.chart.data.datasets[index].data.push(this.map.getObjCount(dataset[2])/3);
                        }else{
                            this.chart.data.datasets[index].data.push(this.map.getObjCount(dataset[2]));
                        }
                        
                    });
                    this.chartLength += 1;
                    this.chart.update();
                }, this.renderPeriod / this.map.speed);
                break;

            case 'object-area':
                this.chart.options.scales = {
                    x: {
                        suggestedMin: 0, // X축 최소값
                        suggestedMax: 25, // X축 최대값
                    },
                    y: {
                        reverse: true,
                        suggestedMin: 0, // Y축 최소값
                        suggestedMax: 25, // Y축 최대값
                    },
                };

                this.chart.options.pointStyle = 'circle';
                this.chart.data.datasets.forEach((dataset) => (dataset.backgroundColor = dataset.borderColor));

                this.timer = setInterval(() => {
                    const fields = [];

                    for (let x = 0; x < 25; x++) {
                        fields[x] = [];
                        for (let y = 0; y < 25; y++) {
                            this.datasets.forEach((dataset) => {
                                fields[x][y] = fields[x][y] || {};
                                fields[x][y][dataset[2]] = 0;
                            });
                        }
                    }

                    for (let x = 0; x < 100; x++) {
                        for (let y = 0; y < 100; y++) {
                            this.datasets.forEach((dataset) => {
                                fields[Math.floor(x / 4)][Math.floor(y / 4)][dataset[2]] += this.map.tiles[x][y].content?.type === dataset[2] ? 1 : 0;
                            });
                        }
                    }

                    this.chart.data.labels = [];
                    this.datasets.forEach((dataset, index) => {
                        this.chart.data.datasets[index].data = [];
                    });

                    for (let x = 0; x < 25; x++) {
                        for (let y = 0; y < 25; y++) {
                            this.datasets.forEach((dataset, index) => {
                                this.chart.data.datasets[index].data.push({ x: x, y: y, r: fields[x][y][dataset[2]] * 1.5 });
                            });
                        }
                    }

                    this.chart.update();
                }, this.renderPeriod / this.map.speed);
                break;

            case 'object-age':
                this.chart.options.scales = {
                    x: {
                        reverse: true,
                        suggestedMin: 0, // X축 최소값
                        suggestedMax: 100, // X축 최대값
                        // title: {
                        //     display: true,
                        //     text: '연령',
                        // },
                    },
                    y: {
                        suggestedMin: 0, // Y축 최소값
                        // title: {
                        //     display: true,
                        //     text: '생존 개체 수',
                        // },
                    },
                };

                for (let i = 0; i < 10; i++) {
                    this.chart.data.labels.push(10 - i);
                    this.chart.data.datasets.forEach((dataset) => {
                        dataset.data.push(0);
                    });
                }

                this.timer = setInterval(() => {
                    // 초기화
                    this.chart.data.datasets.forEach((dataset) => dataset.data = dataset.data.map((data) => 0));

                    for (let x = 0; x < 100; x++) {
                        for (let y = 0; y < 100; y++) {
                            this.datasets.forEach((dataset, index) => {
                                if (this.map.tiles[x][y].content?.type === dataset[2]) {
                                    this.chart.data.datasets[index].data[Math.floor((this.map.tiles[x][y].content.lifeSpan / this.map.tiles[x][y].content.defaultLifeSpan) * 10)] += 1;
                                }
                            });
                        }
                    }
                    this.chart.update();
                }, this.renderPeriod / this.map.speed);
                break;
        }
        return this.chart;
    }

    reset() {
        this.chartLength = 0;
        this.chart.data.labels = [];
        this.datasets.forEach((dataset, index) => {
            this.chart.data.datasets[index].data = [];
        });
        this.chart.update();
    }

    stop() {
        clearInterval(this.timer);
    }
}
