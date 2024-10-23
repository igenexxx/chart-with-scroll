import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private charts: { [key: string]: Chart } = {};

  constructor() {
    Chart.register(...registerables);
  }

  createChart(chartId: string, context: CanvasRenderingContext2D, config: ChartConfiguration<ChartType>) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }
    this.charts[chartId] = new Chart(context, config);
  }

  updateChart(chartId: string, labels: string[], data: number[], chartType: ChartType) {
    const chart = this.charts[chartId];
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      if ('type' in chart.config && chart.config.type !== chartType) {
        chart.config.type = chartType;
        chart.options.indexAxis = chartType === 'bar' ? 'y' : 'x';
      }
      chart.update();
    }
  }
}
