import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodMenuComponent } from './food-menu.component';

describe('FoodMenuComponent', () => {
  let fixture: ComponentFixture<FoodMenuComponent>;
  let component: FoodMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodMenuComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FoodMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
