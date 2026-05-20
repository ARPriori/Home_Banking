import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Account } from '../../models/account.model';
import { Movement } from '../../models/movement.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-workspace.component.html',
  styleUrls: ['./account-workspace.component.css']
})
export class AccountWorkspaceComponent implements OnInit {
  account = signal<Account | null>(null);
  movements = signal<Movement[]>([]);
  loading = signal(false);

  constructor(private route: ActivatedRoute, private accountService: AccountService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
      this.loadMovements(id);
    }
  }

  loadAccount(id: string) {
    this.accountService.getAccount(id).subscribe({
      next: (a) => {
        console.log('🎯 Account loaded:', a);
        this.account.set(a);
      },
      error: (err) => {
        console.error('❌ Failed to load account:', err);
        this.account.set(null);
      }
    });
  }

  loadMovements(id: string) {
    this.loading.set(true);
    this.accountService.getMovements(id).subscribe({
      next: (r) => {
        console.log('🎯 Movements loaded:', r);
        this.movements.set(r || []);
      },
      error: (err) => {
        console.error('❌ Failed to load movements:', err);
        this.movements.set([]);
      },
      complete: () => {
        console.log('✅ Load complete');
        this.loading.set(false);
      }
    });
  }
}
