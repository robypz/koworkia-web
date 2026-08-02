import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Company } from '../../core/models/company.model';
import { AuthService } from '../../core/services/auth.service';
import { CompaniesService } from '../companies/companies.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly companiesService = inject(CompaniesService);
  private readonly auth = inject(AuthService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly primaryCtaLink = computed(() => (this.isAuthenticated() ? '/bookings' : '/login'));

  protected readonly companies = signal<Company[]>([]);
  protected readonly loading = signal(true);
  /** Anonymous visitors get a 401 from the companies list; show a login CTA instead of an error. */
  protected readonly companiesLocked = signal(false);

  ngOnInit(): void {
    this.companiesService.list().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.companiesLocked.set(true);
        }
        this.loading.set(false);
      },
    });
  }
}
