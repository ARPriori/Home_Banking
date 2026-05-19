import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Movement } from '../../models/movement.model';

/**
 * MovementDetailComponent - presents full information about a single movement.
 */
@Component({
  selector: 'app-movement-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movement-detail.component.html',
  styleUrls: ['./movement-detail.component.css']
})
export class MovementDetailComponent implements OnInit {
  movement: Movement | null = null;
  loading = false;

  constructor(private route: ActivatedRoute, private account: AccountService) {}

  ngOnInit(): void {
    // Read id from route params and fetch the movement
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.account.getMovement(id).subscribe({
      next: (r) => (this.movement = r),
      error: () => (this.movement = null),
      complete: () => (this.loading = false)
    });
  }
}
