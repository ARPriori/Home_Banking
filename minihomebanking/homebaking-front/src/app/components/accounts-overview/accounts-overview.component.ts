import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-accounts-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-overview.component.html',
  styleUrls: ['./accounts-overview.component.css']
})
export class AccountsOverviewComponent implements OnInit {
  accounts: any[] = [];
  loading = false;
  error = '';
  currentRoute = '';

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    console.log('AccountsOverview current route:', this.currentRoute);
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.accountService.getAccounts().subscribe({
      next: (r: any) => {
        console.log('Accounts loaded', r);
        this.accounts = r || [];
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.accounts = [];
        this.error = 'Failed to load accounts. Check backend connectivity (console for details).';
      },
      complete: () => (this.loading = false)
    });
  }

  openAccount(a: any) {
    const id = a?.id ?? a?.[0];
    if (id !== undefined) {
      this.router.navigate(['/account', id]);
    }
  }
}
