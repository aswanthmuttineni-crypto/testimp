// import { Component, OnInit, inject } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../../core/services/api.service';
// import { Settings } from '../../core/models';

// @Component({
//   selector: 'app-settings',
//   standalone: true,
//   imports: [FormsModule],
//   template: `
//     <header>
//       <p class="eyebrow">Settings</p>
//       <h1>Settings</h1>
//       <p class="page-copy">Update hostel information and the food menu shown on the public display page.</p>
//     </header>
//     @if (settings) {
//       <section class="grid two">
//         <form class="panel form" (ngSubmit)="save()">
//           <h2>Hostel Details</h2>
//           <label>Hostel Name<input [(ngModel)]="settings.hostelName" name="hostelName" /></label>
//           <label>Admin Email<input type="email" [(ngModel)]="settings.adminEmail" name="adminEmail" /></label>
//           <label>Notification Email<input type="email" [(ngModel)]="settings.notificationEmail" name="notificationEmail" /></label>
//           <label>Address<textarea [(ngModel)]="settings.address" name="address"></textarea></label>
//           <div class="form-actions"><button class="primary">Save Settings</button></div>
//         </form>
//         <form class="panel form" (ngSubmit)="save()">
//           <h2>Weekly Food Menu</h2>
//           <div class="weekly-menu-editor">
//             @for (item of settings.weeklyMenu; track item.day; let index = $index) {
//               <div class="menu-day">
//                 <strong>{{ item.day }}</strong>
//                 <label>Breakfast<input [(ngModel)]="item.breakfast" name="breakfast{{ index }}" /></label>
//                 <label>Lunch<input [(ngModel)]="item.lunch" name="lunch{{ index }}" /></label>
//                 <label>Dinner<input [(ngModel)]="item.dinner" name="dinner{{ index }}" /></label>
//               </div>
//             }
//           </div>
//           <label>Extra Public Menu Notes<textarea rows="5" [(ngModel)]="settings.foodMenu" name="foodMenu"></textarea></label>
//           <div class="form-actions"><button class="primary">Save Menu</button><a class="secondary link-button" href="/public">Open Public Page</a></div>
//         </form>
//       </section>
//     } @else {
//       <section class="loading-state">Loading settings...</section>
//     }
//   `
// })
// export class SettingsComponent implements OnInit {
//   private api = inject(ApiService);
//   settings?: Settings;

//   ngOnInit() {
//     this.api.settings.get().subscribe((settings) => (this.settings = { ...settings, weeklyMenu: settings.weeklyMenu?.length ? settings.weeklyMenu : this.defaultMenu() }));
//   }

//   save() {
//     if (!this.settings) return;
//     this.api.settings.update(this.settings).subscribe((settings) => (this.settings = settings));
//   }

