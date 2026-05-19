import { Component, OnInit } from '@angular/core';
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
  account: Account | null = null;
  movements: Movement[] = [];
  loading = false;

  constructor(private route: ActivatedRoute, private accountService: AccountService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
      this.loadMovements(id);
    }
  }

  loadAccount(id: string) {
    this.accountService.getAccount(id).subscribe({ next: a => this.account = a, error: () => null });
  }

  loadMovements(id: string) {
    this.loading = true;
    this.accountService.getMovements(id).subscribe({
      next: (r) => (this.movements = r || []),
      error: () => (this.movements = []),
      complete: () => (this.loading = false)
    });
  }
}
