import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { Summary } from '../../core/models';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

type TrendRow = { month: string; income: number; expense: number; date: Date };

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PieController,
  Title,
  Tooltip,
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, NgChartsModule, PaginationComponent],
  styles: [
    `
      .page {
        display: grid;
        gap: 22px;
      }
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 26px 30px;
        border-radius: var(--radius-xl);
        background: linear-gradient(135deg, #0b1620, #16324a);
        color: #fff;
        box-shadow: 0 16px 40px rgba(11, 22, 32, 0.18);
        position: relative;
        overflow: hidden;
      }
      .hero::after {
        content: '';
        position: absolute;
        top: -40%;
        right: -6%;
        width: 340px;
        height: 340px;
        background: radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%);
        pointer-events: none;
      }
      .hero-left { position: relative; z-index: 1; }
      .send-actions { position: relative; z-index: 1; }
      .hero-left p {
        color: #34d399;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 6px;
      }
      .hero-left h1 {
        margin: 0 0 4px;
        font-size: clamp(24px, 4vw, 36px);
        letter-spacing: -1.5px;
        color: #fff;
      }
      .hero-left small {
        color: rgba(255, 255, 255, 0.55);
        font-size: 13px;
      }
      .send-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .btn-send {
        padding: 12px 24px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #34d399, #10b981);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }
      .btn-send.whatsapp {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }
      .btn-send:hover {
        opacity: 0.9;
      }
      .btn-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .notice {
        padding: 13px 18px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
      }
      .notice.info {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #047857;
      }
      .notice.success {
        background: #dcfce7;
        border: 1px solid #86efac;
        color: #15803d;
      }
      .notice.error {
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #b91c1c;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 14px;
      }
      .scard {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border-radius: var(--radius);
        background: var(--panel);
        border: 1px solid var(--panel-border);
        box-shadow: var(--shadow-xs);
        transition: var(--transition);
      }
      .scard:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
      }
      .scard-icon {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-size: 22px;
        flex-shrink: 0;
        background: #f1f5f9;
        margin: 0;
      }
      .scard.green .scard-icon { background: var(--primary-soft); }
      .scard.red .scard-icon { background: #fef2f2; }
      .scard.yellow .scard-icon { background: #fffbeb; }
      .scard.blue .scard-icon { background: #eff6ff; }
      .scard small {
        display: block;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 4px;
      }
      .scard strong {
        font-size: 22px;
        letter-spacing: -0.6px;
        color: var(--ink);
        line-height: 1;
      }
      .scard.green strong {
        color: var(--primary-dark);
      }
      .scard.red strong {
        color: #ef4444;
      }
      .scard.yellow strong {
        color: #d97706;
      }
      .scard.blue strong {
        color: #2563eb;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .panel-hdr {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      .panel-hdr h2 {
        margin: 0;
        font-size: 17px;
      }
      .eyebrow {
        color: #10b981;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 4px;
      }
      .bar-row {
        margin-bottom: 16px;
      }
      .bar-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 13px;
      }
      .bar-top span {
        color: #64748b;
        font-weight: 600;
      }
      .bar-top strong {
        color: #0f172a;
        font-weight: 700;
      }
      .bar-track {
        height: 10px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .bar-track span {
        display: block;
        height: 100%;
        border-radius: inherit;
        transition: width 0.5s;
      }
      .bar-income span {
        background: linear-gradient(90deg, #10b981, #34d399);
      }
      .bar-expense span {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }
      .bar-profit span {
        background: linear-gradient(90deg, #6366f1, #818cf8);
      }
      .snap-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .snap-box {
        padding: 16px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        text-align: center;
      }
      .snap-box strong {
        display: block;
        font-size: 28px;
        color: #0f172a;
        letter-spacing: -1px;
        margin-bottom: 4px;
      }
      .snap-box small {
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .snap-box.full {
        grid-column: 1/-1;
      }
      .snap-box.full strong {
        color: #ef4444;
      }
      .dues-hdr {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .dues-hdr h2 {
        margin: 0;
        font-size: 17px;
      }
      .dues-count {
        padding: 4px 12px;
        border-radius: 999px;
        background: #fee2e2;
        color: #b91c1c;
        font-size: 12px;
        font-weight: 800;
      }
      .table-wrap {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      .dcards { display: none; flex-direction: column; gap: 12px; }
      .dcard { border: 1px solid var(--panel-border); border-radius: var(--radius); padding: 14px; background: var(--panel); box-shadow: var(--shadow-xs); }
      .dcard-top { display: flex; align-items: center; gap: 12px; }
      .dcard-top .avatar { width: 42px; height: 42px; }
      .dcard-id { flex: 1; min-width: 0; }
      .dcard-id strong { display: block; font-size: 16px; color: var(--ink); }
      .dcard-id small { color: var(--muted); font-size: 12px; }
      .dcard-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
      .dcard-meta small { display: block; color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
      .dcard-meta span { font-size: 14px; font-weight: 700; color: var(--ink); }
      .dcard-wa { width: 100%; min-height: 44px; border-radius: 11px; border: 1px solid #bbf7d0; background: #dcfce7; color: #15803d; font-size: 13px; font-weight: 700; cursor: pointer; }
      .chart-panel {
        padding: 22px;
        border-radius: 22px;
        background: #fff;
        border: 1px solid #e2e8f0;
      }
      .chart-panel h2 {
        margin: 0 0 16px;
        font-size: 18px;
      }
      .chart-grid {
        display: grid;
        gap: 18px;
      }
      .chart-card {
        padding: 22px;
        border-radius: 22px;
        background: #fff;
        border: 1px solid #e2e8f0;
      }
      .chart-card h3 {
        margin: 0 0 16px;
        font-size: 16px;
      }
      .chart-canvas {
        min-height: 260px;
        display: grid;
        place-items: center;
      }
      .chart-grid-4 {
        display: grid;
        grid-template-columns: repeat(2, minmax(260px, 1fr));
        gap: 18px;
      }
      .chart-svg {
        width: 100%;
        background: #f8fafc;
        border-radius: 18px;
        padding: 18px;
      }
      .chart-bars {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 14px;
      }
      @media (max-width: 1100px) {
        .chart-grid-4 {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 1100px) {
        .chart-grid-4 {
          grid-template-columns: 1fr;
        }
      }
      .chart-bar {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }
      .chart-bar .bar {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .chart-bar .fill {
        height: 100%;
        border-radius: inherit;
      }
      .chart-bar.income .fill {
        background: linear-gradient(90deg, #10b981, #34d399);
      }
      .chart-bar.expense .fill {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }
      .chart-bar.profit .fill {
        background: linear-gradient(90deg, #6366f1, #818cf8);
      }
      .chart-bar small {
        color: #64748b;
        font-size: 12px;
        text-align: center;
      }
      @media (max-width: 1100px) {
        .chart-grid-3 {
          grid-template-columns: 1fr;
        }
      }
      .chart-bar {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }
      .chart-bar .bar {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .chart-bar .fill {
        height: 100%;
        border-radius: inherit;
      }
      .chart-bar.income .fill {
        background: linear-gradient(90deg, #10b981, #34d399);
      }
      .chart-bar.expense .fill {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }
      .chart-bar.profit .fill {
        background: linear-gradient(90deg, #6366f1, #818cf8);
      }
      .chart-bar small {
        color: #64748b;
        font-size: 12px;
        text-align: center;
      }
      @media (max-width: 900px) {
        .chart-bars {
          grid-template-columns: 1fr;
        }
        .trend-row {
          grid-template-columns: 1fr 1fr;
        }
        .trend-value {
          text-align: left;
        }
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead tr {
        background: #f8fafc;
      }
      th {
        padding: 11px 14px;
        text-align: left;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }
      td {
        padding: 13px 14px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
        vertical-align: middle;
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      tbody tr:hover {
        background: #f8fafc;
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: linear-gradient(135deg, #10b981, #34d399);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        flex-shrink: 0;
      }
      .t-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .t-cell strong {
        font-size: 13px;
        color: #0f172a;
        display: block;
      }
      .t-cell small {
        color: #94a3b8;
        font-size: 11px;
      }
      .due-amt {
        font-weight: 800;
        color: #b91c1c;
      }
      .badge-pending {
        display: inline-flex;
        padding: 3px 10px;
        border-radius: 999px;
        background: #fef9c3;
        color: #a16207;
        font-size: 11px;
        font-weight: 800;
      }
      .btn-wa {
        padding: 5px 10px;
        border-radius: 8px;
        border: none;
        background: #dcfce7;
        color: #15803d;
        font-size: 14px;
        cursor: pointer;
      }
      .btn-wa:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-wa:hover:not(:disabled) {
        background: #bbf7d0;
      }
      .empty {
        padding: 32px;
        text-align: center;
        color: #94a3b8;
        border: 2px dashed #e2e8f0;
        border-radius: 14px;
      }
      /* MONTH FILTER */
      .month-filter {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        padding: 16px 20px; border-radius: 18px; background: #fff;
        border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);
      }
      .month-filter label { font-size: 13px; font-weight: 700; color: #475569; }
      .month-filter select, .month-filter input[type=number] {
        border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 8px 12px;
        font-size: 14px; font-weight: 600; background: #f8fafc; color: #0f172a; cursor: pointer;
      }
      .month-filter input[type=number] { width: 88px; }
      .filter-badge {
        margin-left: auto; padding: 7px 16px; border-radius: 999px;
        background: linear-gradient(135deg,#d1fae5,#a7f3d0);
        color: #047857; font-size: 13px; font-weight: 800;
      }
      .btn-reset {
        padding: 7px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0;
        background: #fff; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer;
      }
      .btn-reset:hover { background: #f1f5f9; }

      .loading {
        padding: 60px;
        text-align: center;
        color: #94a3b8;
      }
      @media (max-width: 900px) {
        .two-col {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 768px) {
        .hero {
          flex-direction: column;
          align-items: stretch;
          padding: 22px;
        }
        .send-actions,
        .btn-send {
          width: 100%;
        }
        .stats {
          grid-template-columns: 1fr 1fr;
        }
        .snap-grid {
          grid-template-columns: 1fr 1fr;
        }
        .table-wrap { display: none; }
        .dcards { display: flex; }
      }
      @media (max-width: 420px) {
        .stats {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero-left">
          <p>Ajs Deluxe</p>
          <h1>{{ greeting }}, Admin</h1>
          <small>{{ today | date: 'EEEE, dd MMMM yyyy' }}</small>
        </div>
        <div class="send-actions">
          <button class="btn-send" [disabled]="sending" (click)="sendDueMail()">
            {{
              sending && sendingChannel === 'EMAIL'
                ? 'Sending...'
                : '📧 Send Due Mail'
            }}
          </button>
          <button
            class="btn-send whatsapp"
            [disabled]="sending"
            (click)="sendDueWhatsApp()"
          >
            {{
              sending && sendingChannel === 'WHATSAPP'
                ? 'Sending...'
                : '📱 Send WhatsApp'
            }}
          </button>
        </div>
      </div>

      <div class="month-filter">
        <label>Month
          <select [(ngModel)]="selMonth" (change)="onFilterChange()">
            @for (m of months; track m) { <option>{{ m }}</option> }
          </select>
        </label>
        <label>Year
          <input type="number" [(ngModel)]="selYear" (change)="onFilterChange()" />
        </label>
        <span class="filter-badge">{{ selMonth }} {{ selYear }}</span>
        @if (isFiltered()) {
          <button class="btn-reset" (click)="resetFilter()">✕ All Time</button>
        }
      </div>

      @if (notice) {
        <div
          class="notice"
          [class.info]="noticeType === 'info'"
          [class.success]="noticeType === 'success'"
          [class.error]="noticeType === 'error'"
        >
          {{ notice }}
        </div>
      }

      @if (summary) {
        <div class="stats">
          <div class="scard green">
            <div class="scard-icon">💰</div>
            <div>
              <small>Total Income</small>
              <strong>{{ summary.totalIncome | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
            </div>
          </div>
          <div class="scard red">
            <div class="scard-icon">💸</div>
            <div>
              <small>Total Expenses</small>
              <strong>{{ summary.totalExpenses | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
            </div>
          </div>
          <div class="scard blue">
            <div class="scard-icon">📈</div>
            <div>
              <small>Net Profit</small>
              <strong>{{ summary.profit | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
            </div>
          </div>
          <div class="scard">
            <div class="scard-icon">👥</div>
            <div>
              <small>Active Tenants</small>
              <strong>{{ tenantCount }}</strong>
            </div>
          </div>
          <div class="scard">
            <div class="scard-icon">🛏️</div>
            <div>
              <small>Empty Beds</small>
              <strong>{{ summary.vacantRooms }}</strong>
            </div>
          </div>
          <div class="scard yellow">
            <div class="scard-icon">⏳</div>
            <div>
              <small>Pending Rent</small>
              <strong>{{ summary.pendingRent | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="panel" style="padding:22px;">
            <div class="panel-hdr">
              <div>
                <p class="eyebrow">Financial Overview</p>
                <h2>Income vs Expenses</h2>
              </div>
            </div>
            <div class="bar-row bar-income">
              <div class="bar-top">
                <span>Income</span
                ><strong>{{
                  summary.totalIncome | currency: 'INR' : 'symbol' : '1.0-0'
                }}</strong>
              </div>
              <div class="bar-track">
                <span [style.width.%]="pct(summary.totalIncome)"></span>
              </div>
            </div>
            <div class="bar-row bar-expense">
              <div class="bar-top">
                <span>Expenses</span
                ><strong>{{
                  summary.totalExpenses | currency: 'INR' : 'symbol' : '1.0-0'
                }}</strong>
              </div>
              <div class="bar-track">
                <span [style.width.%]="pct(summary.totalExpenses)"></span>
              </div>
            </div>
            <div class="bar-row bar-profit">
              <div class="bar-top">
                <span>Profit</span
                ><strong>{{
                  summary.profit | currency: 'INR' : 'symbol' : '1.0-0'
                }}</strong>
              </div>
              <div class="bar-track">
                <span [style.width.%]="pct(summary.profit)"></span>
              </div>
            </div>
          </div>

          <div class="panel" style="padding:22px;">
            <div class="panel-hdr">
              <div>
                <p class="eyebrow">Quick Snapshot</p>
                <h2>This Month</h2>
              </div>
            </div>
            <div class="snap-grid">
              <div class="snap-box">
                <strong>{{ summary.rents.length }}</strong
                ><small>Rent Records</small>
              </div>
              <div class="snap-box">
                <strong>{{ summary.expenses.length }}</strong
                ><small>Expenses</small>
              </div>
              <div class="snap-box full">
                <strong>{{ summary.monthlyDues.dues.length }}</strong
                ><small
                  >Pending Dues - {{ summary.monthlyDues.month }}
                  {{ summary.monthlyDues.year }}</small
                >
              </div>
            </div>
          </div>
        </div>

        <div class="chart-panel">
          <div class="panel-hdr">
            <div>
              <p class="eyebrow">Dashboard Charts</p>
              <h2>Monthly and Yearly Income</h2>
            </div>
          </div>
          <div class="chart-grid-4">
            <div class="chart-card">
              <h3>Monthly Income vs Expense</h3>
              <div class="chart-canvas">
                <canvas
                  baseChart
                  [data]="barChartData"
                  [options]="barChartOptions"
                  [type]="barChartType"
                >
                </canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Profit Area Trend</h3>
              <div class="chart-canvas">
                <canvas
                  baseChart
                  [data]="lineChartData"
                  [options]="lineChartOptions"
                  [type]="lineChartType"
                >
                </canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Profit / Expenses / Pending</h3>
              <div class="chart-canvas">
                <canvas
                  baseChart
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions"
                  [type]="doughnutChartType"
                >
                </canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Room Occupancy</h3>
              <div class="chart-canvas">
                <canvas
                  baseChart
                  [data]="pieChartData"
                  [options]="pieChartOptions"
                  [type]="pieChartType"
                >
                </canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="panel" style="padding:22px;">
          <div class="dues-hdr">
            <div>
              <p class="eyebrow">Auto-Generated</p>
              <h2>
                {{ summary.monthlyDues.month }} {{ summary.monthlyDues.year }} -
                Pending Dues
              </h2>
            </div>
            @if (summary.monthlyDues.dues.length) {
              <span class="dues-count"
                >{{ summary.monthlyDues.dues.length }} pending</span
              >
            }
          </div>

          @if (summary.monthlyDues.dues.length) {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Room / Bed</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (due of pagedDues(); track due.tenant._id) {
                    <tr>
                      <td>
                        <div class="t-cell">
                          <div class="avatar">
                            {{ due.tenant.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <strong>{{ due.tenant.name }}</strong
                            ><small>{{ due.tenant.email || 'No email' }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {{ roomNo(due.tenant) }} / B{{ due.tenant.bedNo }}
                      </td>
                      <td>{{ due.tenant.phone }}</td>
                      <td>{{ due.tenant.email || '-' }}</td>
                      <td class="due-amt">
                        {{ due.amount | currency: 'INR' : 'symbol' : '1.0-0' }}
                      </td>
                      <td>
                        <span class="badge-pending">{{ due.status }}</span>
                      </td>
                      <td>
                        <button
                          class="btn-wa"
                          [disabled]="sendingWa[due.tenant._id!]"
                          (click)="sendSingleWhatsApp(
                            due.tenant._id!,
                            due.tenant.name,
                            due.tenant.phone,
                            due.amount,
                            roomNo(due.tenant),
                            due.tenant.bedNo
                          )"
                          title="Send WhatsApp to {{ due.tenant.name }}"
                        >
                          {{ sendingWa[due.tenant._id!] ? '...' : '📱' }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- MOBILE CARDS -->
            <div class="dcards">
              @for (due of pagedDues(); track due.tenant._id) {
                <div class="dcard">
                  <div class="dcard-top">
                    <div class="avatar">{{ due.tenant.name.charAt(0).toUpperCase() }}</div>
                    <div class="dcard-id">
                      <strong>{{ due.tenant.name }}</strong>
                      <small>{{ roomNo(due.tenant) }} · B{{ due.tenant.bedNo }}</small>
                    </div>
                    <span class="badge-pending">{{ due.status }}</span>
                  </div>
                  <div class="dcard-meta">
                    <div><small>Phone</small><span>{{ due.tenant.phone }}</span></div>
                    <div><small>Due Amount</small><span class="due-amt">{{ due.amount | currency: 'INR' : 'symbol' : '1.0-0' }}</span></div>
                  </div>
                  <button
                    class="dcard-wa"
                    [disabled]="sendingWa[due.tenant._id!]"
                    (click)="sendSingleWhatsApp(
                      due.tenant._id!,
                      due.tenant.name,
                      due.tenant.phone,
                      due.amount,
                      roomNo(due.tenant),
                      due.tenant.bedNo
                    )"
                  >
                    {{ sendingWa[due.tenant._id!] ? 'Sending...' : '📱 Send WhatsApp Reminder' }}
                  </button>
                </div>
              }
            </div>

            <app-pagination [total]="summary.monthlyDues.dues.length" [page]="pageDues" [pageSize]="pageSizeDues" (pageChange)="pageDues = $event"></app-pagination>
          } @else {
            <div class="empty">
              No pending dues for {{ summary.monthlyDues.month }}
              {{ summary.monthlyDues.year }}. All tenants are paid up.
            </div>
          }
        </div>
      } @else {
        <div class="loading">Loading dashboard...</div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary?: Summary;
  pageDues = 1;
  pageSizeDues = 8;
  pagedDues() {
    const all = this.summary?.monthlyDues?.dues ?? [];
    const start = (this.pageDues - 1) * this.pageSizeDues;
    return all.slice(start, start + this.pageSizeDues);
  }
  barChartType: 'bar' = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Income', backgroundColor: '#10b981' },
      { data: [], label: 'Expense', backgroundColor: '#f59e0b' },
    ],
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false },
    },
  };
  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Profit', 'Expenses', 'Pending Rent'],
    datasets: [
      { data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#6366f1'] },
    ],
  };
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };
  lineChartType: 'line' = 'line';
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Profit Trend',
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: true },
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false },
    },
  };
  pieChartType: 'pie' = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: ['Occupied Rooms', 'Empty Beds'],
    datasets: [{ data: [0, 0], backgroundColor: ['#10b981', '#f59e0b'] }],
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  selMonth = this.months[new Date().getMonth()];
  selYear = new Date().getFullYear();
  notice = '';
  noticeType: 'info' | 'success' | 'error' = 'info';
  sending = false;
  sendingChannel: 'EMAIL' | 'WHATSAPP' | null = null;
  sendingWa: Record<string, boolean> = {};
  today = new Date();

  get greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.reports.summary(this.selMonth, this.selYear).subscribe((s) => {
      this.summary = s;
      this.updateChartData();
    });
  }

  onFilterChange() { this.summary = undefined; this.pageDues = 1; this.load(); }

  isFiltered() {
    const now = new Date();
    return this.selMonth !== this.months[now.getMonth()] || this.selYear !== now.getFullYear();
  }

  resetFilter() {
    this.selMonth = this.months[new Date().getMonth()];
    this.selYear = new Date().getFullYear();
    this.onFilterChange();
  }

  updateChartData() {
    if (!this.summary) return;
    const rows = this.trendRows();
    const years = this.yearlyRows();

    this.barChartData.labels = rows.map((r) => r.month);
    this.barChartData.datasets = [
      {
        data: rows.map((r) => r.income),
        label: 'Income',
        backgroundColor: '#10b981',
      },
      {
        data: rows.map((r) => r.expense),
        label: 'Expense',
        backgroundColor: '#f59e0b',
      },
    ];
    this.doughnutChartData.datasets[0].data = [
      Math.max(0, this.summary.profit),
      this.summary.totalExpenses,
      this.summary.pendingRent,
    ];
    this.lineChartData.labels = years.map((r) => `${r.year}`);
    this.lineChartData.datasets[0].data = years.map((r) => r.income);
    this.pieChartData.datasets[0].data = [
      this.summary.occupiedRooms,
      this.summary.vacantRooms,
    ];
  }

  get tenantCount() {
    return this.summary?.activeTenantCount ?? 0;
  }

  pct(val: number) {
    const max = Math.max(
      this.summary?.totalIncome || 0,
      this.summary?.totalExpenses || 0,
      1,
    );
    return Math.max(0, Math.min(100, (val / max) * 100));
  }

  roomNo(tenant: Summary['monthlyDues']['dues'][number]['tenant']) {
    return typeof tenant.roomId === 'string'
      ? tenant.roomId
      : tenant.roomId?.roomNo || '-';
  }

  trendRows() {
    const rows = new Map<
      string,
      { month: string; income: number; expense: number; date: Date }
    >();

    this.summary?.rents.forEach((rent) => {
      if (rent.status !== 'PAID') return;
      const key = `${rent.month} ${rent.year}`;
      const date = new Date(`${rent.month} 1, ${rent.year}`);
      const row = rows.get(key) || { month: key, income: 0, expense: 0, date };
      row.income += rent.amount;
      rows.set(key, row);
    });

    this.summary?.expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const key = date.toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
      const row = rows.get(key) || { month: key, income: 0, expense: 0, date };
      row.expense += exp.amount;
      rows.set(key, row);
    });

    return [...rows.values()]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12);
  }

  yearlyRows() {
    const rows = new Map<number, { year: number; income: number }>();
    this.summary?.rents.forEach((rent) => {
      if (rent.status !== 'PAID') return;
      const row = rows.get(rent.year) || { year: rent.year, income: 0 };
      row.income += rent.amount;
      rows.set(rent.year, row);
    });
    return [...rows.values()].sort((a, b) => a.year - b.year);
  }

  chartMax() {
    const rows = this.trendRows();
    return Math.max(1, ...rows.flatMap((row) => [row.income, row.expense]));
  }

  chartPct(value: number) {
    return Math.max(0, Math.min(100, (value / this.chartMax()) * 100));
  }

  trendPath(type: 'income' | 'expense') {
    const rows = this.trendRows();
    if (!rows.length) return '';
    const max = this.chartMax();
    const step = 320 / Math.max(rows.length - 1, 1);
    return rows
      .map((row, index) => {
        const x = 20 + step * index;
        const y = 160 - (Math.min(row[type], max) / max) * 140;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  sendDueMail() {
    this.sendDueNotification('EMAIL');
  }

  sendDueWhatsApp() {
    this.sendDueNotification('WHATSAPP');
  }

  sendDueNotification(channel: 'EMAIL' | 'WHATSAPP') {
    this.sending = true;
    this.sendingChannel = channel;
    this.notice =
      channel === 'EMAIL'
        ? 'Sending due mails...'
        : 'Sending due WhatsApp messages...';
    this.noticeType = 'info';

    const request =
      channel === 'EMAIL'
        ? this.api.notifications.sendMonthlyDueEmails()
        : this.api.notifications.sendMonthlyDueWhatsApp();

    request.subscribe({
      next: (res) => {
        const result = res as {
          message: string;
          sent?: string[];
          skipped?: unknown[];
          errors?: unknown[];
        };
        this.sending = false;
        this.sendingChannel = null;
        const sentCount = Array.isArray(result.sent)
          ? result.sent.length
          : result.sent && typeof result.sent === 'object'
            ? Object.values(result.sent).flat().length
            : 0;
        const errorCount = Array.isArray(result.errors)
          ? result.errors.length
          : 0;
        const skippedCount = Array.isArray(result.skipped)
          ? result.skipped.length
          : 0;
        this.notice = `${result.message}. Sent: ${sentCount}${skippedCount ? `, Skipped: ${skippedCount}` : ''}${errorCount ? `, Failed: ${errorCount}` : ''}.`;
        this.noticeType = errorCount ? 'error' : 'success';
        if (!errorCount) setTimeout(() => (this.notice = ''), 5000);
      },
      error: (err) => {
        this.sending = false;
        this.sendingChannel = null;
        this.notice = err.error?.message || 'Failed to send due reminder.';
        this.noticeType = 'error';
      },
    });
  }

  sendDueEmails() {
    this.sendDueMail();
  }

  cleanPhoneForWa(phone?: string) {
    if (!phone) return null;
    const digits = String(phone).replace(/[^0-9]/g, '');
    if (!digits) return null;
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
    if (digits.length >= 11 && digits.startsWith('91')) return digits;
    return digits;
  }

  sendSingleWhatsApp(
    tenantId: string,
    tenantName: string,
    tenantPhone?: string,
    amount?: number,
    room?: string,
    bedNo?: number,
  ) {
    this.sendingWa[tenantId] = true;
    this.api.notifications.sendMonthlyDueWhatsAppSingle(tenantId).subscribe({
      next: (res) => {
        this.sendingWa[tenantId] = false;
        this.notice = res.message;
        this.noticeType = 'success';
        setTimeout(() => (this.notice = ''), 3000);
      },
      error: (err) => {
        this.sendingWa[tenantId] = false;
        const backendMsg = err.error?.message || '';
        if (err.status === 501 || backendMsg.includes('WhatsApp API is not configured')) {
          // Fallback to wa.me click-to-chat
          const cleaned = this.cleanPhoneForWa(tenantPhone || '');
          if (!cleaned) {
            this.notice = `No phone number available for ${tenantName}`;
            this.noticeType = 'error';
            return;
          }
          const month = this.summary?.monthlyDues?.month || '';
          const year = this.summary?.monthlyDues?.year || '';
          const text = `Hello ${tenantName},\n\nYour rent of ₹${amount || ''} for ${month} ${year} is pending.\n\nRoom: ${room || ''}\nBed: ${bedNo ?? ''}\n\nPlease pay at your earliest convenience.\n\nAjs Deluxe\n📞 8555831614`;
          const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
          this.notice = `Opened WhatsApp chat for ${tenantName}`;
          this.noticeType = 'success';
          setTimeout(() => (this.notice = ''), 3000);
          return;
        }

        this.notice = backendMsg || `Failed to send WhatsApp to ${tenantName}`;
        this.noticeType = 'error';
      },
    });
  }
}
