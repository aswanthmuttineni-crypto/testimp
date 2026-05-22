import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Settings } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header>
      <p class="eyebrow">Settings</p>
      <h1>Settings</h1>
      <p class="page-copy">Update hostel information and the food menu shown on the public display page.</p>
    </header>
    @if (settings) {
      <section class="grid two">
        <form class="panel form" (ngSubmit)="save()">
          <h2>Hostel Details</h2>
          <label>Hostel Name<input [(ngModel)]="settings.hostelName" name="hostelName" /></label>
          <label>Admin Email<input type="email" [(ngModel)]="settings.adminEmail" name="adminEmail" /></label>
          <label>Notification Email<input type="email" [(ngModel)]="settings.notificationEmail" name="notificationEmail" /></label>
          <label>Address<textarea [(ngModel)]="settings.address" name="address"></textarea></label>
          <div class="form-actions"><button class="primary">Save Settings</button></div>
        </form>
        <form class="panel form" (ngSubmit)="save()">
          <h2>Weekly Food Menu</h2>
          <div class="weekly-menu-editor">
            @for (item of settings.weeklyMenu; track item.day; let index = $index) {
              <div class="menu-day">
                <strong>{{ item.day }}</strong>
                <label>Breakfast<input [(ngModel)]="item.breakfast" name="breakfast{{ index }}" /></label>
                <label>Lunch<input [(ngModel)]="item.lunch" name="lunch{{ index }}" /></label>
                <label>Dinner<input [(ngModel)]="item.dinner" name="dinner{{ index }}" /></label>
              </div>
            }
          </div>
          <label>Extra Public Menu Notes<textarea rows="5" [(ngModel)]="settings.foodMenu" name="foodMenu"></textarea></label>
          <div class="form-actions"><button class="primary">Save Menu</button><a class="secondary link-button" href="/public">Open Public Page</a></div>
        </form>
      </section>
    } @else {
      <section class="loading-state">Loading settings...</section>
    }
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  settings?: Settings;

  ngOnInit() {
    this.api.settings.get().subscribe((settings) => (this.settings = { ...settings, weeklyMenu: settings.weeklyMenu?.length ? settings.weeklyMenu : this.defaultMenu() }));
  }

  save() {
    if (!this.settings) return;
    this.api.settings.update(this.settings).subscribe((settings) => (this.settings = settings));
  }

  defaultMenu() {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({ day, breakfast: '', lunch: '', dinner: '' }));
  }
}
