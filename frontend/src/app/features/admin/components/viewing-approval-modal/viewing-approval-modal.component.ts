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
  styles: [`
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: #f6f6f6;
      border-radius: 25px;
      box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25);
    }
    .title-text {
      font-family: 'Big Shoulders Text', Impact, sans-serif;
      color: #264893;
      font-size: 44px;
      font-weight: 900;
      text-align: center;
    }
    .page-text {
      font-family: Afacad, Arial, sans-serif;
      color: #555;
      font-size: 22px;
      line-height: 1.5;
    }
    .label-text {
      font-family: Afacad, Arial, sans-serif;
      color: #264893;
      font-size: 22px;
      font-weight: 700;
    }
    .value-text {
      font-family: Afacad, Arial, sans-serif;
      color: #111;
      font-size: 22px;
      font-weight: 600;
    }
    .field {
      background: #d9d9d9;
      border: 0;
      border-radius: 8px;
      color: #111;
      font-family: Afacad, Arial, sans-serif;
      font-size: 18px;
      outline: none;
      padding: 10px 20px;
      box-sizing: border-box;
      resize: none;
      width: 100%;
    }
    .primary-btn {
      background: #264893;
      border: 0;
      border-radius: 40px;
      color: white;
      cursor: pointer;
      font-family: Afacad, Arial, sans-serif;
      font-size: 26px;
      font-weight: 700;
      height: 64px;
      padding: 0 42px;
      box-sizing: border-box;
      transition: all 0.2s ease-in-out;
    }
    .primary-btn:hover { opacity: 0.9; }
    .primary-btn:disabled { background: #8a96b8; cursor: not-allowed; opacity: 0.7; }

    .secondary-btn {
      background: transparent;
      border: 3px solid #264893;
      border-radius: 40px;
      color: #264893;
      cursor: pointer;
      font-family: Afacad, Arial, sans-serif;
      font-size: 24px;
      font-weight: 700;
      height: 64px;
      padding: 0 42px;
      box-sizing: border-box;
      transition: all 0.2s ease-in-out;
    }
    .secondary-btn:hover { opacity: 0.9; }
    .secondary-btn:disabled { border-color: #8a96b8; color: #8a96b8; cursor: not-allowed; opacity: 0.7; }
  `],
  template: `
    <div
      class="modal-backdrop transition-opacity duration-200 ease-out"
      [class.opacity-100]="animateIn"
      [class.opacity-0]="!animateIn"
      (click)="onBackdropClick()"
      role="dialog"
      aria-modal="true"
      aria-label="Viewing approval modal"
    >
      <div
        class="modal transition duration-200 ease-out"
        style="width: 620px; padding: 40px 60px; box-sizing: border-box; display: flex; flex-direction: column;"
        [class.scale-100]="animateIn"
        [class.scale-95]="!animateIn"
        (click)="$event.stopPropagation()"
      >
        <div class="title-text">VIEWING APPROVAL</div>

        <div class="page-text" style="text-align: center; margin-top: 10px;">
          Request from client: <span style="font-weight: 700; color: #264893;">{{ appointment.customerName }}</span>
        </div>

        <div style="display: grid; grid-template-columns: 180px 1fr; gap: 15px; margin-top: 30px;">
          <div class="label-text">Date:</div>
          <div class="value-text">{{ appointment.date }}</div>

          <div class="label-text">Time:</div>
          <div class="value-text">{{ appointment.time }}</div>

          <div class="label-text">Location:</div>
          <div class="value-text">{{ appointment.location }}</div>

          <div class="label-text">Room Interest:</div>
          <div class="value-text">{{ appointment.roomInterest }}</div>
        </div>

        <div style="margin-top: 30px; width: 100%;">
          <div class="label-text" style="margin-bottom: 10px;">Result Note</div>
          <textarea
            id="result-note"
            class="field"
            rows="3"
            [value]="resultNote"
            (input)="onResultNoteChange($event)"
            placeholder="Enter note for this decision"
          ></textarea>
        </div>

        <div style="display: flex; gap: 22px; justify-content: center; margin-top: 40px;">
          <button
            type="button"
            class="secondary-btn"
            style="min-width: 160px;"
            [disabled]="isSubmitting"
            (click)="onReject()"
          >
            {{ isSubmitting ? "Processing..." : "Decline" }}
          </button>

          <button
            type="button"
            class="primary-btn"
            style="min-width: 160px;"
            [disabled]="isSubmitting"
            (click)="onApprove()"
          >
            {{ isSubmitting ? "Processing..." : "Approve" }}
          </button>
        </div>

        <p *ngIf="errorMessage" style="margin-top: 15px; text-align: center; color: #D32F2F; font-family: Afacad, Arial, sans-serif; font-size: 18px; font-weight: 600;">
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
    window.queueMicrotask(() => {
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
