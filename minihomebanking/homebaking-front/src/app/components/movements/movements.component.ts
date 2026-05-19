import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Movement } from '../../models/movement.model';

/**
 * MovementsComponent - shows a table of recent transactions.
 * Includes simple totals and color-coded rows for clarity.
 */
@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css']
})
export class MovementsComponent implements OnInit {
  movements: Movement[] = [];
  loading = false;

  constructor(private account: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  /** Load movements from the backend */
  load() {
    this.loading = true;
    this.account.getMovements().subscribe({
      next: (r) => (this.movements = r || []),
      error: () => (this.movements = []),
      complete: () => (this.loading = false)
    });
  }

  /** Navigate to movement detail view */
  open(m: Movement) {
    if (m.id) this.router.navigate(['/movement', m.id]);
  }

  /** Compute sum of deposits */
  get depositsTotal() {
    return this.movements.filter(m => m.type === 'deposit').reduce((s, m) => s + (m.amount || 0), 0);
  }

  /** Compute sum of withdrawals */
  get withdrawalsTotal() {
    return this.movements.filter(m => m.type === 'withdrawal').reduce((s, m) => s + (m.amount || 0), 0);
  }

  /** Net total (deposits - withdrawals) */
  get netTotal() {
    return this.depositsTotal - this.withdrawalsTotal;
  }
}
