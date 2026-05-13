import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CheckoutService, CheckoutRequestDTO, CheckoutStatus, CheckoutInspectionDTO } from '@core/services/checkout.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-checkout-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width:100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div *ngIf="isLoading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style="background: #fef4df">
        <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="h-28 w-auto object-contain" />
        <p class="text-[1.05rem] italic tracking-wide text-[#264893]/70" style="font-family: 'Afacad', sans-serif">Nurturing Your Journey, Building Your Home.</p>
        <span class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"></span>
      </div>

      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute" src="assets/pictures/Background.png" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>

          <div style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">
            Checkout Requests
          </div>
          <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
            Review and confirm room inspections for pending checkout requests.
          </div>

          <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
            <div class="mb-4 flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input [(ngModel)]="searchTerm" placeholder="Search resident or room..." class="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </div>
              <div class="relative">
                <button (click)="isStatusDropdownOpen = !isStatusDropdownOpen" class="flex w-36 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors hover:bg-slate-50">
                  <span class="text-slate-700 truncate">{{ statusFilter === '' ? 'All statuses' : (statusFilter | titlecase) }}</span>
                  <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200" [class.rotate-180]="isStatusDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Backdrop -->
                <div *ngIf="isStatusDropdownOpen" (click)="isStatusDropdownOpen = false" class="fixed inset-0 z-[40]"></div>

                <!-- Dropdown Menu -->
                <div *ngIf="isStatusDropdownOpen" class="absolute left-0 top-[calc(100%+4px)] z-[50] w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <button (click)="selectStatus('')" 
                    [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === '', 'text-slate-600 hover:bg-slate-50': statusFilter !== ''}"
                    class="w-full px-4 py-2.5 text-left text-sm transition-colors">All statuses</button>
                  <button (click)="selectStatus('requested')" 
                    [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'requested', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'requested'}"
                    class="w-full px-4 py-2.5 text-left text-sm transition-colors">Requested</button>
                  <button (click)="selectStatus('confirmed')" 
                    [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'confirmed', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'confirmed'}"
                    class="w-full px-4 py-2.5 text-left text-sm transition-colors">Confirmed</button>
                  <button (click)="selectStatus('completed')" 
                    [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'completed', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'completed'}"
                    class="w-full px-4 py-2.5 text-left text-sm transition-colors">Completed</button>
                  <button (click)="selectStatus('cancelled')" 
                    [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'cancelled', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'cancelled'}"
                    class="w-full px-4 py-2.5 text-left text-sm transition-colors">Cancelled</button>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-[#264893] text-white">
                  <tr>
                    <th class="px-5 py-3 text-left font-semibold">Resident</th>
                    <th class="px-5 py-3 text-left font-semibold">Room</th>
                    <th class="px-5 py-3 text-left font-semibold">Checkout Date</th>
                    <th class="px-5 py-3 text-left font-semibold">Reason</th>
                    <th class="px-5 py-3 text-left font-semibold">Status</th>
                    <th class="px-5 py-3 text-left font-semibold">Settlement</th>
                    <th class="px-5 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="filtered.length === 0">
                    <td colspan="7" class="px-5 py-10 text-center text-slate-400">No checkout requests found.</td>
                  </tr>
                  <tr *ngFor="let row of paginated; let i = index" [class]="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'" class="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td class="px-5 py-3">
                      <div class="font-semibold text-[#264893]">{{ row.customer?.fullName || '—' }}</div>
                      <div class="text-xs text-slate-400">{{ row.customer?.email }}</div>
                    </td>
                    <td class="px-5 py-3 text-slate-600">{{ row.room?.roomNumber || '—' }}{{ row.bed ? ' / ' + row.bed.bedNumber : '' }}</td>
                    <td class="px-5 py-3 text-slate-600">{{ row.requestedCheckoutDate | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 text-slate-500 max-w-[180px] truncate" [title]="row.reason || ''">{{ row.reason || '—' }}</td>
                    <td class="px-5 py-3"><span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(row.status)">{{ row.status | titlecase }}</span></td>
                    <td class="px-5 py-3">
                      <span *ngIf="row.settlement" class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="settlementClass(row.settlement.status)">{{ row.settlement.status | titlecase }}</span>
                      <span *ngIf="!row.settlement" class="text-xs text-slate-400">—</span>
                    </td>
                    <td class="px-5 py-3 text-center">
                      <button *ngIf="row.status === 'requested'" (click)="confirmRequest(row)" [disabled]="confirmingId === row.id" class="rounded-lg bg-[#264893] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors">{{ confirmingId === row.id ? 'Confirming…' : 'Confirm Inspection' }}</button>
                      <button *ngIf="row.status === 'requested'" (click)="cancelRequest(row)" [disabled]="confirmingId === row.id" class="ml-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">Cancel</button>
                      <button *ngIf="row.status === 'confirmed'" (click)="openProcessModal(row)" class="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Process Checkout</button>
                      <span *ngIf="row.status !== 'requested' && row.status !== 'confirmed'" class="text-xs text-slate-400">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 mb-8 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {{ paginated.length }} of {{ filtered.length }} results</span>
              <div class="flex gap-2">
                <button (click)="prevPage()" [disabled]="page === 1" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors">&lt;</button>
                <button *ngFor="let p of pages" (click)="page = p; loadData()" [class]="p === page ? 'bg-[#264893] text-white border-[#264893]' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'" class="rounded-lg border px-3 py-1.5 min-w-[36px] transition-colors">{{ p }}</button>
                <button (click)="nextPage()" [disabled]="page >= totalPages" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors">&gt;</button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</div>
          </div>

          <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
        </div>
      </div>

      <!-- Process Checkout Modal -->
      <div *ngIf="showProcessModal && selectedCheckout" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" style="font-family: 'Afacad', sans-serif">
        <div class="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl my-auto border border-[#264893]/10 flex flex-col max-h-[90vh]">
          <div class="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <h2 class="text-3xl font-bold text-[#264893]" style="font-family: 'Big Shoulders Text', sans-serif; letter-spacing: 0.5px;">Process Checkout</h2>
            <button (click)="closeProcessModal()" class="text-slate-400 hover:text-red-500 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <!-- Summary Info -->
            <div class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="font-semibold text-slate-500 block">Resident</span><span class="text-slate-800 font-medium">{{ selectedCheckout.customer?.fullName }}</span></div>
                <div><span class="font-semibold text-slate-500 block">Room</span><span class="text-slate-800 font-medium">{{ selectedCheckout.room?.roomNumber }}</span></div>
                <div><span class="font-semibold text-slate-500 block">Requested Date</span><span class="text-slate-800 font-medium">{{ selectedCheckout.requestedCheckoutDate | date:'mediumDate' }}</span></div>
                <div><span class="font-semibold text-slate-500 block">Reason</span><span class="text-slate-800 font-medium">{{ selectedCheckout.reason || 'N/A' }}</span></div>
              </div>
            </div>

            <!-- Step 0: Room Inspection (UC4 §3.1.4) -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">0</span>
                <h3 class="font-bold text-slate-700 text-lg">Room Inspection</h3>
                <span *ngIf="inspection" class="ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="inspection.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'">
                  {{ inspection.status | titlecase }}
                </span>
              </div>

              <div *ngIf="!inspection" class="rounded-xl border border-dashed border-slate-300 p-5 space-y-3">
                <p class="text-sm text-slate-500">Record the physical inspection result before computing settlement.</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Overall Condition</label>
                    <select [(ngModel)]="inspectionForm.overallCondition" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893]">
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Cleanliness</label>
                    <input type="text" [(ngModel)]="inspectionForm.cleanlinessNote" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893]" placeholder="e.g. Acceptable, needs minor cleaning" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea [(ngModel)]="inspectionForm.notes" rows="2" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893] resize-none" placeholder="Any other observations..."></textarea>
                </div>
                <div class="flex justify-end">
                  <button (click)="createInspection()" [disabled]="processingId === selectedCheckout.id" class="rounded-lg bg-[#264893] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50">
                    {{ processingId === selectedCheckout.id ? 'Saving…' : 'Save Inspection' }}
                  </button>
                </div>
              </div>

              <div *ngIf="inspection" class="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
                <div class="grid grid-cols-2 gap-3">
                  <div><span class="text-slate-500 block">Overall Condition</span><span class="font-medium text-slate-800">{{ inspection.overallCondition || '—' }}</span></div>
                  <div><span class="text-slate-500 block">Cleanliness</span><span class="font-medium text-slate-800">{{ inspection.cleanlinessNote || '—' }}</span></div>
                </div>
                <div *ngIf="inspection.notes"><span class="text-slate-500 block">Notes</span><span class="font-medium text-slate-800">{{ inspection.notes }}</span></div>
                <div *ngIf="inspection.damageReports.length > 0">
                  <span class="text-slate-500 block mb-1">Damages ({{ inspection.damageReports.length }})</span>
                  <ul class="list-disc pl-5 text-slate-700">
                    <li *ngFor="let d of inspection.damageReports">{{ d.itemName }} — {{ d.estimatedCost | currency:'VND' }}</li>
                  </ul>
                </div>
                <div *ngIf="inspection.keyReturns.length > 0">
                  <span class="text-slate-500 block mb-1">Key/Card Returns</span>
                  <ul class="list-disc pl-5 text-slate-700">
                    <li *ngFor="let k of inspection.keyReturns">{{ k.itemName }} — {{ k.returned ? 'Returned' : 'Missing (' + (k.replacementCost | currency:'VND') + ')' }}</li>
                  </ul>
                </div>
                <div *ngIf="inspection.status === 'pending'" class="flex justify-end pt-2">
                  <button (click)="completeInspection()" [disabled]="processingId === selectedCheckout.id" class="rounded-lg border border-[#264893] px-4 py-1.5 text-xs font-semibold text-[#264893] hover:bg-[#264893] hover:text-white disabled:opacity-50">
                    {{ processingId === selectedCheckout.id ? 'Saving…' : 'Mark Inspection Completed' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 1: Settlement -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">1</span>
                <h3 class="font-bold text-slate-700 text-lg">Settlement Details</h3>
                <span *ngIf="selectedCheckout.settlement" class="ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" [ngClass]="settlementClass(selectedCheckout.settlement.status)">{{ selectedCheckout.settlement.status | titlecase }}</span>
              </div>

              <!-- No Settlement Yet -->
              <div *ngIf="!selectedCheckout.settlement" class="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <p class="text-sm text-slate-500 mb-3">No settlement record found for this checkout.</p>
                <button (click)="createSettlement()" [disabled]="processingId === selectedCheckout.id" class="rounded-lg bg-[#264893] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors">
                  {{ processingId === selectedCheckout.id ? 'Creating...' : 'Create Settlement Draft' }}
                </button>
              </div>

              <!-- Settlement Exists -->
              <div *ngIf="selectedCheckout.settlement" class="rounded-xl border border-slate-200 p-5 space-y-4">
                <div class="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div><span class="text-slate-500 block">Deposit Total</span><span class="font-medium text-slate-800">{{ selectedCheckout.settlement.depositTotal | currency:'VND' }}</span></div>
                  <div><span class="text-slate-500 block">Refund Rate</span><span class="font-medium text-slate-800">{{ selectedCheckout.settlement.refundRate * 100 }}%</span></div>
                  <div><span class="text-slate-500 block">Base Refund</span><span class="font-medium text-slate-800">{{ (selectedCheckout.settlement.depositTotal * selectedCheckout.settlement.refundRate) | currency:'VND' }}</span></div>
                </div>

                <!-- Draft State: Editable Deduction -->
                <ng-container *ngIf="selectedCheckout.settlement.status === 'draft'">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-slate-600 mb-1">Deduction Amount (VND)</label>
                      <input type="number" [(ngModel)]="settlementForm.deduction" class="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#264893]" min="0" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-600 mb-1">Final Amount</label>
                      <div class="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-slate-700 font-bold" [ngClass]="{'text-red-600': draftFinalAmount < 0, 'text-green-600': draftFinalAmount > 0}">
                        {{ draftFinalAmount | currency:'VND' }}
                        <span class="text-xs font-normal text-slate-500 ml-1">{{ draftFinalAmount >= 0 ? '(Refund to Customer)' : '(Fee from Customer)' }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                    <textarea [(ngModel)]="settlementForm.notes" rows="2" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893] resize-none" placeholder="Reason for deduction..."></textarea>
                  </div>
                  <div class="flex justify-end pt-2">
                    <button (click)="saveAndConfirmSettlement()" [disabled]="processingId === selectedCheckout.id" class="rounded-lg bg-[#264893] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors">
                      {{ processingId === selectedCheckout.id ? 'Processing...' : 'Save & Confirm Settlement' }}
                    </button>
                  </div>
                </ng-container>

                <!-- Confirmed State: Customer Signature gate + Payment Method -->
                <ng-container *ngIf="selectedCheckout.settlement.status === 'confirmed'">
                  <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div><span class="text-slate-500 block font-semibold text-sm">Deduction</span><span class="font-medium text-slate-800">{{ selectedCheckout.settlement.deduction | currency:'VND' }}</span></div>
                    <div><span class="text-slate-500 block font-semibold text-sm">Final Amount</span>
                      <span class="font-bold text-lg" [ngClass]="{'text-red-600': selectedCheckout.settlement.finalAmount < 0, 'text-green-600': selectedCheckout.settlement.finalAmount > 0}">
                        {{ selectedCheckout.settlement.finalAmount | currency:'VND' }}
                      </span>
                    </div>
                  </div>

                  <!-- Customer signature (required before completion per UC4 §3.1.4) -->
                  <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
                    <p class="text-sm font-semibold text-amber-900 mb-2">Customer Signature {{ selectedCheckout.settlement.customerSignatureUrl ? '✓' : '— required before completion' }}</p>
                    <div *ngIf="!selectedCheckout.settlement.customerSignatureUrl" class="flex gap-2">
                      <input type="text" [(ngModel)]="customerSignatureUrl" class="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893]" placeholder="Paste signature image URL (Cloudinary, etc.)" />
                      <button (click)="signSettlement()" [disabled]="processingId === selectedCheckout.id" class="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                        {{ processingId === selectedCheckout.id ? 'Signing…' : 'Attach Signature' }}
                      </button>
                    </div>
                    <div *ngIf="selectedCheckout.settlement.customerSignatureUrl" class="text-xs text-amber-900">
                      Signed at {{ selectedCheckout.settlement.signedAt | date:'short' }} —
                      <a [href]="selectedCheckout.settlement.customerSignatureUrl" target="_blank" class="underline">view signature</a>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-slate-600 mb-1">Payment Method</label>
                      <select [(ngModel)]="settlementForm.payment_method" class="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#264893]">
                        <option value="cash">Cash</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="vietqr">VietQR</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                      <input type="text" [(ngModel)]="settlementForm.notes" class="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#264893]" placeholder="Optional notes..." />
                    </div>
                  </div>
                  <div class="flex justify-end pt-2">
                    <button (click)="completeSettlement()"
                            [disabled]="processingId === selectedCheckout.id || !selectedCheckout.settlement.customerSignatureUrl"
                            [title]="!selectedCheckout.settlement.customerSignatureUrl ? 'Customer signature required first' : ''"
                            class="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {{ processingId === selectedCheckout.id ? 'Processing...' : (selectedCheckout.settlement.finalAmount >= 0 ? 'Mark Refunded' : 'Mark Paid') }}
                    </button>
                  </div>
                </ng-container>

                <!-- Paid/Refunded State -->
                <ng-container *ngIf="selectedCheckout.settlement.status === 'paid' || selectedCheckout.settlement.status === 'refunded'">
                  <div class="grid grid-cols-2 gap-4 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                    <div><span class="text-green-700 block font-semibold">Final Amount</span><span class="font-bold text-green-800">{{ selectedCheckout.settlement.finalAmount | currency:'VND' }}</span></div>
                    <div><span class="text-green-700 block font-semibold">Payment Method</span><span class="font-medium text-green-800">{{ selectedCheckout.settlement.paymentMethod | titlecase }}</span></div>
                  </div>
                </ng-container>
              </div>
            </div>

            <!-- Step 2: Complete Checkout -->
            <div class="mb-2">
              <div class="flex items-center gap-2 mb-4">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">2</span>
                <h3 class="font-bold text-slate-700 text-lg">Finalize Termination</h3>
              </div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
                <div class="text-sm text-slate-600">
                  <p class="font-semibold text-slate-800 mb-1">Terminate Contract & Free Room</p>
                  <p>This action will mark the contract as terminated and set the room/bed to available.</p>
                </div>
                <button (click)="completeCheckout()" 
                        [disabled]="processingId === selectedCheckout.id || !selectedCheckout.settlement || (selectedCheckout.settlement.status !== 'paid' && selectedCheckout.settlement.status !== 'refunded')" 
                        class="rounded-lg bg-[#264893] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors disabled:cursor-not-allowed whitespace-nowrap">
                  {{ processingId === selectedCheckout.id ? 'Finalizing...' : 'Complete Checkout' }}
                </button>
              </div>
            </div>
            
            <!-- Error message inside modal -->
            <div *ngIf="errorMsg" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</div>
          </div>
        </div>
      </div>

      <ng-template #sidebarAndMenus>
        <div (click)="navigate('/guidelines')" class="hover-effect" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.GUIDELINES" | translate }}
        </div>
        <div (click)="navigate('/about')" class="hover-effect" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.ABOUT_US" | translate }}
        </div>
        <div (click)="navigate('/contact')" class="hover-effect" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
          {{ "COMMON.CONTACT" | translate }}
        </div>

        <img (click)="toggleLangMenu()" class="hover-effect" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Globe.png" />
        <div *ngIf="isLangMenuOpen" style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
          <div (click)="changeLang('en')" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.ENGLISH" | translate }}</div>
          <div (click)="changeLang('vi')" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.VIETNAMESE" | translate }}</div>
        </div>

        <img (click)="toggleUserMenu()" class="hover-effect" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
        <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
          <div (mousedown)="logout()" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ "COMMON.LOGOUT" | translate }}</div>
        </div>

        <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/CheckoutUnion.png" />
        <img (click)="navigate('/')" class="hover-effect" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />

        <div (click)="navigate('/admin/rental-requests')" class="hover-effect" style="cursor: pointer; width: 196px; height: 46px; left: 166px; top: 320px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.INQUIRIES" | translate }}
        </div>
        <img (click)="navigate('/admin/rental-requests')" class="hover-effect" src="assets/icons/WhiteInquiries.png" style="cursor: pointer; width: 28px; height: 25px; left: 110px; top: 331px; position: absolute;" />

        <div (click)="navigate('/admin/scheduled')" class="hover-effect" style="cursor: pointer; width: 160px; height: 46px; left: 166px; top: 380px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.SCHEDULES" | translate }}
        </div>
        <img (click)="navigate('/admin/scheduled')" class="hover-effect" src="assets/icons/Schedules.png" style="cursor: pointer; width: 34px; height: 30px; left: 107px; top: 390px; position: absolute;" />

        <div (click)="navigate('/admin/rooms')" class="hover-effect" style="cursor: pointer; width: 195px; height: 46px; left: 161px; top: 440px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 700; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.ROOMS" | translate }}
        </div>
        <img (click)="navigate('/admin/rooms')" class="hover-effect" src="assets/icons/Rooms.png" style="cursor: pointer; width: 30px; height: 27px; left: 107px; top: 450px; position: absolute;" />

        <div (click)="navigate('/admin/payments')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 500px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.RESERVATIONS" | translate }}
        </div>
        <img (click)="navigate('/admin/payments')" class="hover-effect" src="assets/icons/Reservation.png" style="cursor: pointer; width: 26px; height: 26px; left: 107px; top: 510px; position: absolute;" />

        <div (click)="navigate('/admin/contracts')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 560px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Contracts
        </div>
        <img (click)="navigate('/admin/contracts')" class="hover-effect" src="assets/icons/Contracts.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 570px; position: absolute;" />

        <div (click)="navigate('/admin/users')" class="hover-effect" style="cursor: pointer; width: 168px; height: 46px; left: 163px; top: 620px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Users
        </div>
        <img (click)="navigate('/admin/users')" class="hover-effect" src="assets/icons/Users.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 630px; position: absolute;" />

        <div (click)="navigate('/admin/checkout-requests')" class="hover-effect" style="cursor: pointer; width: 200px; height: 46px; left: 163px; top: 680px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Checkouts
        </div>
        <img (click)="navigate('/admin/checkout-requests')" class="hover-effect" src="assets/icons/BlueCheckout.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 690px; position: absolute;" />

        <div (click)="navigate('/admin/handovers')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 740px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Handovers
        </div>
        <img (click)="navigate('/admin/handovers')" class="hover-effect" src="assets/icons/Handover.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 750px; position: absolute;" />

        <div (click)="navigate('/admin/chat')" class="hover-effect" style="cursor: pointer; width: 168px; height: 46px; left: 163px; top: 800px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          {{ "ADMIN_RENTAL.SIDEBAR.CHAT" | translate }}
        </div>
        <img (click)="navigate('/admin/chat')" class="hover-effect" src="assets/icons/Chat.png" style="cursor: pointer; width: 28px; height: 28px; left: 110px; top: 810px; position: absolute;" />

        <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.TITLE" | translate }}<br /><br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.HEADQUARTERS" | translate }} </span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.ADDRESS_1" | translate }}<br />{{ "CONTACT_INFO.ADDRESS_2" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.PHONE_LABEL" | translate }} </span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.PHONE" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.EMAIL_LABEL" | translate }}</span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.EMAIL" | translate }}<br/></span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ "CONTACT_INFO.HOURS_LABEL" | translate }}</span>
          <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ "CONTACT_INFO.HOURS" | translate }}</span>
        </div>
      </ng-template>
    </div>
  `,
})
export class CheckoutRequestsComponent implements OnInit, OnDestroy {
  private readonly checkoutSvc = inject(CheckoutService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly translate = inject(TranslateService);
  private readonly authSvc = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  // layout helpers
  scaleFactor = typeof window !== 'undefined' ? window.innerWidth / 1920 : 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isStatusDropdownOpen = false;

  isLoading = false;
  confirmingId: string | null = null;
  errorMsg = '';
  searchTerm = '';
  statusFilter: CheckoutStatus | '' = 'requested';
  page = 1;
  readonly limit = 20;
  total = 0;

  // Process checkout modal
  showProcessModal = false;
  selectedCheckout: CheckoutRequestDTO | null = null;
  processingId: string | null = null;
  settlementForm = {
    deduction: 0,
    notes: '',
    payment_method: 'cash' as 'cash' | 'transfer' | 'vietqr'
  };

  // UC4: room inspection record (loaded when modal opens for a confirmed request).
  inspection: CheckoutInspectionDTO | null = null;
  inspectionForm = {
    cleanlinessNote: '',
    overallCondition: 'good',
    notes: '',
  };

  // UC4: customer signature on the settlement before refund/payment is executed.
  customerSignatureUrl = '';

  private rows: CheckoutRequestDTO[] = [];

  ngOnInit() { this.loadData(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.scaleFactor = window.innerWidth / 1920;
    }
  }

  toggleLangMenu() { this.isLangMenuOpen = !this.isLangMenuOpen; this.isUserMenuOpen = false; }
  toggleUserMenu() { this.isUserMenuOpen = !this.isUserMenuOpen; this.isLangMenuOpen = false; }
  changeLang(lang: string) { this.translate.use(lang); this.isLangMenuOpen = false; }
  navigate(path: string) { this.router.navigate([path]); this.isUserMenuOpen = false; }
  logout() {
    this.authSvc.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.listCheckoutRequests({
      page: this.page,
      limit: this.limit,
      status: this.statusFilter || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.rows = res.data.data; this.total = res.data.meta.total; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.errorMsg = 'Failed to load checkout requests.'; this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  selectStatus(status: CheckoutStatus | '') {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onFilterChange();
  }

  onFilterChange() { this.page = 1; this.loadData(); }

  confirmRequest(row: CheckoutRequestDTO) {
    this.confirmingId = row.id;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.confirmCheckoutRequest(row.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.confirmingId = null; this.cdr.markForCheck(); this.loadData(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to confirm.'; this.confirmingId = null; this.cdr.markForCheck(); },
    });
  }

  cancelRequest(row: CheckoutRequestDTO) {
    if (!window.confirm(`Cancel checkout request for ${row.customer?.fullName ?? 'this resident'}?`)) return;
    this.confirmingId = row.id;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.checkoutSvc.cancelCheckoutRequest(row.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.confirmingId = null; this.cdr.markForCheck(); this.loadData(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to cancel.'; this.confirmingId = null; this.cdr.markForCheck(); },
    });
  }

  openProcessModal(row: CheckoutRequestDTO) {
    this.selectedCheckout = row;
    if (row.settlement) {
      this.settlementForm.deduction = row.settlement.deduction;
      this.settlementForm.notes = row.settlement.notes || '';
      this.settlementForm.payment_method = row.settlement.paymentMethod || 'cash';
      this.customerSignatureUrl = row.settlement.customerSignatureUrl ?? '';
    } else {
      this.settlementForm.deduction = 0;
      this.settlementForm.notes = '';
      this.settlementForm.payment_method = 'cash';
      this.customerSignatureUrl = '';
    }
    this.inspection = null;
    this.inspectionForm = { cleanlinessNote: '', overallCondition: 'good', notes: '' };
    this.showProcessModal = true;
    this.errorMsg = '';
    // Load existing inspection if any
    this.checkoutSvc.getInspection(row.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.inspection = res.data; this.cdr.markForCheck(); },
      error: () => { /* no inspection yet — that's fine */ },
    });
  }

  closeProcessModal() {
    this.showProcessModal = false;
    this.selectedCheckout = null;
    this.inspection = null;
    this.customerSignatureUrl = '';
  }

  createInspection() {
    if (!this.selectedCheckout) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    this.checkoutSvc.createInspection(this.selectedCheckout.id, {
      cleanlinessNote: this.inspectionForm.cleanlinessNote || undefined,
      overallCondition: this.inspectionForm.overallCondition || undefined,
      notes: this.inspectionForm.notes || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.inspection = res.data; this.processingId = null; this.cdr.markForCheck(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to create inspection'; this.processingId = null; this.cdr.markForCheck(); },
    });
  }

  completeInspection() {
    if (!this.selectedCheckout) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    this.checkoutSvc.completeInspection(this.selectedCheckout.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.inspection = res.data; this.processingId = null; this.cdr.markForCheck(); },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to complete inspection'; this.processingId = null; this.cdr.markForCheck(); },
    });
  }

  signSettlement() {
    if (!this.selectedCheckout?.settlement) return;
    if (!this.customerSignatureUrl?.trim()) {
      this.errorMsg = 'Please paste the customer signature image URL first';
      return;
    }
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    const cid = this.selectedCheckout.id;
    const sid = this.selectedCheckout.settlement.id;
    this.checkoutSvc.signSettlement(cid, sid, this.customerSignatureUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (this.selectedCheckout) this.selectedCheckout.settlement = res.data;
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => { this.errorMsg = err?.error?.message ?? 'Failed to sign settlement'; this.processingId = null; this.cdr.markForCheck(); },
    });
  }

  get draftFinalAmount(): number {
    if (!this.selectedCheckout || !this.selectedCheckout.settlement) return 0;
    const s = this.selectedCheckout.settlement;
    const baseRefund = s.depositTotal * s.refundRate;
    return baseRefund - this.settlementForm.deduction;
  }

  createSettlement() {
    if (!this.selectedCheckout) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    this.checkoutSvc.createSettlement(this.selectedCheckout.id, { deduction: 0 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (this.selectedCheckout) this.selectedCheckout.settlement = res.data;
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to create settlement';
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  saveAndConfirmSettlement() {
    if (!this.selectedCheckout || !this.selectedCheckout.settlement) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    const checkoutId = this.selectedCheckout.id;
    const settlementId = this.selectedCheckout.settlement.id;
    
    this.checkoutSvc.updateSettlementDeduction(checkoutId, settlementId, {
      deduction: this.settlementForm.deduction,
      notes: this.settlementForm.notes
    }).subscribe({
      next: () => {
        this.checkoutSvc.confirmSettlement(checkoutId, settlementId).subscribe({
          next: (res) => {
            if (this.selectedCheckout) this.selectedCheckout.settlement = res.data;
            this.processingId = null;
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.errorMsg = err?.error?.message ?? 'Failed to confirm settlement';
            this.processingId = null;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to update settlement deduction';
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  completeSettlement() {
    if (!this.selectedCheckout || !this.selectedCheckout.settlement) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    const checkoutId = this.selectedCheckout.id;
    const settlementId = this.selectedCheckout.settlement.id;

    this.checkoutSvc.completeSettlement(checkoutId, settlementId, {
      payment_method: this.settlementForm.payment_method,
      notes: this.settlementForm.notes
    }).subscribe({
      next: (res) => {
        if (this.selectedCheckout) this.selectedCheckout.settlement = res.data;
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to complete settlement';
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  completeCheckout() {
    if (!this.selectedCheckout) return;
    this.processingId = this.selectedCheckout.id;
    this.errorMsg = '';
    this.checkoutSvc.completeCheckout(this.selectedCheckout.id).subscribe({
      next: (res) => {
        this.processingId = null;
        this.showProcessModal = false;
        this.loadData();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to complete checkout';
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  statusClass(status: CheckoutStatus): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'requested',
      'bg-blue-100 text-blue-800': status === 'confirmed',
      'bg-green-100 text-green-700': status === 'completed',
      'bg-red-100 text-red-700': status === 'cancelled',
    };
  }

  settlementClass(status: string): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'draft',
      'bg-blue-100 text-blue-800': status === 'confirmed',
      'bg-green-100 text-green-700': status === 'refunded' || status === 'paid',
      'bg-red-100 text-red-700': status === 'cancelled',
    };
  }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r =>
      (r.customer?.fullName ?? '').toLowerCase().includes(q) ||
      (r.customer?.email ?? '').toLowerCase().includes(q) ||
      (r.room?.roomNumber ?? '').toLowerCase().includes(q)
    );
  }

  get paginated() { return this.filtered; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.limit)); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.page > 1) { this.page--; this.loadData(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadData(); } }
}
