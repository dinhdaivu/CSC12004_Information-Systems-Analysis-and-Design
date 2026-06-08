package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateViewingAppointmentRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.RecordOutcomeRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UpdateViewingAppointmentRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.ViewingAppointmentResponse;
import vn.edu.hcmus.homestay.application.port.in.CreateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateViewingAppointmentUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/viewing-appointments")
@PreAuthorize("hasAnyRole('SALE','MANAGER','ADMIN')")
public class ViewingAppointmentController {

    private final CreateViewingAppointmentUseCase createViewingAppointmentUseCase;
    private final GetViewingAppointmentUseCase getViewingAppointmentUseCase;
    private final UpdateViewingAppointmentUseCase updateViewingAppointmentUseCase;

    public ViewingAppointmentController(
            CreateViewingAppointmentUseCase createViewingAppointmentUseCase,
            GetViewingAppointmentUseCase getViewingAppointmentUseCase,
            UpdateViewingAppointmentUseCase updateViewingAppointmentUseCase) {
        this.createViewingAppointmentUseCase = createViewingAppointmentUseCase;
        this.getViewingAppointmentUseCase = getViewingAppointmentUseCase;
        this.updateViewingAppointmentUseCase = updateViewingAppointmentUseCase;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ViewingAppointmentResponse>> createViewingAppointment(
            @Valid @RequestBody CreateViewingAppointmentRequest req) {
        ViewingAppointmentResponse data = ViewingAppointmentResponse.from(
                createViewingAppointmentUseCase.createViewingAppointment(
                        new CreateViewingAppointmentUseCase.CreateViewingAppointmentCommand(
                                req.getRentalRequestId(),
                                req.getCustomerId(),
                                req.getSaleId(),
                                req.getRoomId(),
                                req.getBedId(),
                                req.getScheduledAt())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ViewingAppointmentResponse>>> getAllViewingAppointments() {
        List<ViewingAppointmentResponse> data = getViewingAppointmentUseCase.getAllViewingAppointments()
                .stream()
                .map(ViewingAppointmentResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ViewingAppointmentResponse>> getViewingAppointment(
            @PathVariable UUID id) {
        ViewingAppointmentResponse data = ViewingAppointmentResponse.from(
                getViewingAppointmentUseCase.getViewingAppointment(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ViewingAppointmentResponse>> cancelAppointment(
            @PathVariable UUID id) {
        ViewingAppointmentResponse data = ViewingAppointmentResponse.from(
                updateViewingAppointmentUseCase.cancelAppointment(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/outcome")
    public ResponseEntity<ApiResponse<ViewingAppointmentResponse>> recordOutcome(
            @PathVariable UUID id, @Valid @RequestBody RecordOutcomeRequest req) {
        ViewingAppointmentResponse data = ViewingAppointmentResponse.from(
                updateViewingAppointmentUseCase.recordOutcome(
                        id,
                        new UpdateViewingAppointmentUseCase.RecordOutcomeCommand(
                                req.getResultNote(), req.getStatus())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ViewingAppointmentResponse>> updateAppointment(
            @PathVariable UUID id, @Valid @RequestBody UpdateViewingAppointmentRequest req) {
        ViewingAppointmentResponse data = ViewingAppointmentResponse.from(
                updateViewingAppointmentUseCase.updateAppointment(
                        id,
                        new UpdateViewingAppointmentUseCase.UpdateAppointmentCommand(
                                req.getSaleId(), req.getRoomId(), req.getBedId(), req.getScheduledAt())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
