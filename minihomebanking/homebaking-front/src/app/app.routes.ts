import { Routes } from '@angular/router';
import { AllAccounts } from './components/all-accounts/all-accounts';
import { Delete } from './components/delete/delete';
import { Deposit } from './components/deposit/deposit';
import { EditDesc } from './components/edit-desc/edit-desc';
import { GetBalance } from './components/get-balance/get-balance';
import { ToCrypto } from './components/to-crypto/to-crypto';
import { ToFiat } from './components/to-fiat/to-fiat';
import { Transaction } from './components/transaction/transaction';
import { Withdraw } from './components/withdraw/withdraw';
import { AllTransactions } from './components/all-transactions/all-transactions';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MovementsComponent } from './components/movements/movements.component';
import { MovementDetailComponent } from './components/movement-detail/movement-detail.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { ConversionComponent } from './components/conversion/conversion.component';
import { AccountsOverviewComponent } from './components/accounts-overview/accounts-overview.component';
import { AccountWorkspaceComponent } from './components/account-workspace/account-workspace.component';

export const routes: Routes = [
    { path: 'accounts', component: AccountsOverviewComponent },
    { path: 'accounts/:account/transactions', component: AllTransactions },
    { path: 'accounts/:account/balance', component: GetBalance },
    { path: 'accounts/:account/deposit', component: Deposit },
    { path: 'accounts/:account/delete', component: Delete },
    { path: 'accounts/:account/edit', component: EditDesc },
    { path: 'accounts/:account/balance/convert/to-crypto', component: ToCrypto },
    { path: 'accounts/:account/balance/convert/to-fiat', component: ToFiat },
    { path: 'accounts/:account/transaction', component: Transaction },
    { path: 'accounts/:account/withdraw', component: Withdraw },
    { path: '', component: AccountsOverviewComponent, pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'movements', component: MovementsComponent },
    { path: 'movement/:id', component: MovementDetailComponent },
    { path: 'new', component: TransactionFormComponent },
    // { path: 'convert/fiat/:currency', component: ConversionComponent, data: { type: 'fiat' } },
    // { path: 'convert/crypto/:symbol', component: ConversionComponent, data: { type: 'crypto' } },
    { path: 'account/:id', component: AccountWorkspaceComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
