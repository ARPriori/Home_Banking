import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';

/**
 * DashboardComponent - shows current balance and quick navigation
 * Uses Angular Signals for simple reactive UI state.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Current balance (null when unknown)
  balance = signal<number | null>(null);
  // Loading indicator for async calls
  loading = signal(false);

  constructor(private account: AccountService) {
    // Load balance on component creation
    this.loadBalance();

    // Small effect to ensure balance() is tracked by Angular's change detection.
    effect(() => {
      this.balance();
    });
  }

  /** Fetch current balance from API and update signals */
  loadBalance() {
    this.loading.set(true);
    this.account.getBalance().subscribe({
      next: (r) => this.balance.set(r.balance),
      error: () => this.balance.set(null),
      complete: () => this.loading.set(false)
    });
  }
}
