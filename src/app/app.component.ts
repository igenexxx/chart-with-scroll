import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartPaginationComponent } from './chart-pagination/chart-pagination.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartPaginationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';
}
