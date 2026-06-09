package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateHandoverRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.HandoverItemRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.HandoverResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.SignHandoverRequest;
import vn.edu.hcmus.homestay.application.port.in.CreateHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateHandoverUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

@RestController
@RequestMapping("/api/handovers")
@PreAuthorize("isAuthenticated()")
public class HandoverController {

    private final CreateHandoverUseCase createHandoverUseCase;
    private final GetHandoverUseCase getHandoverUseCase;
    private final UpdateHandoverUseCase updateHandoverUseCase;

    public HandoverController(
            CreateHandoverUseCase createHandoverUseCase,
            GetHandoverUseCase getHandoverUseCase,
            UpdateHandoverUseCase updateHandoverUseCase) {
        this.createHandoverUseCase = createHandoverUseCase;
        this.getHandoverUseCase = getHandoverUseCase;
        this.updateHandoverUseCase = updateHandoverUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HandoverResponse>>> listHandovers(
            @RequestParam(name = "contract_id", required = false) UUID contractId,
            @RequestParam(name = "customer_id", required = false) UUID customerId,
            @RequestParam(required = false) HandoverStatus status) {
        List<HandoverResponse> data = getHandoverUseCase
                .listHandovers(new GetHandoverUseCase.HandoverFilter(contractId, customerId, status))
                .stream()
                .map(h -> {
                    // Build minimal aggregate for list response
                    try {
                        return HandoverResponse.from(getHandoverUseCase.getHandover(h.getId()));
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(r -> r != null)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HandoverResponse>> getHandover(@PathVariable UUID id) {
        HandoverResponse data = HandoverResponse.from(getHandoverUseCase.getHandover(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SALE','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<HandoverResponse>> createHandover(
            @Valid @RequestBody CreateHandoverRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CreateHandoverUseCase.HandoverItemCommand> items =
                req.getItems() != null
                        ? req.getItems().stream()
                                .map(i -> new CreateHandoverUseCase.HandoverItemCommand(
                                        i.getItemName(), i.getItemCondition(), i.getNotes()))
                                .toList()
                        : List.of();

        HandoverResponse data = HandoverResponse.from(
                createHandoverUseCase.createHandover(
                        new CreateHandoverUseCase.CreateHandoverCommand(
                                req.getContractId(),
                                req.getManagerId(),
                                req.getCustomerId(),
                                req.getHandoverAt(),
                                req.getNotes(),
                                items)));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<HandoverResponse>> completeHandover(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        HandoverResponse data = HandoverResponse.from(
                updateHandoverUseCase.completeHandover(id, principal.getId()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<HandoverResponse>> cancelHandover(@PathVariable UUID id) {
        HandoverResponse data = HandoverResponse.from(updateHandoverUseCase.cancelHandover(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<HandoverResponse>> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody HandoverItemRequest req) {
        HandoverResponse data = HandoverResponse.from(
                updateHandoverUseCase.addHandoverItem(
                        id,
                        new CreateHandoverUseCase.HandoverItemCommand(
                                req.getItemName(), req.getItemCondition(), req.getNotes())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/sign")
    public ResponseEntity<ApiResponse<HandoverResponse>> signHandover(
            @PathVariable UUID id,
            @Valid @RequestBody SignHandoverRequest req) {
        HandoverResponse data = HandoverResponse.from(
                updateHandoverUseCase.signHandover(
                        id,
                        new UpdateHandoverUseCase.SignHandoverCommand(
                                req.getManagerSignatureUrl(),
                                req.getCustomerSignatureUrl())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
