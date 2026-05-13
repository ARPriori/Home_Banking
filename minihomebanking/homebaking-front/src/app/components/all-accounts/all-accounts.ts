import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/AccountServices.service';

@Component({
  selector: 'app-all-accounts',
  imports: [CommonModule],
  templateUrl: './all-accounts.html',
  styleUrl: './all-accounts.css',
})
export class AllAccounts implements OnInit {
  accounts = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load accounts');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
