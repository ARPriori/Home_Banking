import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-all-accounts',
  imports: [CommonModule],
  templateUrl: './all-accounts.html',
  styleUrl: './all-accounts.css',
})
export class AllAccounts implements OnInit {
  accounts = signal<Account[]>([]);

  balances = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        console.log('Accounts loaded:', data);
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.error.set('Failed to load accounts');
        this.loading.set(false);
      },
    });
  }


}
