import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ChartService } from '../chart.service';
import { ChartConfiguration, ChartType, ChartTypeRegistry } from 'chart.js';

@Component({
  selector: 'app-chart-pagination',
  templateUrl: './chart-pagination.component.html',
  styleUrls: ['./chart-pagination.component.css'],
  standalone: true,
})
export class ChartPaginationComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  @ViewChild('scrollCanvas') scrollCanvas: ElementRef | undefined;
  
  currentStartIndex = 0;
  itemsPerPage = 100;
  totalData: number[] = [];
  visibleData: number[] = [];
  scrollBarSize = 10;
  isDragging = false;
  chartType: keyof ChartTypeRegistry = 'bar';
  constructor(private chartService: ChartService) {}

  ngOnInit() {
    // Load the initial data
    this.loadInitialData();
  }

  ngAfterViewInit() {
    this.initializeChart();
    this.updateChartData();
    this.updateScrollCanvas();
    this.drawScrollBar();
  }

  initializeChart() {
    if (this.chartCanvas) {
      const context = this.chartCanvas.nativeElement.getContext('2d');
      if (context) {
        const chartConfig = {
          type: this.chartType === 'bar' ? 'bar' : 'line',
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
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: (this.chartType === 'bar' ? 'y' : 'x'),
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
        } as ChartConfiguration<ChartType>;
        this.chartService.createChart('chart', context, chartConfig);
      }
    }
  }

  loadInitialData() {
    this.totalData = Array.from({ length: 5000 }, (_, i) => Math.floor(Math.random() * 100));
    this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
    this.updateChartData();
  }

  updateChartData() {
    const labels = this.visibleData.map((_, index) => `Label ${index + 1 + this.currentStartIndex}`);
    const data = this.visibleData;
    this.chartService.updateChart('chart', labels, data, this.chartType);
    this.updateScrollCanvas();
    this.drawScrollBar();
  }

  updateScrollCanvas() {
    if (this.scrollCanvas && this.chartCanvas) {
      if (this.chartType === 'bar') {
        this.scrollCanvas.nativeElement.height = this.chartCanvas.nativeElement.clientHeight;
      } else {
        this.scrollCanvas.nativeElement.width = this.chartCanvas.nativeElement.clientWidth;
      }
    }
  }

  @HostListener('window:wheel', ['$event'])
  onScroll(event: WheelEvent) {
    const scrollStep = 10;
    if (this.chartType === 'bar') {
      if (event.deltaY > 0 && this.currentStartIndex + this.itemsPerPage < this.totalData.length) {
        this.currentStartIndex = Math.min(this.currentStartIndex + scrollStep, this.totalData.length - this.itemsPerPage);
        this.checkAndFetchMoreData();
      } else if (event.deltaY < 0 && this.currentStartIndex > 0) {
        this.currentStartIndex = Math.max(this.currentStartIndex - scrollStep, 0);
      }
    } else {
      if (event.deltaY > 0 && this.currentStartIndex + this.itemsPerPage < this.totalData.length) {
        this.currentStartIndex = Math.min(this.currentStartIndex + scrollStep, this.totalData.length - this.itemsPerPage);
        this.checkAndFetchMoreData();
      } else if (event.deltaY < 0 && this.currentStartIndex > 0) {
        this.currentStartIndex = Math.max(this.currentStartIndex - scrollStep, 0);
      }
    }
    this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
    this.updateChartData();
  }

  drawScrollBar() {
    if (this.scrollCanvas) {
      const context = this.scrollCanvas.nativeElement.getContext('2d');
      if (context) {
        const canvasSize = this.chartType === 'bar' ? this.scrollCanvas.nativeElement.height : this.scrollCanvas.nativeElement.width;
        const scrollBarThickness = this.scrollBarSize;
        const totalItems = this.totalData.length;
        const visibleItems = this.itemsPerPage;

        context.clearRect(0, 0, this.scrollCanvas.nativeElement.width, this.scrollCanvas.nativeElement.height);

        context.fillStyle = '#e0e0e0';
        if (this.chartType === 'bar') {
          context.fillRect(0, 0, scrollBarThickness, canvasSize);
        } else {
          context.fillRect(0, 0, canvasSize, scrollBarThickness);
        }

        const thumbSize = (visibleItems / totalItems) * canvasSize;
        const thumbPosition = (this.currentStartIndex / totalItems) * canvasSize;

        context.fillStyle = '#888888';
        if (this.chartType === 'bar') {
          context.fillRect(0, thumbPosition, scrollBarThickness, thumbSize);
        } else {
          context.fillRect(thumbPosition, 0, thumbSize, scrollBarThickness);
        }
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.scrollCanvas && event.target === this.scrollCanvas.nativeElement) {
      this.isDragging = true;
      this.checkAndFetchMoreData();
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.scrollCanvas) {
      const canvasSize = this.chartType === 'bar' ? this.scrollCanvas.nativeElement.height : this.scrollCanvas.nativeElement.width;
      const totalItems = this.totalData.length;
      const scrollPosition = this.chartType === 'bar' ? event.offsetY - this.scrollCanvas.nativeElement.getBoundingClientRect().top : event.offsetX - this.scrollCanvas.nativeElement.getBoundingClientRect().left;
      const newStartIndex = Math.floor((scrollPosition / canvasSize) * totalItems);
      this.currentStartIndex = Math.min(Math.max(newStartIndex, 0), totalItems - this.itemsPerPage);
      this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
      this.updateChartData();
      this.checkAndFetchMoreData();
    }
  }

  checkAndFetchMoreData() {
    const threshold = 0.9 * this.totalData.length;
    if (this.currentStartIndex >= threshold) {
      this.fetchMoreData();
    }
  }

  fetchMoreData() {
    const newData = Array.from({ length: 5000 }, (_, i) => Math.floor(Math.random() * 100));
    this.totalData = this.totalData.concat(newData);
  }
}
