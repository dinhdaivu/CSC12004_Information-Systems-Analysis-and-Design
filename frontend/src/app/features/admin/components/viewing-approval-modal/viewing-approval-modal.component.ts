import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from "@angular/core";
import {
  ViewingAppointmentsService,
  type ViewingAppointmentRecord,
} from "@core/services/viewing-appointments.service";

export type ViewingApprovalModalAppointment = {
  id: string;
  date: string;
  time: string;
  location: string;
  roomInterest: string;
  customerName: string;
};

@Component({
  selector: "app-viewing-approval-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out"
      [class.opacity-100]="animateIn"
      [class.opacity-0]="!animateIn"
      (click)="onBackdropClick()"
      role="dialog"
      aria-modal="true"
      aria-label="Viewing approval modal"
    >
      <div
        class="w-full max-w-[500px] rounded-[24px] bg-[#FFFFFF] px-8 py-6 shadow-xl transition duration-200 ease-out"
        [class.scale-100]="animateIn"
        [class.scale-95]="!animateIn"
        (click)="$event.stopPropagation()"
      >
        <h2
          class="text-[26px] font-extrabold uppercase tracking-wide text-[#264893]"
        >
          Viewing Approval
        </h2>

        <p class="mt-2 text-sm text-[#264893]/80">
          Request from client: {{ appointment.customerName }}
        </p>

        <div
          class="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-[#264893]"
        >
          <p class="text-xs font-bold uppercase tracking-wide">Date</p>
          <p class="text-sm font-medium">{{ appointment.date }}</p>

          <p class="text-xs font-bold uppercase tracking-wide">Time</p>
          <p class="text-sm font-medium">{{ appointment.time }}</p>

          <p class="text-xs font-bold uppercase tracking-wide">Location</p>
          <p class="text-sm font-medium">{{ appointment.location }}</p>

          <p class="text-xs font-bold uppercase tracking-wide">Room Interest</p>
          <p class="text-sm font-medium">{{ appointment.roomInterest }}</p>
        </div>

        <div class="mt-5">
          <label
            for="result-note"
            class="text-xs font-bold uppercase tracking-wide text-[#264893]"
          >
            Result Note
          </label>
          <textarea
            id="result-note"
            class="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-[#F6F6F6] px-3 py-2 text-sm text-[#264893] outline-none transition focus:border-[#264893]"
            rows="3"
            [value]="resultNote"
            (input)="onResultNoteChange($event)"
            placeholder="Enter note for this decision"
          ></textarea>
        </div>

        <div class="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            class="rounded-full border-2 border-[#264893] bg-transparent px-6 py-2 text-sm font-semibold text-[#264893] transition hover:bg-[#eaf2ff]"
            [disabled]="isSubmitting"
            [class.cursor-not-allowed]="isSubmitting"
            [class.opacity-70]="isSubmitting"
            (click)="onReject()"
          >
            {{ isSubmitting ? "Processing..." : "Decline" }}
          </button>

          <button
            type="button"
            class="rounded-full bg-[#264893] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#1f3c79]"
            [disabled]="isSubmitting"
            [class.cursor-not-allowed]="isSubmitting"
            [class.opacity-70]="isSubmitting"
            (click)="onApprove()"
          >
            {{ isSubmitting ? "Processing..." : "Approve" }}
          </button>
        </div>

        <p *ngIf="errorMessage" class="mt-3 text-center text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  `,
})
export class ViewingApprovalModalComponent implements OnInit, OnDestroy {
  private readonly viewingAppointmentsService = inject(
    ViewingAppointmentsService,
  );
  private readonly authToken = localStorage.getItem("auth_token") ?? "";

  @Input({ required: true }) appointment!: ViewingApprovalModalAppointment;

  @Output() approve = new EventEmitter<ViewingAppointmentRecord>();
  @Output() decline = new EventEmitter<ViewingAppointmentRecord>();
  @Output() close = new EventEmitter<void>();

  animateIn = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  resultNote = "";
  private readonly originalBodyOverflow = document.body.style.overflow;

  ngOnInit(): void {
    document.body.style.overflow = "hidden";
    queueMicrotask(() => {
      this.animateIn = true;
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.originalBodyOverflow;
  }

  @HostListener("document:keydown.escape")
  onEscKey(): void {
    if (this.isSubmitting) {
      return;
    }

    this.close.emit();
  }

  onBackdropClick(): void {
    if (this.isSubmitting) {
      return;
    }

    this.close.emit();
  }

  onResultNoteChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.resultNote = target?.value ?? "";
  }

  onApprove(): void {
    const note = this.resultNote.trim() || "Approved by staff";
    this.submitOutcome("scheduled", note);
  }

  onReject(): void {
    const note = this.resultNote.trim() || "Rejected by staff";
    this.submitOutcome("cancelled", note);
  }

  private submitOutcome(
    status: "scheduled" | "cancelled",
    resultNote: string,
  ): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.authToken) {
      this.errorMessage = "Missing auth token. Please sign in again.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.viewingAppointmentsService
      .updateOutcome({
        token: this.authToken,
        appointmentId: this.appointment.id,
        status,
        resultNote,
      })
      .subscribe({
        next: (updatedRecord) => {
          if (status === "scheduled") {
            this.approve.emit(updatedRecord);
          } else {
            this.decline.emit(updatedRecord);
          }

          this.close.emit();
          this.isSubmitting = false;
        },
        error: () => {
          this.errorMessage =
            "Failed to update appointment outcome. Please try again.";
          this.isSubmitting = false;
        },
      });
  }
}
