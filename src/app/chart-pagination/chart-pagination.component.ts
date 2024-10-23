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
  @ViewChild('scrollCanvas') scrollCanvas: ElementRef | undefined;
  
  currentStartIndex = 0;
  itemsPerPage = 100;
  totalData: number[] = [];
  visibleData: number[] = [];
  scrollBarHeight = 10;
  isDragging = false;

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
          type: 'bar',
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
    this.updateScrollCanvasWidth();
    this.drawScrollBar();
  }

  loadInitialData() {
    // Simulate a backend call to fetch 5000 items
    this.totalData = Array.from({ length: 5000 }, (_, i) => Math.floor(Math.random() * 100));
    this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
    this.updateChartData();
  }

  updateChartData() {
    const labels = this.visibleData.map((_, index) => `Label ${index + 1 + this.currentStartIndex}`);
    const data = this.visibleData;
    this.chartService.updateChart('lineChart', labels, data);
    this.updateScrollCanvasWidth();
    this.drawScrollBar();
  }

  updateScrollCanvasWidth() {
    if (this.scrollCanvas && this.chartCanvas) {
      this.scrollCanvas.nativeElement.width = this.chartCanvas.nativeElement.clientWidth;
    }
  }

  @HostListener('window:wheel', ['$event'])
  onScroll(event: WheelEvent) {
    const scrollStep = 5; // Number of items to scroll per wheel event
    if (event.deltaY > 0 && this.currentStartIndex + this.itemsPerPage < this.totalData.length) {
      this.currentStartIndex = Math.min(this.currentStartIndex + scrollStep, this.totalData.length - this.itemsPerPage);
    } else if (event.deltaY < 0 && this.currentStartIndex > 0) {
      this.currentStartIndex = Math.max(this.currentStartIndex - scrollStep, 0);
    }
    this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
    this.updateChartData();
  }

  drawScrollBar() {
    if (this.scrollCanvas) {
      const context = this.scrollCanvas.nativeElement.getContext('2d');
      if (context) {
        const canvasWidth = this.scrollCanvas.nativeElement.width;
        const canvasHeight = this.scrollBarHeight;
        const totalItems = this.totalData.length;
        const visibleItems = this.itemsPerPage;

        // Clear the canvas
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw the scrollbar background
        context.fillStyle = '#e0e0e0';
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate the scrollbar thumb size and position
        const thumbWidth = (visibleItems / totalItems) * canvasWidth;
        const thumbPosition = (this.currentStartIndex / totalItems) * canvasWidth;

        // Draw the scrollbar thumb
        context.fillStyle = '#888888';
        context.fillRect(thumbPosition, 0, thumbWidth, canvasHeight);
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.scrollCanvas && event.target === this.scrollCanvas.nativeElement) {
      this.isDragging = true;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.scrollCanvas) {
      const canvasWidth = this.scrollCanvas.nativeElement.width;
      const totalItems = this.totalData.length;
      const scrollPosition = event.offsetX - this.scrollCanvas.nativeElement.getBoundingClientRect().left;
      const newStartIndex = Math.floor((scrollPosition / canvasWidth) * totalItems);
      this.currentStartIndex = Math.min(Math.max(newStartIndex, 0), totalItems - this.itemsPerPage);
      this.visibleData = this.totalData.slice(this.currentStartIndex, this.currentStartIndex + this.itemsPerPage);
      this.updateChartData();
    }
  }
}
