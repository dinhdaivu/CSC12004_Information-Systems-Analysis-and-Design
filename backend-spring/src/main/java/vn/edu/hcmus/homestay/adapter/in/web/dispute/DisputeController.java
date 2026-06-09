package vn.edu.hcmus.homestay.adapter.in.web.dispute;

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
import vn.edu.hcmus.homestay.adapter.in.web.dto.dispute.CreateDisputeRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.dispute.DisputeResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.dispute.ResolveDisputeRequest;
import vn.edu.hcmus.homestay.application.port.in.dispute.ListDisputesUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.GetDisputeUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.CreateDisputeUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.ResolveDisputeUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@RestController
@RequestMapping("/api/disputes")
@PreAuthorize("isAuthenticated()")
public class DisputeController {

    private final ListDisputesUseCase listDisputesUseCase;
    private final GetDisputeUseCase getDisputeUseCase;
    private final CreateDisputeUseCase createDisputeUseCase;
    private final ResolveDisputeUseCase resolveDisputeUseCase;

    public DisputeController(
            ListDisputesUseCase listDisputesUseCase,
            GetDisputeUseCase getDisputeUseCase,
            CreateDisputeUseCase createDisputeUseCase,
            ResolveDisputeUseCase resolveDisputeUseCase) {
        this.listDisputesUseCase = listDisputesUseCase;
        this.getDisputeUseCase = getDisputeUseCase;
        this.createDisputeUseCase = createDisputeUseCase;
        this.resolveDisputeUseCase = resolveDisputeUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DisputeResponse>>> listDisputes(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DisputeResponse> data = listDisputesUseCase
                .listDisputes(principal.getId(), isStaff(principal))
                .stream()
                .map(DisputeResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DisputeResponse>> getDispute(@PathVariable UUID id) {
        DisputeResponse data = DisputeResponse.from(getDisputeUseCase.getDispute(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DisputeResponse>> createDispute(
            @Valid @RequestBody CreateDisputeRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        DisputeResponse data = DisputeResponse.from(
                createDisputeUseCase.createDispute(
                        new CreateDisputeUseCase.CreateDisputeCommand(
                                principal.getId(),
                                req.getSettlementId(),
                                req.getCheckoutRequestId(),
                                req.getName(),
                                req.getBranch(),
                                req.getReason(),
                                req.getEvidenceUrl())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        DisputeResponse data = DisputeResponse.from(
                resolveDisputeUseCase.resolveDispute(
                        id,
                        new ResolveDisputeUseCase.ResolveDisputeCommand(
                                principal.getId(),
                                req.getStatus(),
                                req.getResolutionNote())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    private boolean isStaff(UserPrincipal p) {
        return p.getRole() != AppRole.CUSTOMER;
    }
}
