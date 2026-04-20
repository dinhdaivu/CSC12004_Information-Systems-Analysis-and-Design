import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { BranchService } from "@core/services/branch.service";
import type { Branch } from "@shared/models/branch.model";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

type RoomVisualStatus = "occupied" | "reserved" | "available";

type MockRoomItem = {
  id: string;
  branchSlot: 0 | 1 | 2;
  floor: string;
  roomName: string;
  totalBeds: number;
  availableBeds: number;
  status: RoomVisualStatus;
};

@Component({
  selector: "app-rooms-management",
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 font-['Afacad'] text-[#264893]">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="ml-0 flex min-h-screen flex-col md:ml-64">
        <main class="flex-1 px-6 py-6">
          <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-3xl font-bold text-[#264893]">
                  Room Management
                </h2>
                <p class="mt-2 max-w-3xl text-sm text-[#264893]/80">
                  Visual overview of all beds and rooms across branches.
                </p>
              </div>

              <div class="relative">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#264893] transition hover:border-[#264893]"
                  (click)="toggleBranchDropdown()"
                >
                  {{ selectedBranchLabel }}
                  <span class="text-xs">{{
                    isBranchDropdownOpen ? "▲" : "▼"
                  }}</span>
                </button>

                <div
                  *ngIf="isBranchDropdownOpen"
                  class="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                >
                  <button
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#264893] transition hover:bg-slate-100"
                    (click)="selectBranch(null)"
                  >
                    All Branches
                  </button>

                  <button
                    *ngFor="let branch of branches"
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#264893] transition hover:bg-slate-100"
                    (click)="selectBranch(branch.id)"
                  >
                    {{ branch.name }}
                  </button>
                </div>
              </div>
            </div>

            <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
              <div>
                <div
                  *ngIf="visibleRooms.length === 0"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
                >
                  No mock rooms found for selected filters.
                </div>

                <div
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <button
                    *ngFor="let room of visibleRooms"
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-left text-sm font-semibold text-[#264893] shadow-sm transition hover:border-slate-300 hover:shadow"
                  >
                    <span class="flex min-w-0 items-center gap-2">
                      <span
                        class="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        [class]="statusDotClass(room.status)"
                      ></span>
                      <span class="truncate">{{ room.roomName }}</span>
                    </span>
                    <span class="mx-2 h-5 w-px bg-slate-300"></span>
                    <span class="whitespace-nowrap text-xs font-semibold">
                      {{ room.availableBeds }}/{{ room.totalBeds }}
                      {{ statusText(room.status) }}
                    </span>
                  </button>
                </div>
              </div>

              <aside class="rounded-2xl bg-[#fafafa] p-4 shadow-sm">
                <h3 class="text-center text-2xl font-bold text-[#264893]">
                  Floor
                </h3>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    [class.bg-[#264893]]="selectedFloor === null"
                    [class.text-white]="selectedFloor === null"
                    [class.bg-white]="selectedFloor !== null"
                    [class.text-[#264893]]="selectedFloor !== null"
                    (click)="selectFloor(null)"
                  >
                    All
                  </button>

                  <button
                    *ngFor="let floor of floors"
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    [class.bg-[#264893]]="selectedFloor === floor"
                    [class.text-white]="selectedFloor === floor"
                    [class.bg-white]="selectedFloor !== floor"
                    [class.text-[#264893]]="selectedFloor !== floor"
                    (click)="selectFloor(floor)"
                  >
                    {{ floor }}
                  </button>
                </div>

                <div class="mt-6 space-y-5 text-[#264893]">
                  <div class="rounded-xl bg-white p-3">
                    <div class="flex items-start gap-3">
                      <span class="mt-1 h-3 w-3 rounded-full bg-red-400"></span>
                      <div>
                        <p class="text-sm font-bold">Occupied</p>
                        <p class="mt-1 text-xs text-[#264893]/70">
                          All beds in this room are currently occupied
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-xl bg-white p-3">
                    <div class="flex items-start gap-3">
                      <span
                        class="mt-1 h-3 w-3 rounded-full bg-amber-400"
                      ></span>
                      <div>
                        <p class="text-sm font-bold">Reserved</p>
                        <p class="mt-1 text-xs text-[#264893]/70">
                          The remaining beds are currently on hold for a 24h
                          deposit
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-xl bg-white p-3">
                    <div class="flex items-start gap-3">
                      <span
                        class="mt-1 h-3 w-3 rounded-full bg-emerald-400"
                      ></span>
                      <div>
                        <p class="text-sm font-bold">Available</p>
                        <p class="mt-1 text-xs text-[#264893]/70">
                          The room has at least one vacant bed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class RoomsManagementComponent implements OnInit, OnDestroy {
  private readonly branchService = inject(BranchService);
  private readonly destroy$ = new Subject<void>();

  branches: Branch[] = [];
  isBranchDropdownOpen = false;
  selectedBranchId: string | null = null;
  selectedFloor: string | null = null;

  readonly mockRooms: MockRoomItem[] = [
    {
      id: "r-1",
      branchSlot: 0,
      floor: "F1",
      roomName: "A101",
      totalBeds: 2,
      availableBeds: 0,
      status: "occupied",
    },
    {
      id: "r-2",
      branchSlot: 0,
      floor: "F1",
      roomName: "A102",
      totalBeds: 2,
      availableBeds: 1,
      status: "available",
    },
    {
      id: "r-3",
      branchSlot: 0,
      floor: "F2",
      roomName: "A201",
      totalBeds: 4,
      availableBeds: 2,
      status: "reserved",
    },
    {
      id: "r-4",
      branchSlot: 1,
      floor: "F1",
      roomName: "B101",
      totalBeds: 2,
      availableBeds: 0,
      status: "occupied",
    },
    {
      id: "r-5",
      branchSlot: 1,
      floor: "F2",
      roomName: "B203",
      totalBeds: 3,
      availableBeds: 1,
      status: "available",
    },
    {
      id: "r-6",
      branchSlot: 1,
      floor: "F3",
      roomName: "B301",
      totalBeds: 4,
      availableBeds: 2,
      status: "reserved",
    },
    {
      id: "r-7",
      branchSlot: 2,
      floor: "F1",
      roomName: "C102",
      totalBeds: 2,
      availableBeds: 1,
      status: "available",
    },
    {
      id: "r-8",
      branchSlot: 2,
      floor: "F2",
      roomName: "C204",
      totalBeds: 4,
      availableBeds: 0,
      status: "occupied",
    },
    {
      id: "r-9",
      branchSlot: 2,
      floor: "F3",
      roomName: "C305",
      totalBeds: 3,
      availableBeds: 1,
      status: "reserved",
    },
  ];

  ngOnInit(): void {
    this.branchService
      .getBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe((branches) => {
        this.branches = branches.slice(0, 3);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedBranchLabel(): string {
    if (!this.selectedBranchId) {
      return "All Branches";
    }

    const selected = this.branches.find(
      (branch) => branch.id === this.selectedBranchId,
    );
    return selected?.name ?? "All Branches";
  }

  get floors(): string[] {
    const source = this.selectedBranchId
      ? this.mockRooms.filter(
          (room) => this.resolveRoomBranchId(room) === this.selectedBranchId,
        )
      : this.mockRooms;

    return [...new Set(source.map((room) => room.floor))];
  }

  get visibleRooms(): MockRoomItem[] {
    return this.mockRooms
      .filter((room) => {
        const passBranch = this.selectedBranchId
          ? this.resolveRoomBranchId(room) === this.selectedBranchId
          : true;
        const passFloor = this.selectedFloor
          ? room.floor === this.selectedFloor
          : true;

        return passBranch && passFloor;
      })
      .sort((a, b) => {
        const floorCompare =
          this.getFloorOrder(a.floor) - this.getFloorOrder(b.floor);
        if (floorCompare !== 0) {
          return floorCompare;
        }

        return a.roomName.localeCompare(b.roomName, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
  }

  private getFloorOrder(floor: string): number {
    const numericPart = Number.parseInt(floor.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(numericPart)) {
      return numericPart;
    }

    return Number.MAX_SAFE_INTEGER;
  }

  private resolveRoomBranchId(room: MockRoomItem): string | null {
    return this.branches[room.branchSlot]?.id ?? null;
  }

  toggleBranchDropdown(): void {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
  }

  selectBranch(branchId: string | null): void {
    this.selectedBranchId = branchId;
    this.selectedFloor = null;
    this.isBranchDropdownOpen = false;
  }

  selectFloor(floor: string | null): void {
    this.selectedFloor = floor;
  }

  statusDotClass(status: RoomVisualStatus): string {
    if (status === "occupied") {
      return "bg-red-400";
    }

    if (status === "reserved") {
      return "bg-amber-400";
    }

    return "bg-emerald-400";
  }

  statusText(status: RoomVisualStatus): string {
    if (status === "occupied") {
      return "Occupied";
    }

    if (status === "reserved") {
      return "Reserved";
    }

    return "Available";
  }
}
