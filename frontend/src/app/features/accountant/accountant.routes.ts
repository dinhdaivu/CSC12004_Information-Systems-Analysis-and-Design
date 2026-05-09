import { Routes } from '@angular/router';
import { AccountantLayoutComponent } from './accountant-layout.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { MonthlyBillingComponent } from './components/monthly-billing/monthly-billing.component';
import { FinalSettlementComponent } from './components/final-settlement/final-settlement.component';
import { RefundExecutionComponent } from './components/refund-execution/refund-execution.component';

export const ACCOUNTANT_ROUTES: Routes = [
  {
    path: '',
    component: AccountantLayoutComponent,
    children: [
      { path: '', redirectTo: 'transactions', pathMatch: 'full' },
      { path: 'transactions',    component: TransactionsComponent },
      { path: 'monthly-billing', component: MonthlyBillingComponent },
      { path: 'checkout',        component: FinalSettlementComponent },
      { path: 'refunds',         component: RefundExecutionComponent },
    ]
  }
];
