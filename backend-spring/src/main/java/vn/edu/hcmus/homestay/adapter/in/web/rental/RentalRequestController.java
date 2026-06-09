package vn.edu.hcmus.homestay.adapter.in.web.rental;

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
import vn.edu.hcmus.homestay.adapter.in.web.dto.rental.CreateRentalRequestRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.rental.RentalRequestResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.rental.UpdateRentalRequestStatusRequest;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetRentalRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.UpdateRentalRequestStatusUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;

@RestController
@RequestMapping("/api/rental-requests")
@PreAuthorize("isAuthenticated()")
public class RentalRequestController {

    private final CreateRentalRequestUseCase createRentalRequestUseCase;
    private final GetRentalRequestUseCase getRentalRequestUseCase;
    private final UpdateRentalRequestStatusUseCase updateRentalRequestStatusUseCase;

    public RentalRequestController(
            CreateRentalRequestUseCase createRentalRequestUseCase,
            GetRentalRequestUseCase getRentalRequestUseCase,
            UpdateRentalRequestStatusUseCase updateRentalRequestStatusUseCase) {
        this.createRentalRequestUseCase = createRentalRequestUseCase;
        this.getRentalRequestUseCase = getRentalRequestUseCase;
        this.updateRentalRequestStatusUseCase = updateRentalRequestStatusUseCase;
    }

    // Declared BEFORE /{id} to avoid path collision with literal "my-requests"
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<RentalRequestResponse>>> getMyRentalRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RentalRequestResponse> data = getRentalRequestUseCase
                .getMyRentalRequests(principal.getId())
                .stream()
                .map(RentalRequestResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SALE','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<List<RentalRequestResponse>>> getAllRentalRequests() {
        List<RentalRequestResponse> data = getRentalRequestUseCase.getAllRentalRequests()
                .stream()
                .map(RentalRequestResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalRequestResponse>> getRentalRequest(
            @PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal.getRole() != vn.edu.hcmus.homestay.domain.model.user.AppRole.CUSTOMER;
        RentalRequestResponse data = RentalRequestResponse.from(
                getRentalRequestUseCase.getRentalRequest(id, principal.getId(), isStaff));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RentalRequestResponse>> createRentalRequest(
            @Valid @RequestBody CreateRentalRequestRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalRequestResponse data = RentalRequestResponse.from(
                createRentalRequestUseCase.createRentalRequest(
                        new CreateRentalRequestUseCase.CreateRentalRequestCommand(
                                principal.getId(),
                                req.getBranchId(),
                                req.getRoomId(),
                                req.getBedId(),
                                req.getPreferredRoomType(),
                                req.getBudgetMin(),
                                req.getBudgetMax(),
                                req.getPeopleCount(),
                                req.getNote())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RentalRequestResponse>> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody UpdateRentalRequestStatusRequest req) {
        RentalRequestResponse data = RentalRequestResponse.from(
                updateRentalRequestStatusUseCase.updateStatus(id, req.getStatus()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