//   defaultMenu() {
//     return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({ day, breakfast: '', lunch: '', dinner: '' }));
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Settings } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="settings-header">
      <div>
        <p class="eyebrow">Hostel Administration</p>
        <h1>Settings</h1>
        <p class="page-copy">
          Configure hostel details, branding, public display content, and weekly
          food schedules.
        </p>
      </div>

      <button class="primary hero-btn" (click)="save()">
        Save All Changes
      </button>
    </header>

    @if (settings) {
      <section class="settings-layout">
        <!-- LEFT SIDE -->
        <div class="settings-main">
          <!-- Hostel Details -->
          <form class="panel settings-card" (ngSubmit)="save()">
            <div class="card-header">
              <div>
                <p class="card-eyebrow">Hostel Information</p>
                <h2>Hostel Details</h2>
              </div>

              <div class="icon-box">🏨</div>
            </div>

            <div class="form-grid">
              <label>
                Hostel Name
                <input
                  [(ngModel)]="settings.hostelName"
                  name="hostelName"
                  placeholder="Enter hostel name"
                />
              </label>

              <label>
                Admin Email
                <input
                  type="email"
                  [(ngModel)]="settings.adminEmail"
                  name="adminEmail"
                  placeholder="admin@example.com"
                />
              </label>

              <label>
                Notification Email
                <input
                  type="email"
                  [(ngModel)]="settings.notificationEmail"
                  name="notificationEmail"
                  placeholder="notifications@example.com"
                />
              </label>

              <label class="full">
                Address
                <textarea
                  [(ngModel)]="settings.address"
                  name="address"
                  placeholder="Enter hostel address"
                ></textarea>
              </label>
            </div>

            <div class="form-actions">
              <button class="primary">Save Settings</button>
            </div>
          </form>

          <!-- Weekly Menu -->
          <form class="panel settings-card" (ngSubmit)="save()">
            <div class="card-header">
              <div>
                <p class="card-eyebrow">Mess Management</p>
                <h2>Weekly Food Menu</h2>
              </div>

              <div class="icon-box">🍽️</div>
            </div>

            <div class="weekly-menu-editor">
              @for (
                item of settings.weeklyMenu;
                track item.day;
                let index = $index
              ) {
                <div class="menu-day">
                  <div class="day-label">
                    {{ item.day }}
                  </div>

                  <label>
                    Breakfast
                    <input
                      [(ngModel)]="item.breakfast"
                      name="breakfast{{ index }}"
                      placeholder="Breakfast items"
                    />
                  </label>

                  <label>
                    Lunch
                    <input
                      [(ngModel)]="item.lunch"
                      name="lunch{{ index }}"
                      placeholder="Lunch items"
                    />
                  </label>

                  <label>
                    Dinner
                    <input
                      [(ngModel)]="item.dinner"
                      name="dinner{{ index }}"
                      placeholder="Dinner items"
                    />
                  </label>
                </div>
              }
            </div>

            <label class="full">
              Extra Public Menu Notes

              <textarea
                rows="5"
                [(ngModel)]="settings.foodMenu"
                name="foodMenu"
                placeholder="Add extra menu notes..."
              ></textarea>
            </label>

            <div class="form-actions">
              <button class="primary">Save Menu</button>

              <a class="secondary link-button" href="/public">
                Open Public Page
              </a>
            </div>
          </form>
        </div>

        <!-- RIGHT SIDE -->
        <aside class="settings-sidebar">
          <div class="panel preview-card">
            <p class="card-eyebrow">Live Preview</p>

            <h3>{{ settings.hostelName || 'Hostel Name' }}</h3>

            <p>
              {{ settings.address || 'Hostel address will appear here.' }}
            </p>

            <div class="preview-divider"></div>

            <div class="preview-section">
              <small>Admin Contact</small>

              <strong>
                {{ settings.adminEmail || 'admin@email.com' }}
              </strong>
            </div>

            <div class="preview-section">
              <small>Notification Email</small>

              <strong>
                {{ settings.notificationEmail || 'notify@email.com' }}
              </strong>
            </div>
          </div>

          <div class="panel info-card">
            <p class="card-eyebrow">Quick Tips</p>

            <ul>
              <li>Keep public information updated regularly.</li>
              <li>Food menu changes reflect instantly.</li>
              <li>Use notification email for rent reminders.</li>
              <li>Preview public page before publishing.</li>
            </ul>
          </div>
        </aside>
      </section>
    } @else {
      <section class="loading-state">Loading settings...</section>
    }
  `,
  styles: [
    `
      .settings-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 28px;
      }

      .hero-btn {
        min-width: 180px;
      }

      .settings-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 24px;
        align-items: start;
      }

      .settings-main {
        display: grid;
        gap: 24px;
      }

      .settings-sidebar {
        display: grid;
        gap: 24px;
        position: sticky;
        top: 24px;
      }

      .settings-card {
        padding: 28px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .card-eyebrow {
        color: var(--primary);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 6px;
      }

      .card-header h2 {
        margin: 0;
        font-size: 24px;
      }

      .icon-box {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: var(--primary-soft);
        font-size: 24px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .form-grid .full {
        grid-column: 1 / -1;
      }

      label {
        display: grid;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #475569;
      }

      input,
      textarea {
        width: 100%;
        border: 1px solid #dbe3ee;
        border-radius: 12px;
        padding: 14px 16px;
        background: #fff;
        font-size: 14px;
        transition: var(--transition);
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 4px var(--primary-glow);
      }

      textarea {
        resize: vertical;
        min-height: 120px;
      }

      .weekly-menu-editor {
        display: grid;
        gap: 16px;
        margin-bottom: 24px;
      }

      .menu-day {
        display: grid;
        grid-template-columns: 120px repeat(3, minmax(0, 1fr));
        gap: 14px;
        padding: 18px;
        border-radius: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }

      .day-label {
        display: flex;
        align-items: center;
        font-weight: 800;
        color: #0f172a;
      }

      .preview-card h3 {
        margin-top: 8px;
        margin-bottom: 12px;
        font-size: 24px;
      }

      .preview-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 20px 0;
      }

      .preview-section {
        margin-bottom: 18px;
      }

      .preview-section small {
        display: block;
        margin-bottom: 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .preview-section strong {
        color: #0f172a;
        font-size: 14px;
      }

      .info-card ul {
        margin: 0;
        padding-left: 18px;
        display: grid;
        gap: 12px;
      }

      .info-card li {
        color: #475569;
        line-height: 1.5;
      }

      .form-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      @media (max-width: 1200px) {
        .settings-layout {
          grid-template-columns: 1fr;
        }

        .settings-sidebar {
          position: static;
        }
      }

      @media (max-width: 768px) {
        .settings-header {
          flex-direction: column;
          align-items: stretch;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .menu-day {
          grid-template-columns: 1fr;
        }

        .day-label {
          margin-bottom: 4px;
        }

        .hero-btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);

  settings?: Settings;

  ngOnInit() {
    this.api.settings.get().subscribe((settings) => {
      this.settings = {
        ...settings,
        weeklyMenu: settings.weeklyMenu?.length
          ? settings.weeklyMenu
          : this.defaultMenu(),
      };
    });
  }

  save() {
    if (!this.settings) return;

    this.api.settings
      .update(this.settings)
      .subscribe((settings) => (this.settings = settings));
  }

  defaultMenu() {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ].map((day) => ({
      day,
      breakfast: '',
      lunch: '',
      dinner: '',
    }));
  }
}
