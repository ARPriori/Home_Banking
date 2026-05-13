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

export const routes: Routes = [
    { path: 'accounts', component: AllAccounts  },
    { path: 'accounts/{account}/transactions', component: AllTransactions },
    { path: 'accounts/{account}/balance', component: GetBalance },
    { path: 'accounts/{account}/deposit', component: Deposit },
    { path: 'accounts/{account}/delete', component: Delete },
    { path: 'accounts/{account}/edit', component: EditDesc },
    { path: 'accounts/{account}/balance/convert/to-crypto', component: ToCrypto },
    { path: 'accounts/{account}/balance/convert/to-fiat', component: ToFiat },
    { path: 'accounts/{account}/transaction', component: Transaction },
    { path: 'accounts/{account}/withdraw', component: Withdraw }
];
