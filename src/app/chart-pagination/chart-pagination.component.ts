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
     
     currentPage = 0;
     itemsPerPage = 100;
     dataChunks: number[][] = [];

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
               responsive: true, // Set to false to prevent chart from adapting to parent width
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
       // Simulate a backend call to fetch 1000 items
       const totalData = Array.from({ length: 1000 }, (_, i) => i + 1);
       this.dataChunks = this.chunkArray(totalData, this.itemsPerPage);
     }

     chunkArray(array: number[], chunkSize: number): number[][] {
       const result = [];
       for (let i = 0; i < array.length; i += chunkSize) {
         result.push(array.slice(i, i + chunkSize));
       }
       return result;
     }

     updateChartData() {
       const currentDataChunk = this.dataChunks[this.currentPage] || [];
       const labels = currentDataChunk.map((_, index) => `Label ${index + 1 + this.currentPage * this.itemsPerPage}`);
       const data = currentDataChunk;
       this.chartService.updateChart('lineChart', labels, data);
     }

     @HostListener('window:scroll', ['$event'])
     onScroll(event: Event) {
       const target = event.target as Document;
       const scrollPosition = target.documentElement.scrollLeft + target.defaultView!.innerWidth;
       const scrollWidth = target.documentElement.scrollWidth;

       if (scrollPosition >= scrollWidth) {
         if (this.currentPage < this.dataChunks.length - 1) {
           this.currentPage++;
           this.updateChartData();
         } else {
           // Fetch new data from backend (for example, another 1000 items)
           this.fetchMoreData();
         }
       }
     }

     fetchMoreData() {
       // Simulate fetching 1000 more items from the backend
       const newData = Array.from({ length: 1000 }, (_, i) => i + 1 + this.dataChunks.length * this.itemsPerPage);
       const newChunks = this.chunkArray(newData, this.itemsPerPage);
       this.dataChunks.push(...newChunks);
       this.currentPage++;
       this.updateChartData();
     }
   }