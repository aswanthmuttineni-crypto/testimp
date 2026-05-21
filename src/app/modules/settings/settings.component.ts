import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Settings } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header><p class="eyebrow">Settings</p><h1>Settings</h1></header>
    @if (settings) {
      <section class="grid two">
        <form class="panel form" (ngSubmit)="save()">
          <h2>Hostel Details</h2>
          <label>Hostel Name<input [(ngModel)]="settings.hostelName" name="hostelName" /></label>
          <label>Admin Email<input type="email" [(ngModel)]="settings.adminEmail" name="adminEmail" /></label>
          <label>Address<textarea [(ngModel)]="settings.address" name="address"></textarea></label>
          <button class="primary">Save Settings</button>
        </form>
        <form class="panel form" (ngSubmit)="save()">
          <h2>Public Food Menu</h2>
          <label>Menu<textarea rows="10" [(ngModel)]="settings.foodMenu" name="foodMenu"></textarea></label>
          <button class="primary">Save Menu</button>
          <a class="secondary link-button" href="/public">Open Public Page</a>
        </form>
      </section>
    }
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  settings?: Settings;

  ngOnInit() {
    this.api.settings.get().subscribe((settings) => (this.settings = settings));
  }

  save() {
    if (!this.settings) return;
    this.api.settings.update(this.settings).subscribe((settings) => (this.settings = settings));
  }
}
