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
import vn.edu.hcmus.homestay.adapter.in.web.dto.ConfirmDepositRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateDepositRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.DepositResponse;
import vn.edu.hcmus.homestay.application.port.in.CancelDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.ConfirmDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.CreateDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetDepositUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/deposits")
@PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
public class DepositController {

    private final CreateDepositUseCase createDepositUseCase;
    private final GetDepositUseCase getDepositUseCase;
    private final ConfirmDepositUseCase confirmDepositUseCase;
    private final CancelDepositUseCase cancelDepositUseCase;

    public DepositController(
            CreateDepositUseCase createDepositUseCase,
            GetDepositUseCase getDepositUseCase,
            ConfirmDepositUseCase confirmDepositUseCase,
            CancelDepositUseCase cancelDepositUseCase) {
        this.createDepositUseCase = createDepositUseCase;
        this.getDepositUseCase = getDepositUseCase;
        this.confirmDepositUseCase = confirmDepositUseCase;
        this.cancelDepositUseCase = cancelDepositUseCase;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepositResponse>> createDeposit(
            @Valid @RequestBody CreateDepositRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        DepositResponse data = DepositResponse.from(
                createDepositUseCase.createDeposit(
                        new CreateDepositUseCase.CreateDepositCommand(
                                req.getRentalRequestId(),
                                principal.getId(),
                                req.getRoomId(),
                                req.getBedId(),
                                req.getAmount(),
                                req.getPaymentMethod(),
                                req.getNotes())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepositResponse>>> getAllDeposits() {
        List<DepositResponse> data = getDepositUseCase.getAllDeposits().stream()
                .map(DepositResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepositResponse>> getDeposit(@PathVariable UUID id) {
        DepositResponse data = DepositResponse.from(getDepositUseCase.getDeposit(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<DepositResponse>> confirmDeposit(
            @PathVariable UUID id, @Valid @RequestBody ConfirmDepositRequest req) {
        DepositResponse data = DepositResponse.from(
                confirmDepositUseCase.confirmDeposit(
                        id, new ConfirmDepositUseCase.ConfirmDepositCommand(req.getPaymentMethod())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<DepositResponse>> cancelDeposit(@PathVariable UUID id) {
        DepositResponse data = DepositResponse.from(cancelDepositUseCase.cancelDeposit(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
