import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "@environments/environment";
import { BranchService } from "@core/services/branch.service";
import { AuthService } from "@core/services/auth.service";
import type { Branch } from "@shared/models/branch.model";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { Observable, Subject, forkJoin, from, of } from "rxjs";
import { catchError, map, switchMap, takeUntil, tap } from "rxjs/operators";

type RoomVisualStatus = "occupied" | "reserved" | "available";

type MockRoomItem = {
  id: string;
  branchId: string;
  floor: string;
  roomName: string;
  totalBeds: number;
  availableBeds: number;
  status: RoomVisualStatus;
};

type ApiRoomBed = {
  id?: string;
  bedNumber?: string;
  status?: string;
  ownerName?: string;
  customerName?: string;
  tenantName?: string;
  userName?: string;
};

type ApiRoomBranch = {
  id: string;
  name: string;
  address?: string;
};

type ApiRoom = {
  id: string;
  branchId: string;
  roomNumber: string;
  maxCapacity: number;
  status: string;
  roomType?: string;
  branch?: ApiRoomBranch;
  beds?: ApiRoomBed[];
};

type ApiRoomsResponse = {
  success: boolean;
  data?: ApiRoom[];
};

type ApiRoomDetailResponse = {
  success: boolean;
  data?: ApiRoom;
};

type RoomDetailBedItem = {
  id: string;
  bedNumber: string;
  status: RoomVisualStatus;
  ownerName: string;
};

type RoomDetailView = {
  id: string;
  roomNumber: string;
  branchName: string;
  zone: string;
  roomType: string;
  beds: RoomDetailBedItem[];
};

type PageView = "list" | "add-room";

type CreateRoomPayload = {
  branch_id: string;
  room_number: string;
  room_type: string;
  max_capacity: number;
  price_per_month: number;
  amenities: string[];
  images_url: string[];
  status?: string;
};

type CreateRoomForm = {
  branchId: string;
  roomNumber: string;
  maxCapacity: string;
  pricePerMonth: string;
  amenitiesText: string;
};

