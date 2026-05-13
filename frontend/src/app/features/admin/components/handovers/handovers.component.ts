import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HandoverService, HandoverDTO, HandoverStatus } from '@core/services/handover.service';
import { ContractsService, ContractListItem } from '@core/services/contracts.service';
import { DefaultHandoverItemService } from '@core/services/default-handover-item.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-handovers',
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
            Room Handovers
          </div>
          <div style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
            Manage room handover at check-in. Complete handover to mark room as occupied.
          </div>

          <div style="position: absolute; left: 540px; top: 450px; width: 1240px; height: 510px; overflow-y: auto; padding-right: 10px; font-family: 'Afacad', sans-serif;">
            
            <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search customer or contract..." class="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400" />
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
                    <button (click)="selectStatus('pending')" 
                      [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'pending', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'pending'}"
                      class="w-full px-4 py-2.5 text-left text-sm transition-colors">Pending</button>
                    <button (click)="selectStatus('completed')" 
                      [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'completed', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'completed'}"
                      class="w-full px-4 py-2.5 text-left text-sm transition-colors">Completed</button>
                    <button (click)="selectStatus('cancelled')" 
                      [ngClass]="{'bg-blue-50 text-[#264893] font-medium': statusFilter === 'cancelled', 'text-slate-600 hover:bg-slate-50': statusFilter !== 'cancelled'}"
                      class="w-full px-4 py-2.5 text-left text-sm transition-colors">Cancelled</button>
                  </div>
                </div>
              </div>
              <button (click)="openCreateModal()" class="rounded-xl bg-[#264893] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3570] transition-colors shadow-sm">
                + New Handover
              </button>
            </div>

            <!-- Table -->
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-[#264893] text-white">
                  <tr>
                    <th class="px-5 py-3 text-left font-semibold">Customer</th>
                    <th class="px-5 py-3 text-left font-semibold">Contract ID</th>
                    <th class="px-5 py-3 text-left font-semibold">Room & Bed</th>
                    <th class="px-5 py-3 text-left font-semibold">Handover Date</th>
                    <th class="px-5 py-3 text-left font-semibold">Status</th>
                    <th class="px-5 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="paginatedFiltered.length === 0">
                    <td colspan="6" class="px-5 py-12 text-center">
                      <div class="flex flex-col items-center justify-center text-slate-400">
                        <svg class="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p class="text-base font-medium text-slate-500">No handovers found</p>
                        <p class="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                  <tr *ngFor="let row of paginatedFiltered; let i = index" [class]="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'" class="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td class="px-5 py-3">
                      <div class="font-semibold text-[#264893]">{{ row.customer?.fullName || '—' }}</div>
                      <div class="text-xs text-slate-400">{{ row.customer?.email }}</div>
                    </td>
                    <td class="px-5 py-3 text-slate-500 font-mono text-xs">{{ row.contractId.slice(0, 8) }}…</td>
                    <td class="px-5 py-3 text-slate-600 font-medium">
                      {{ getRoomDisplay(row) }}
                    </td>
                    <td class="px-5 py-3 text-slate-600">{{ row.handoverAt | date:'MMM d, yyyy HH:mm' }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        <span *ngIf="row.status === 'pending'" class="relative flex h-2.5 w-2.5">
                          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                        </span>
                        <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(row.status)">
                          {{ row.status | titlecase }}
                        </span>
                      </div>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center justify-center gap-2">
                        <button *ngIf="row.status === 'pending'" (click)="openSignModal(row)" title="Attach Signatures" class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button *ngIf="row.status === 'pending'" (click)="promptComplete(row)" [disabled]="!(row.managerSignatureUrl && row.customerSignatureUrl)" [title]="!(row.managerSignatureUrl && row.customerSignatureUrl) ? 'Both signatures required first' : 'Complete Handover'" class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button *ngIf="row.status === 'pending'" (click)="promptCancel(row)" title="Cancel Handover" class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span *ngIf="row.status !== 'pending'" class="text-xs text-slate-400">—</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="mt-4 mb-8 flex items-center justify-between text-sm text-slate-500">
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <div class="flex gap-2">
                <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors">&lt;</button>
                <button *ngFor="let p of pageNumbers" (click)="goToPage(p)" [class]="p === currentPage ? 'bg-[#264893] text-white border-[#264893]' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'" class="rounded-lg border px-3 py-1.5 min-w-[36px] transition-colors">{{ p }}</button>
                <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors">&gt;</button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</div>
          </div>

          <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
        </div>
      </div>

      <!-- Create handover modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" style="font-family: 'Afacad', sans-serif">
        <div class="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl my-auto border border-[#264893]/10 flex flex-col max-h-[90vh]">
          <div class="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <h2 class="text-3xl font-bold text-[#264893]" style="font-family: 'Big Shoulders Text', sans-serif; letter-spacing: 0.5px;">New Handover</h2>
            <button (click)="showCreateModal = false; resetForm()" class="text-slate-400 hover:text-red-500 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Left Column: Details -->
              <div class="flex-1 flex flex-col gap-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">1</span>
                  <h3 class="font-bold text-slate-700 text-lg">Handover Details</h3>
                </div>
                
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-4">
                  <div>
                    <label class="mb-1 block text-sm font-semibold text-slate-600">Select Contract</label>
                    <select [(ngModel)]="newForm.contractId" (ngModelChange)="onContractSelect()" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] bg-white">
                      <option value="">-- Select a Contract --</option>
                      <option *ngFor="let c of availableContracts" [value]="c.id">
                        {{ c.customer?.fullName || 'Unknown' }} - Room {{ c.room?.roomNumber || c.roomId.slice(0,8) }}
                      </option>
                    </select>
                  </div>
                  
                  <div *ngIf="newForm.contractId">
                    <label class="mb-1 block text-sm font-semibold text-slate-600">Customer</label>
                    <div class="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2.5 text-sm text-slate-600 font-medium">
                      {{ selectedContractCustomerName }}
                    </div>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-semibold text-slate-600">Handover Date</label>
                    <input [(ngModel)]="newForm.handoverAt" type="datetime-local" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893]" />
                  </div>
                  
                  <div>
                    <label class="mb-1 block text-sm font-semibold text-slate-600">Notes</label>
                    <textarea [(ngModel)]="newForm.notes" rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#264893] resize-none" placeholder="Optional notes..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Right Column: Handover Items -->
              <div class="flex-1 flex flex-col gap-5">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#264893] text-xs font-bold text-white">2</span>
                    <h3 class="font-bold text-slate-700 text-lg">Handover Items</h3>
                  </div>
                  <button (click)="addHandoverItem()" class="text-xs font-bold text-white bg-[#264893] hover:bg-[#1a3570] flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Add Item
                  </button>
                </div>

                <div *ngIf="newForm.items.length === 0" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p class="text-sm text-slate-500 mb-2">No items added to handover.</p>
                  <button (click)="addHandoverItem()" class="text-xs font-medium text-[#264893] hover:underline">Click here to add items (e.g. Keys, AC Remote)</button>
                </div>

                <div class="flex flex-col gap-3">
                  <div *ngFor="let item of newForm.items; let i = index" class="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm group hover:border-[#264893]/30 transition-colors">
                    <button (click)="removeHandoverItem(i)" class="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-10">
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <div class="flex flex-col gap-3">
                      <div class="flex flex-wrap md:flex-nowrap gap-3">
                        <div class="flex-1 min-w-[200px]">
                          <label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Item Name</label>
                          <input [(ngModel)]="item.itemName" placeholder="e.g. Room Keys" class="w-full text-sm font-semibold text-slate-700 border-b-2 border-slate-100 px-1 py-1 outline-none focus:border-[#264893] bg-transparent transition-colors" />
                        </div>
                        <div class="w-full md:w-32 shrink-0">
                          <label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Condition</label>
                          <select [(ngModel)]="item.itemCondition" class="w-full text-sm font-medium text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#264893] bg-slate-50 transition-colors">
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Missing">Missing</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <input [(ngModel)]="item.notes" placeholder="Additional notes or description (optional)" class="w-full text-xs text-slate-500 border border-slate-100 rounded-lg px-2 py-2 outline-none focus:border-[#264893] focus:bg-white bg-slate-50 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button (click)="showCreateModal = false; resetForm()" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button (click)="createHandover()" [disabled]="creating || !newForm.contractId" class="rounded-xl bg-[#264893] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50 transition-colors shadow-sm">{{ creating ? 'Creating…' : 'Create Handover' }}</button>
          </div>
          <div *ngIf="createError" class="mt-3 text-sm text-center text-red-600 font-medium">{{ createError }}</div>
        </div>
      </div>

      <!-- Custom Confirm Modal -->
      <div *ngIf="confirmAction" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transform transition-all">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full" [ngClass]="confirmAction.type === 'complete' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
              <svg *ngIf="confirmAction.type === 'complete'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg *ngIf="confirmAction.type === 'cancel'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-[#264893]">
              {{ confirmAction.type === 'complete' ? 'Complete Handover' : 'Cancel Handover' }}
            </h3>
          </div>
          <div class="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-sm text-slate-600 mb-2 flex justify-between">
              <span class="font-medium">Customer:</span>
              <span class="font-bold text-[#264893]">{{ confirmAction.row.customer?.fullName || 'Unknown' }}</span>
            </p>
            <p class="text-sm text-slate-600 mb-2 flex justify-between">
              <span class="font-medium">Room:</span>
              <span class="font-bold text-[#264893]">{{ getRoomDisplay(confirmAction.row) }}</span>
            </p>
            <p class="text-sm text-slate-600 flex justify-between">
              <span class="font-medium">Date:</span>
              <span class="font-bold text-[#264893]">{{ confirmAction.row.handoverAt | date:'MMM d, yyyy HH:mm' }}</span>
            </p>
          </div>
          <p class="text-sm text-slate-500 mb-6 px-1">
            {{ confirmAction.type === 'complete'
              ? 'This will mark the room as occupied by this customer and cannot be undone.'
              : 'This handover will be cancelled. The room will remain unoccupied.' }}
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="confirmAction = null" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Go back
            </button>
            <button (click)="executeConfirmedAction()" 
              [class]="confirmAction.type === 'complete' ? 'bg-[#264893] hover:bg-[#1a3570]' : 'bg-red-600 hover:bg-red-700'"
              class="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
              Confirm
            </button>
          </div>
        </div>
      </div>

      <!-- Signature modal (UC3 §3.1.3) -->
      <div *ngIf="signTarget" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" style="font-family: 'Afacad', sans-serif">
          <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-2xl font-bold text-[#264893]">Handover Signatures</h2>
            <button (click)="closeSignModal()" class="text-slate-400 hover:text-red-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p class="mb-4 text-sm text-slate-500">Both the manager and the customer must sign the handover minutes before the handover can be completed.</p>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Manager signature URL</label>
              <input type="text" [(ngModel)]="signForm.managerSignatureUrl" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893]" placeholder="Paste signature image URL" />
              <p *ngIf="signTarget.managerSignatureUrl" class="mt-1 text-xs text-green-700">Already signed at {{ signTarget.signedAt | date:'short' }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Customer signature URL</label>
              <input type="text" [(ngModel)]="signForm.customerSignatureUrl" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#264893]" placeholder="Paste signature image URL" />
              <p *ngIf="signTarget.customerSignatureUrl" class="mt-1 text-xs text-green-700">Already signed</p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button (click)="closeSignModal()" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button (click)="submitSignatures()" [disabled]="actionId === signTarget.id" class="rounded-lg bg-[#264893] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3570] disabled:opacity-50">
              {{ actionId === signTarget.id ? 'Saving…' : 'Save Signatures' }}
            </button>
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

        <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/HandoverUnion.png" />
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

        <div (click)="navigate('/admin/checkout-requests')" class="hover-effect" style="cursor: pointer; width: 200px; height: 46px; left: 163px; top: 680px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Checkouts
        </div>
        <img (click)="navigate('/admin/checkout-requests')" class="hover-effect" src="assets/icons/Checkout.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 690px; position: absolute;" />

        <div (click)="navigate('/admin/handovers')" class="hover-effect" style="cursor: pointer; width: 175px; height: 46px; left: 166px; top: 740px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Afacad; font-weight: 500; word-wrap: break-word">
          Handovers
        </div>
        <img (click)="navigate('/admin/handovers')" class="hover-effect" src="assets/icons/BlueHandover.png" style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 750px; position: absolute;" />

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
export class HandoversComponent implements OnInit, OnDestroy {
  private readonly handoverSvc = inject(HandoverService);
  private readonly contractsSvc = inject(ContractsService);
  private readonly defaultItemSvc = inject(DefaultHandoverItemService);
  private readonly authSvc = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  // layout / ui helpers (match other admin screens)
  scaleFactor = typeof window !== 'undefined' ? window.innerWidth / 1920 : 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;

  isLoading = false;
  actionId: string | null = null;
  errorMsg = '';
  searchTerm = '';
  statusFilter: HandoverStatus | '' = '';
  isStatusDropdownOpen = false;

  selectStatus(status: HandoverStatus | '') {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onFilterChange();
  }
  showCreateModal = false;
  creating = false;
  createError = '';

  newForm = { 
    contractId: '', 
    customerId: '', 
    handoverAt: '', 
    notes: '',
    items: [] as { itemName: string; itemCondition: string; notes: string }[]
  };

  addHandoverItem() {
    this.newForm.items.push({ itemName: '', itemCondition: 'Good', notes: '' });
  }

  removeHandoverItem(index: number) {
    this.newForm.items.splice(index, 1);
  }

  private rows: HandoverDTO[] = [];
  
  // Custom Confirm Modal State
  confirmAction: { type: 'complete' | 'cancel'; row: HandoverDTO } | null = null;

  // Pagination State
  currentPage = 1;
  readonly pageSize = 10;

  // Contracts Mapping
  availableContracts: ContractListItem[] = [];
  contractDetailsMap: Record<string, ContractListItem> = {};

  ngOnInit() { 
    this.loadData(); 
    this.loadContractsMap();
  }
  
  ngOnDestroy() { 
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.scaleFactor = window.innerWidth / 1920;
    }
  }

  private runInView(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
    });
  }

  toggleLangMenu() { this.isLangMenuOpen = !this.isLangMenuOpen; this.isUserMenuOpen = false; }
  toggleUserMenu() { this.isUserMenuOpen = !this.isUserMenuOpen; this.isLangMenuOpen = false; }
  changeLang(lang: string) { this.translate.use(lang); this.isLangMenuOpen = false; }
  navigate(path: string) { this.router.navigate([path]); this.isUserMenuOpen = false; }
  
  logout() {
    this.runInView(() => {
      this.authSvc.logout().subscribe({
        next: () => this.router.navigate(['/auth/login'])
      });
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();
    this.handoverSvc.list({ status: this.statusFilter || undefined })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { 
          this.rows = res.data; 
          this.isLoading = false; 
          this.cdr.markForCheck(); 
        },
        error: () => { 
          this.errorMsg = 'Failed to load handovers.'; 
          this.isLoading = false; 
          this.cdr.markForCheck(); 
        },
      });
  }

  loadContractsMap() {
    this.contractsSvc.listContracts({ limit: 500 }).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.availableContracts = res.data.data;
      res.data.data.forEach(c => {
        this.contractDetailsMap[c.id] = c;
      });
      this.cdr.markForCheck();
    });
  }

  onFilterChange() { 
    this.currentPage = 1;
    this.loadData(); 
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  openCreateModal() {
    this.showCreateModal = true;
    if (this.availableContracts.length === 0) {
      this.loadContractsMap();
    }
  }

  promptComplete(row: HandoverDTO) {
    this.confirmAction = { type: 'complete', row };
  }

  promptCancel(row: HandoverDTO) {
    this.confirmAction = { type: 'cancel', row };
  }

  // UC3 §3.1.3 — signature collection on handover minutes
  signTarget: HandoverDTO | null = null;
  signForm = { managerSignatureUrl: '', customerSignatureUrl: '' };

  openSignModal(row: HandoverDTO) {
    this.signTarget = row;
    this.signForm = {
      managerSignatureUrl: row.managerSignatureUrl ?? '',
      customerSignatureUrl: row.customerSignatureUrl ?? '',
    };
  }

  closeSignModal() {
    this.signTarget = null;
  }

  submitSignatures() {
    if (!this.signTarget) return;
    const body: { managerSignatureUrl?: string; customerSignatureUrl?: string } = {};
    if (this.signForm.managerSignatureUrl?.trim()) body.managerSignatureUrl = this.signForm.managerSignatureUrl.trim();
    if (this.signForm.customerSignatureUrl?.trim()) body.customerSignatureUrl = this.signForm.customerSignatureUrl.trim();
    if (!body.managerSignatureUrl && !body.customerSignatureUrl) {
      this.errorMsg = 'Provide at least one signature URL';
      return;
    }
    this.actionId = this.signTarget.id;
    this.errorMsg = '';
    this.handoverSvc.sign(this.signTarget.id, body).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.actionId = null;
        this.signTarget = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to attach signature';
        this.actionId = null;
        this.cdr.markForCheck();
      },
    });
  }

  executeConfirmedAction() {
    if (!this.confirmAction) return;
    const { type, row } = this.confirmAction;
    this.actionId = row.id;
    this.errorMsg = '';
    this.cdr.markForCheck();
    
    const obs = type === 'complete' ? this.handoverSvc.complete(row.id) : this.handoverSvc.cancel(row.id);
    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.actionId = null;
        this.confirmAction = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? `Failed to ${type}.`;
        this.actionId = null;
        this.confirmAction = null;
        this.cdr.markForCheck();
      }
    });
  }

  onContractSelect() {
    const c = this.contractDetailsMap[this.newForm.contractId];
    if (!c) {
      this.newForm.customerId = '';
      this.newForm.items = [];
      return;
    }
    this.newForm.customerId = c.customerId;

    // Fetch admin-editable defaults from the backend (default_handover_items table).
    // Falls back to an empty list if the call fails — manager can still add items manually.
    this.defaultItemSvc.resolve(c.room?.roomType ?? null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.newForm.items = res.data.map((d) => ({
            itemName: d.itemName,
            itemCondition: d.itemCondition,
            notes: d.notes ?? '',
          }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.newForm.items = [];
          this.cdr.markForCheck();
        },
      });
  }

  get selectedContractCustomerName() {
    const c = this.contractDetailsMap[this.newForm.contractId];
    return c?.customer?.fullName ?? 'Unknown Customer';
  }

  createHandover() {
    if (!this.newForm.contractId || !this.newForm.customerId) {
      this.createError = 'Contract ID and Customer ID are required.';
      this.cdr.markForCheck();
      return;
    }
    this.creating = true;
    this.createError = '';
    this.cdr.markForCheck();
    this.handoverSvc.create({
      contractId: this.newForm.contractId,
      customerId: this.newForm.customerId,
      handoverAt: this.newForm.handoverAt ? new Date(this.newForm.handoverAt).toISOString() : undefined,
      notes: this.newForm.notes || undefined,
      items: this.newForm.items.length > 0 ? this.newForm.items : undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.creating = false;
        this.showCreateModal = false;
        this.resetForm();
        this.cdr.markForCheck();
        this.loadData();
      },
      error: (err) => {
        this.createError = err?.error?.message ?? 'Failed to create handover.';
        this.creating = false;
        this.cdr.markForCheck();
      },
    });
  }

  resetForm() {
    this.newForm = { 
      contractId: '', 
      customerId: '', 
      handoverAt: '', 
      notes: '',
      items: []
    };
    this.createError = '';
  }

  statusClass(status: HandoverStatus): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'pending',
      'bg-green-100 text-green-700': status === 'completed',
      'bg-red-100 text-red-700': status === 'cancelled',
    };
  }

  getRoomDisplay(row: HandoverDTO): string {
    const c = this.contractDetailsMap[row.contractId];
    if (c && c.room?.roomNumber) {
      let str = `Room ${c.room.roomNumber}`;
      if (c.bed?.bedNumber) str += ` - Bed ${c.bed.bedNumber}`;
      return str;
    }
    return row.contract?.roomId ? `${row.contract.roomId.slice(0,8)}…` : '—';
  }

  get filtered() {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r =>
      (r.customer?.fullName ?? '').toLowerCase().includes(q) ||
      (r.customer?.email ?? '').toLowerCase().includes(q) ||
      r.contractId.toLowerCase().includes(q)
    );
  }

  get paginatedFiltered() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageNumbers() {
    const maxPages = Math.min(this.totalPages, 5);
    let startPage = Math.max(1, this.currentPage - 2);
    if (startPage + maxPages - 1 > this.totalPages) {
      startPage = Math.max(1, this.totalPages - maxPages + 1);
    }
    return Array.from({ length: maxPages }, (_, i) => startPage + i);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
    }
  }
}
