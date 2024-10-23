import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ChartService } from '../chart.service';

@Component({
  selector: 'app-chart-pagination',
  templateUrl: './chart-pagination.component.html',
  styleUrls: ['./chart-pagination.component.css'],
  standalone: true,
})
export class ChartPaginationComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  
  currentStartIndex = 0;
  itemsPerPage = 100;
  totalData: number[] = [];

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    // Load the initial data
    this.loadInitialData();
  }

  ngAfterViewInit() {
    if (this.chartCanvas) {
      const context = this.chartCanvas.nativeElement.getContext('2d');
      if (context) {
        this.chartService.createChart('lineChart', context, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              data: [],
              label: 'Dataset',
              fill: true,
            }]
          },
          options: {
            animation: false,
            responsive: true, // Set to true to allow chart to adapt to parent width
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              x: {
                beginAtZero: true
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
        this.updateChartData();
      }
    }
  }

  loadInitialData() {
    // Simulate a backend call to fetch 5000 items
    this.totalData = Array.from({ length: 5000 }, (_, i) => Math.floor(Math.random() * 100));
    this.updateChartData();
  }

  updateChartData() {
    const currentDataChunk = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
    const labels = currentDataChunk.map((_, index) => `Label ${index + 1 + this.currentStartIndex}`);
    const data = currentDataChunk;
    this.chartService.updateChart('lineChart', labels, data);
  }

  @HostListener('window:wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.deltaY > 0 && this.currentStartIndex + this.itemsPerPage < this.totalData.length) {
      this.currentStartIndex += 10; // Scroll by 10 items
    } else if (event.deltaY < 0 && this.currentStartIndex > 0) {
      this.currentStartIndex -= 10; // Scroll back by 10 items
    }
    this.updateChartData();
  }
}