type UploadRoomImageResponse = {
  success: boolean;
  data?: {
    image_url?: string;
    public_id?: string;
  };
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

              <div class="flex flex-wrap items-center justify-end gap-3">
                <button
                  *ngIf="canCreateRoom"
                  type="button"
                  class="rounded-xl border border-[#264893] bg-white px-4 py-2 text-sm font-semibold text-[#264893] transition hover:bg-slate-50"
                  (click)="openAddRoomView()"
                >
                  Add Room
                </button>

                <label class="relative block">
                  <input
                    type="text"
                    [value]="searchKeyword"
                    (input)="onSearchInput($event)"
                    (keyup.enter)="searchRooms()"
                    placeholder="Search room name..."
                    class="w-64 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#264893] outline-none transition focus:border-[#264893]"
                  />
                </label>

                <button
                  type="button"
                  class="rounded-xl bg-[#264893] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f3a75]"
                  (click)="searchRooms()"
                >
                  Search
                </button>

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
            </div>

            <section
              *ngIf="currentView === 'list'"
              class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]"
            >
              <div>
                <div
                  *ngIf="visibleRooms.length === 0"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#264893]/80"
                >
                  No rooms found for selected filters.
                </div>

                <div
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <button
                    *ngFor="let room of visibleRooms"
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3.5 text-left text-sm font-semibold text-[#264893] shadow-sm transition hover:border-slate-300 hover:shadow"
                    [class.border-[#264893]]="selectedRoomId === room.id"
                    [class.border-slate-200]="selectedRoomId !== room.id"
                    (click)="selectRoom(room)"
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

            <section
              *ngIf="currentView === 'add-room'"
              class="mx-auto max-w-3xl"
            >
              <div class="mb-4">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#264893] transition hover:bg-slate-50"
                  (click)="backToRoomList()"
                >
                  Back
                </button>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 class="text-2xl font-bold text-[#264893]">Add New Room</h3>
                <p class="mt-1 text-sm text-[#264893]/80">
                  Fill out room information to create a new room.
                </p>

                <div
                  *ngIf="createRoomError"
                  class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {{ createRoomError }}
                </div>

                <div
                  *ngIf="createRoomSuccessMessage"
                  class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                >
                  {{ createRoomSuccessMessage }}
                </div>

                <form
                  class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
                  (submit)="createRoom($event)"
                >
                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Branch</span
                    >
                    <select
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none focus:border-[#264893]"
                      [value]="createRoomForm.branchId"
                      (change)="onCreateRoomBranchChange($event)"
                      required
                    >
                      <option value="" disabled>Select branch</option>
                      <option
                        *ngFor="let branch of branches"
                        [value]="branch.id"
                      >
                        {{ branch.name }}
                      </option>
                    </select>
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Room Number</span
                    >
                    <input
                      type="text"
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none focus:border-[#264893]"
                      placeholder="A001"
                      [value]="createRoomForm.roomNumber"
                      (input)="onCreateRoomInput('roomNumber', $event)"
                      required
                    />
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Max Capacity</span
                    >
                    <select
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none focus:border-[#264893]"
                      [value]="createRoomForm.maxCapacity"
                      (change)="onCreateRoomCapacityChange($event)"
                      required
                    >
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                    </select>
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Room Type (auto)</span
                    >
                    <input
                      type="text"
                      class="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-[#264893] outline-none"
                      [value]="derivedRoomType"
                      readonly
                    />
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Price Per Month (VND)</span
                    >
                    <input
                      type="number"
                      min="0"
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none focus:border-[#264893]"
                      placeholder="3500000"
                      [value]="createRoomForm.pricePerMonth"
                      (input)="onCreateRoomInput('pricePerMonth', $event)"
                      required
                    />
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-1">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Default Status</span
                    >
                    <input
                      type="text"
                      class="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-[#264893] outline-none"
                      value="available"
                      readonly
                    />
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-2">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Amenities (comma separated)</span
                    >
                    <input
                      type="text"
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none focus:border-[#264893]"
                      placeholder="air_conditioner, water_heater, wifi"
                      [value]="createRoomForm.amenitiesText"
                      (input)="onCreateRoomInput('amenitiesText', $event)"
                    />
                  </label>

                  <label class="flex flex-col gap-1 md:col-span-2">
                    <span class="text-sm font-semibold text-[#264893]"
                      >Room Images</span
                    >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#264893] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#264893] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                      (change)="onCreateRoomImagesSelected($event)"
                    />
                    <p
                      *ngIf="selectedImageNames.length > 0"
                      class="text-xs text-[#264893]/80"
                    >
                      Selected: {{ selectedImageNames.join(", ") }}
                    </p>
                  </label>

                  <div class="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      [disabled]="isCreatingRoom"
                      class="rounded-xl bg-[#264893] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f3a75] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {{ isCreatingRoom ? "Creating..." : "Create Room" }}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </main>

        <div
          *ngIf="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          (click)="closeModal()"
        >
          <div
            class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-4 flex items-center justify-between">
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xl font-bold text-[#264893] transition hover:bg-slate-100"
                (click)="closeModal()"
                aria-label="Close room detail modal"
              >
                &times;
              </button>
            </div>

            <div
              *ngIf="isRoomDetailLoading"
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-[#264893]/80"
            >
              Loading room detail...
            </div>

            <div
              *ngIf="!isRoomDetailLoading && roomDetailError"
              class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {{ roomDetailError }}
            </div>

            <div *ngIf="!isRoomDetailLoading && selectedRoomDetail as detail">
              <h4 class="text-2xl font-bold text-[#264893]">
                Room {{ detail.roomNumber }}
              </h4>
              <p class="mt-1 text-sm font-semibold text-[#264893]/85">
                {{ detail.branchName }} | zone: {{ detail.zone }} | type:
                {{ detail.roomType }}
              </p>

              <div class="mt-4 grid grid-cols-1 gap-2">
                <div
                  *ngFor="let bed of detail.beds"
                  class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      [class]="statusDotClass(bed.status)"
                    ></span>
                    <p class="truncate text-sm font-semibold text-[#264893]">
                      Bed {{ bed.bedNumber }} | {{ bed.ownerName }}
                    </p>
                  </div>

                  <span class="text-xs font-semibold text-[#264893]/80">
                    {{ statusText(bed.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div
              *ngIf="
                !isRoomDetailLoading && !roomDetailError && !selectedRoomDetail
              "
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-[#264893]/80"
            >
              Select a room to view detail.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RoomsManagementComponent implements OnInit, OnDestroy {
  private readonly maxRoomImageSizeBytes = 5 * 1024 * 1024;
  private readonly http = inject(HttpClient);
  private readonly branchService = inject(BranchService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly roomsApiUrl = `${environment.apiUrl}/rooms`;
  private readonly destroy$ = new Subject<void>();
  private readonly searchTrigger$ = new Subject<void>();
  private readonly roomSelection$ = new Subject<string>();

  branches: Branch[] = [];
  isBranchDropdownOpen = false;
  selectedBranchId: string | null = null;
  selectedFloor: string | null = null;
  searchKeyword = "";
  selectedRoomId: string | null = null;
  isModalOpen = false;
  selectedRoomDetail: RoomDetailView | null = null;
  isRoomDetailLoading = false;
  roomDetailError: string | null = null;
  currentView: PageView = "list";
  isCreatingRoom = false;
  createRoomError: string | null = null;
  createRoomSuccessMessage: string | null = null;

  createRoomForm: CreateRoomForm = {
    branchId: "",
    roomNumber: "",
    maxCapacity: "2",
    pricePerMonth: "",
    amenitiesText: "",
  };
  selectedRoomImageFiles: File[] = [];
  selectedImageNames: string[] = [];

  rooms: MockRoomItem[] = [];

  ngOnInit(): void {
    this.setupRoomDetailStream();

    this.branchService
      .getBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe((branches) => {
        this.branches = branches.slice(0, 3);
        this.setupSearchStream();
        this.searchRooms();
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

  get canCreateRoom(): boolean {
    return this.authService.hasAnyRole(["manager", "admin"]);
  }

  get floors(): string[] {
    if (this.selectedBranchId) {
      const selectedSlot = this.branches.findIndex(
        (branch) => branch.id === this.selectedBranchId,
      );

      if (selectedSlot < 0) {
        return [];
      }

      return this.getFloorsByBranchSlot(selectedSlot);
    }

    return this.branches.flatMap((_, index) =>
      this.getFloorsByBranchSlot(index),
    );
  }

  get visibleRooms(): MockRoomItem[] {
    return this.rooms
      .filter((room) => {
        const passBranch = this.selectedBranchId
          ? room.branchId === this.selectedBranchId
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
    const matched = /^([A-Z])(\d+)$/.exec(floor.toUpperCase());
    if (matched) {
      const branchOrder = matched[1].charCodeAt(0) - 65;
      const floorOrder = Number.parseInt(matched[2], 10);
      return branchOrder * 100 + floorOrder;
    }

    const numericPart = Number.parseInt(floor.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(numericPart)) {
      return 10000 + numericPart;
    }

    return Number.MAX_SAFE_INTEGER;
  }

  private getFloorsByBranchSlot(branchSlot: number): string[] {
    if (branchSlot < 0) {
      return [];
    }

    const prefix = String.fromCharCode(65 + branchSlot);
    return [1, 2, 3, 4, 5].map((index) => `${prefix}${index}`);
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

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchKeyword = target.value;
  }

  searchRooms(): void {
    this.searchTrigger$.next();
  }

  openAddRoomView(): void {
    if (!this.canCreateRoom) {
      return;
    }

    this.currentView = "add-room";
    this.createRoomError = null;
    this.createRoomSuccessMessage = null;

    if (!this.createRoomForm.branchId && this.branches.length > 0) {
      this.createRoomForm.branchId = this.branches[0].id;
      this.createRoomForm.roomNumber = this.suggestNextRoomNumber(
        this.getBranchPrefix(this.branches[0].id),
      );
    }
  }

  backToRoomList(): void {
    this.currentView = "list";
    this.createRoomError = null;
    this.createRoomSuccessMessage = null;
  }

  onCreateRoomInput(field: keyof CreateRoomForm, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.createRoomForm[field] = target.value;
  }

  onCreateRoomBranchChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.createRoomForm.branchId = target.value;
    this.createRoomForm.roomNumber = this.suggestNextRoomNumber(
      this.getBranchPrefix(target.value),
    );
  }

  onCreateRoomCapacityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.createRoomForm.maxCapacity = target.value;
  }

  onCreateRoomImagesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);

    const oversizeFiles = files.filter(
      (file) => file.size > this.maxRoomImageSizeBytes,
    );

    if (oversizeFiles.length > 0) {
      const maxMb = Math.floor(this.maxRoomImageSizeBytes / (1024 * 1024));
      this.selectedRoomImageFiles = [];
      this.selectedImageNames = [];
      this.createRoomError = `Each image must be <= ${maxMb}MB. Oversized: ${oversizeFiles
        .map((file) => file.name)
        .join(", ")}`;
      target.value = "";
      return;
    }

    this.createRoomError = null;

    this.selectedRoomImageFiles = files;
    this.selectedImageNames = files.map((file) => file.name);
  }

  createRoom(event: Event): void {
    event.preventDefault();

    if (!this.canCreateRoom || this.isCreatingRoom) {
      return;
    }

    const payload = this.buildCreateRoomPayload();

    if (!payload) {
      return;
    }

    this.isCreatingRoom = true;
    this.createRoomError = null;
    this.createRoomSuccessMessage = null;

    this.uploadRoomImagesToCloudinary()
      .pipe(
        switchMap((uploadedImageUrls) =>
          this.http.post(this.roomsApiUrl, {
            ...payload,
            images_url: uploadedImageUrls,
          }),
        ),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCreatingRoom = false;
          this.createRoomSuccessMessage = "Room created successfully.";
          this.resetCreateRoomForm(payload.branch_id);
          this.currentView = "list";
          this.searchRooms();
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          const fallback = "Failed to create room. Please check input data.";
          const message =
            typeof error === "object" &&
            error !== null &&
            "error" in error &&
            typeof (error as { error?: { message?: string } }).error ===
              "object" &&
            (error as { error?: { message?: string } }).error?.message
              ? (error as { error?: { message?: string } }).error?.message
              : fallback;

          this.isCreatingRoom = false;
          this.createRoomError = message ?? fallback;
          this.cdr.markForCheck();
        },
      });
  }

  private uploadRoomImagesToCloudinary(): Observable<string[]> {
    if (this.selectedRoomImageFiles.length === 0) {
      return of([]);
    }

    const uploadRequests = this.selectedRoomImageFiles.map((file) =>
      from(this.readFileAsDataUrl(file)).pipe(
        switchMap((fileData) =>
          this.http.post<UploadRoomImageResponse>(
            `${this.roomsApiUrl}/upload-image`,
            {
              file_data: fileData,
              file_name: file.name,
            },
          ),
        ),
        map((response) => {
          const uploadedUrl = response.data?.image_url?.trim();

          if (!uploadedUrl) {
            throw new Error("Image upload response is missing image_url");
          }

          return uploadedUrl;
        }),
      ),
    );

    return forkJoin(uploadRequests);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read image file"));
          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read image file"));
      };

      reader.readAsDataURL(file);
    });
  }

  selectRoom(room: MockRoomItem): void {
    this.selectedRoomId = room.id;
    this.isModalOpen = true;
    this.selectedRoomDetail = null;
    this.roomDetailError = null;
    this.isRoomDetailLoading = true;
    this.cdr.markForCheck();
    this.fetchRoomDetail(room.id);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.markForCheck();
  }

  private setupRoomDetailStream(): void {
    this.roomSelection$
      .pipe(
        switchMap((roomId) =>
          this.loadRoomDetail(roomId).pipe(
            catchError(() =>
              of({
                detail: null,
                error: "Failed to load room detail.",
              }),
            ),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(({ detail, error }) => {
        this.selectedRoomDetail = detail;
        this.roomDetailError = error;
        this.isRoomDetailLoading = false;
        this.cdr.markForCheck();
      });
  }

  private setupSearchStream(): void {
    this.searchTrigger$
      .pipe(
        switchMap(() =>
          this.fetchRoomsFromApi(
            this.searchKeyword,
            this.selectedBranchId,
          ).pipe(catchError(() => of([]))),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((rooms) => {
        this.rooms = rooms;

        if (
          this.selectedRoomId &&
          !rooms.some((room) => room.id === this.selectedRoomId)
        ) {
          this.selectedRoomId = null;
          this.selectedRoomDetail = null;
        }
      });
  }

  private loadRoomDetail(
    roomId: string,
  ): Observable<{ detail: RoomDetailView | null; error: string | null }> {
    return of(roomId).pipe(
      switchMap((id) =>
        this.http.get<ApiRoomDetailResponse>(`${this.roomsApiUrl}/${id}`),
      ),
      map((response) => {
        const room = response?.data;
        if (!room) {
          return {
            detail: null,
            error: "Room detail not found.",
          };
        }

        return {
          detail: this.mapApiRoomDetail(room),
          error: null,
        };
      }),
      tap(() => {
        this.cdr.markForCheck();
      }),
    );
  }

  private fetchRoomDetail(roomId: string): void {
    this.roomSelection$.next(roomId);
  }

  private fetchRoomsFromApi(
    keyword: string,
    branchId: string | null,
  ): Observable<MockRoomItem[]> {
    let params = new HttpParams();

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      params = params.set("search", trimmedKeyword);
    }

    if (branchId) {
      params = params.set("branch_id", branchId);
    }

    return this.http.get<ApiRoomsResponse>(this.roomsApiUrl, { params }).pipe(
      map((response) => {
        const records = response.data ?? [];

        return records
          .map((room) => this.mapApiRoomToViewItem(room))
          .filter((room): room is MockRoomItem => room !== null);
      }),
    );
  }

  private mapApiRoomToViewItem(apiRoom: ApiRoom): MockRoomItem | null {
    const branchSlot = this.branches.findIndex(
      (branch) => branch.id === apiRoom.branchId,
    );

    if (branchSlot < 0) {
      return null;
    }

    const availableBeds = Array.isArray(apiRoom.beds)
      ? apiRoom.beds.filter(
          (bed) => (bed.status ?? "").toLowerCase() === "available",
        ).length
      : 0;

    const normalizedStatus = this.mapRoomStatus(apiRoom.status, availableBeds);
    const floor = this.mapRoomToHardcodedFloor(apiRoom.roomNumber, branchSlot);

    return {
      id: apiRoom.id,
      branchId: apiRoom.branchId,
      floor,
      roomName: apiRoom.roomNumber,
      totalBeds: apiRoom.maxCapacity,
      availableBeds:
        availableBeds > 0
          ? availableBeds
          : normalizedStatus === "available"
            ? apiRoom.maxCapacity
            : 0,
      status: normalizedStatus,
    };
  }

  private mapApiRoomDetail(apiRoom: ApiRoom): RoomDetailView {
    const branchSlot = this.branches.findIndex(
      (branch) => branch.id === apiRoom.branchId,
    );
    const zone = this.mapRoomToHardcodedFloor(
      apiRoom.roomNumber,
      branchSlot < 0 ? 0 : branchSlot,
    );

    const branchName =
      apiRoom.branch?.name ??
      this.branches.find((branch) => branch.id === apiRoom.branchId)?.name ??
      "Unknown branch";

    const roomType = apiRoom.roomType?.trim() || "N/A";
    const beds = (apiRoom.beds ?? []).map((bed, index) => {
      const bedNumber = bed.bedNumber ?? String(index + 1);
      const ownerName =
        bed.ownerName?.trim() ||
        bed.customerName?.trim() ||
        bed.tenantName?.trim() ||
        bed.userName?.trim() ||
        "Trống";

      return {
        id: bed.id ?? `${apiRoom.id}-${bedNumber}`,
        bedNumber,
        status: this.mapBedStatus(bed.status ?? "available"),
        ownerName,
      } satisfies RoomDetailBedItem;
    });

    return {
      id: apiRoom.id,
      roomNumber: apiRoom.roomNumber,
      branchName,
      zone,
      roomType,
      beds,
    };
  }

  private mapRoomStatus(
    status: string,
    availableBeds: number,
  ): RoomVisualStatus {
    const normalized = status.toLowerCase();

    if (normalized === "occupied") {
      return "occupied";
    }

    if (
      normalized === "holding" ||
      normalized === "reserved" ||
      normalized === "deposited"
    ) {
      return "reserved";
    }

    if (normalized === "available") {
      return availableBeds === 0 ? "occupied" : "available";
    }

    return availableBeds > 0 ? "available" : "occupied";
  }

  private mapBedStatus(status: string): RoomVisualStatus {
    const normalized = status.toLowerCase();

    if (normalized === "occupied") {
      return "occupied";
    }

    if (
      normalized === "holding" ||
      normalized === "reserved" ||
      normalized === "deposited"
    ) {
      return "reserved";
    }

    return "available";
  }

  private mapRoomToHardcodedFloor(
    roomNumber: string,
    branchSlot: number,
  ): string {
    const prefix = String.fromCharCode(65 + branchSlot);
    const matched = /\d/.exec(roomNumber);
    const floorNumber = matched
      ? Math.min(Math.max(Number.parseInt(matched[0], 10), 1), 5)
      : 1;

    return `${prefix}${floorNumber}`;
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

  private buildCreateRoomPayload(): CreateRoomPayload | null {
    const branchId = this.createRoomForm.branchId.trim();
    const roomNumber = this.createRoomForm.roomNumber.trim();
    const maxCapacity = Number.parseInt(this.createRoomForm.maxCapacity, 10);
    const pricePerMonth = Number.parseInt(
      this.createRoomForm.pricePerMonth,
      10,
    );
    const amenities = this.parseCommaSeparatedList(
      this.createRoomForm.amenitiesText,
    );
    const roomType = this.mapCapacityToRoomType(maxCapacity);

    if (!branchId || !roomNumber) {
      this.createRoomError = "Branch and room number are required.";
      return null;
    }

    if (!/^\w\d{3}$/.test(roomNumber)) {
      this.createRoomError =
        "Room number must follow format A001/B001/C001 (1 letter + 3 digits).";
      return null;
    }

    if (!roomType) {
      this.createRoomError = "Max capacity only supports 2, 4, 6, or 8.";
      return null;
    }

    if (Number.isNaN(pricePerMonth) || pricePerMonth < 0) {
      this.createRoomError =
        "Price per month must be a valid non-negative number.";
      return null;
    }

    return {
      branch_id: branchId,
      room_number: roomNumber,
      room_type: roomType,
      max_capacity: maxCapacity,
      price_per_month: pricePerMonth,
      amenities,
      images_url: [],
      status: "available",
    };
  }

  get derivedRoomType(): string {
    const maxCapacity = Number.parseInt(this.createRoomForm.maxCapacity, 10);
    return this.mapCapacityToRoomType(maxCapacity) ?? "N/A";
  }

  private mapCapacityToRoomType(maxCapacity: number): string | null {
    if (maxCapacity === 2) {
      return "twin";
    }

    if (maxCapacity === 4) {
      return "quad";
    }

    if (maxCapacity === 6) {
      return "hexa";
    }

    if (maxCapacity === 8) {
      return "octa";
    }

    return null;
  }

  private getBranchPrefix(branchId: string): string {
    const branch = this.branches.find((item) => item.id === branchId);
    const normalizedName = (branch?.name ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalizedName.includes("nguyen cuu van")) {
      return "A";
    }

    if (normalizedName.includes("tran nao")) {
      return "B";
    }

    return "C";
  }

  private suggestNextRoomNumber(prefix: string): string {
    const prefixUpper = prefix.toUpperCase();
    const regex = new RegExp(`^${prefixUpper}(\\d{3})$`);

    const usedNumbers = this.rooms
      .map((room) => regex.exec(room.roomName.toUpperCase()))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => Number.parseInt(match[1], 10));

    const nextNumber =
      (usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0) + 1;
    const serial = String(Math.min(nextNumber, 999)).padStart(3, "0");
    return `${prefixUpper}${serial}`;
  }

  private parseCommaSeparatedList(text: string): string[] {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private resetCreateRoomForm(branchId: string): void {
    this.createRoomForm = {
      branchId,
      roomNumber: this.suggestNextRoomNumber(this.getBranchPrefix(branchId)),
      maxCapacity: "2",
      pricePerMonth: "",
      amenitiesText: "",
    };
    this.selectedRoomImageFiles = [];
    this.selectedImageNames = [];
  }
}
