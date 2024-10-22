import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPaginationComponent } from './chart-pagination.component';

describe('ChartPaginationComponent', () => {
  let component: ChartPaginationComponent;
  let fixture: ComponentFixture<ChartPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartPaginationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
