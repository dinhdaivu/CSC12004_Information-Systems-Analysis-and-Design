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
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CheckoutInspectionResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CheckoutRequestResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateCheckoutRequestRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateInspectionRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateSettlementRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.SettlementResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.SignSettlementRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UpdateDeductionRequest;
import vn.edu.hcmus.homestay.application.port.in.CreateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.ManageInspectionUseCase;
import vn.edu.hcmus.homestay.application.port.in.ManageSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/checkout-requests")
@PreAuthorize("isAuthenticated()")
public class CheckoutController {

    private final CreateCheckoutRequestUseCase createCheckoutRequestUseCase;
    private final GetCheckoutRequestUseCase getCheckoutRequestUseCase;
    private final UpdateCheckoutRequestUseCase updateCheckoutRequestUseCase;
    private final ManageSettlementUseCase manageSettlementUseCase;
    private final ManageInspectionUseCase manageInspectionUseCase;

    public CheckoutController(
            CreateCheckoutRequestUseCase createCheckoutRequestUseCase,
            GetCheckoutRequestUseCase getCheckoutRequestUseCase,
            UpdateCheckoutRequestUseCase updateCheckoutRequestUseCase,
            ManageSettlementUseCase manageSettlementUseCase,
            ManageInspectionUseCase manageInspectionUseCase) {
        this.createCheckoutRequestUseCase = createCheckoutRequestUseCase;
        this.getCheckoutRequestUseCase = getCheckoutRequestUseCase;
        this.updateCheckoutRequestUseCase = updateCheckoutRequestUseCase;
        this.manageSettlementUseCase = manageSettlementUseCase;
        this.manageInspectionUseCase = manageInspectionUseCase;
    }

    // ── /my must be declared before /{id} ────────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CheckoutRequestResponse>>> listMyCheckoutRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CheckoutRequestResponse> data = getCheckoutRequestUseCase
                .listMyCheckoutRequests(principal.getId())
                .stream()
                .map(CheckoutRequestResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<List<CheckoutRequestResponse>>> listCheckoutRequests() {
        List<CheckoutRequestResponse> data = getCheckoutRequestUseCase.listCheckoutRequests()
                .stream()
                .map(CheckoutRequestResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> getCheckoutRequest(
            @PathVariable UUID id) {
        CheckoutRequestResponse data = CheckoutRequestResponse.from(
                getCheckoutRequestUseCase.getCheckoutRequest(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> createCheckoutRequest(
            @Valid @RequestBody CreateCheckoutRequestRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        CheckoutRequestResponse data = CheckoutRequestResponse.from(
                createCheckoutRequestUseCase.createCheckoutRequest(
                        new CreateCheckoutRequestUseCase.CreateCheckoutRequestCommand(
                                req.getContractId(),
                                principal.getId(),
                                req.getRequestedCheckoutDate(),
                                req.getReason())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> confirmCheckout(@PathVariable UUID id) {
        CheckoutRequestResponse data = CheckoutRequestResponse.from(
                updateCheckoutRequestUseCase.confirmCheckout(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> cancelCheckout(@PathVariable UUID id) {
        CheckoutRequestResponse data = CheckoutRequestResponse.from(
                updateCheckoutRequestUseCase.cancelCheckout(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> completeCheckout(@PathVariable UUID id) {
        CheckoutRequestResponse data = CheckoutRequestResponse.from(
                updateCheckoutRequestUseCase.completeCheckout(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    // ── Settlement sub-resource ───────────────────────────────────────────────

    @GetMapping("/{id}/settlement")
    public ResponseEntity<ApiResponse<SettlementResponse>> getSettlement(@PathVariable UUID id) {
        SettlementResponse data = SettlementResponse.from(manageSettlementUseCase.getSettlement(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/{id}/settlement")
    @PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
    public ResponseEntity<ApiResponse<SettlementResponse>> createSettlement(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSettlementRequest req) {
        SettlementResponse data = SettlementResponse.from(
                manageSettlementUseCase.createSettlement(
                        id,
                        new ManageSettlementUseCase.CreateSettlementCommand(
                                req.getDepositRequestId(),
                                req.getDepositTotal(),
                                req.getDeduction(),
                                req.getPaymentMethod(),
                                req.getNotes())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/settlement/{settlementId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
    public ResponseEntity<ApiResponse<SettlementResponse>> updateDeduction(
            @PathVariable UUID id,
            @PathVariable UUID settlementId,
            @Valid @RequestBody UpdateDeductionRequest req) {
        SettlementResponse data = SettlementResponse.from(
                manageSettlementUseCase.updateDeduction(settlementId, req.getDeduction()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/settlement/{settlementId}/confirm")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<SettlementResponse>> confirmSettlement(
            @PathVariable UUID id,
            @PathVariable UUID settlementId) {
        SettlementResponse data = SettlementResponse.from(
                manageSettlementUseCase.confirmSettlement(settlementId));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/settlement/{settlementId}/complete")
    @PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
    public ResponseEntity<ApiResponse<SettlementResponse>> completeSettlement(
            @PathVariable UUID id,
            @PathVariable UUID settlementId) {
        SettlementResponse data = SettlementResponse.from(
                manageSettlementUseCase.completeSettlement(settlementId));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/settlement/{settlementId}/sign")
    public ResponseEntity<ApiResponse<SettlementResponse>> signSettlement(
            @PathVariable UUID id,
            @PathVariable UUID settlementId,
            @Valid @RequestBody SignSettlementRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal.getRole() != AppRole.CUSTOMER;
        SettlementResponse data = SettlementResponse.from(
                manageSettlementUseCase.signSettlement(
                        settlementId, req.getCustomerSignatureUrl(),
                        principal.getId(), isStaff));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    // ── Inspection sub-resource ───────────────────────────────────────────────

    @GetMapping("/{id}/inspection")
    public ResponseEntity<ApiResponse<CheckoutInspectionResponse>> getInspection(@PathVariable UUID id) {
        CheckoutInspectionResponse data = CheckoutInspectionResponse.from(
                manageInspectionUseCase.getInspection(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/{id}/inspection")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<CheckoutInspectionResponse>> createInspection(
            @PathVariable UUID id,
            @Valid @RequestBody CreateInspectionRequest req) {
        CheckoutInspectionResponse data = CheckoutInspectionResponse.from(
                manageInspectionUseCase.createInspection(
                        id,
                        new ManageInspectionUseCase.CreateInspectionCommand(
                                req.getManagerId(),
                                req.getCleanlinessNote(),
                                req.getOverallCondition(),
                                req.getNotes())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }
}
