import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense, MonthlyDues, Rent, Room, Settings, Summary, Tenant } from '../models';
import { environment } from '../../../environments/environment';

export const API_URL = environment.apiUrl;
export const FILE_URL = environment.fileUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  rooms = {
    list: () => this.http.get<Room[]>(`${API_URL}/rooms`),
    create: (data: Room) => this.http.post<Room>(`${API_URL}/rooms`, data),
    update: (id: string, data: Room) => this.http.put<Room>(`${API_URL}/rooms/${id}`, data),
    delete: (id: string) => this.http.delete<void>(`${API_URL}/rooms/${id}`)
  };

  tenants = {
    list: () => this.http.get<Tenant[]>(`${API_URL}/tenants`),
    create: (data: FormData) => this.http.post<Tenant>(`${API_URL}/tenants`, data),
    update: (id: string, data: FormData) => this.http.put<Tenant>(`${API_URL}/tenants/${id}`, data),
    delete: (id: string) => this.http.delete<void>(`${API_URL}/tenants/${id}`)
  };

  rents = {
    list: () => this.http.get<Rent[]>(`${API_URL}/rents`),
    create: (data: Rent) => this.http.post<Rent>(`${API_URL}/rents`, data),
    update: (id: string, data: Rent) => this.http.put<Rent>(`${API_URL}/rents/${id}`, data),
    delete: (id: string) => this.http.delete<void>(`${API_URL}/rents/${id}`)
  };

  expenses = {
    list: () => this.http.get<Expense[]>(`${API_URL}/expenses`),
    create: (data: FormData) => this.http.post<Expense>(`${API_URL}/expenses`, data),
    update: (id: string, data: FormData) => this.http.put<Expense>(`${API_URL}/expenses/${id}`, data),
    delete: (id: string) => this.http.delete<void>(`${API_URL}/expenses/${id}`)
  };

  reports = {
    summary: () => this.http.get<Summary>(`${API_URL}/reports/summary`)
  };

  settings = {
    get: () => this.http.get<Settings>(`${API_URL}/settings`),
    update: (data: Partial<Settings>) => this.http.put<Settings>(`${API_URL}/settings`, data),
    public: () => this.http.get<{ settings: Settings; bills: Expense[]; serverTime: string }>(`${API_URL}/settings/public`)
  };

  notifications = {
    monthlyDues: () => this.http.get<MonthlyDues>(`${API_URL}/notifications/monthly-dues`),
    sendMonthlyDueEmails: (adminEmail?: string) =>
      this.http.post<{ message: string; sent?: string[]; monthlyDues: MonthlyDues }>(`${API_URL}/notifications/monthly-dues/email`, { adminEmail })
  };
}
