import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.css']
})
export class ConversionComponent {
  type: 'fiat' | 'crypto' = 'fiat';
  symbol = 'USD';
  result: any = null;

  constructor(private route: ActivatedRoute, private account: AccountService) {
    const data = this.route.snapshot.data as any;
    this.type = data?.type || 'fiat';
    const params = this.route.snapshot.paramMap;
    this.symbol = (params.get('currency') || params.get('symbol') || 'USD') as string;
    this.convert();
  }

  convert() {
    if (this.type === 'fiat') {
      this.account.convertFiat(this.symbol).subscribe((r) => (this.result = r));
    } else {
      this.account.convertCrypto(this.symbol).subscribe((r) => (this.result = r));
    }
  }
}
