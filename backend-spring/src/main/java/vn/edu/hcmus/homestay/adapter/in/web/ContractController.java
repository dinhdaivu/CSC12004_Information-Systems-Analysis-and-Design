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
import vn.edu.hcmus.homestay.adapter.in.web.dto.ContractResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateContractRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.SignContractRequest;
import vn.edu.hcmus.homestay.application.port.in.CreateContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetContractUseCase;
import vn.edu.hcmus.homestay.application.port.in.SignContractUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@RestController
@RequestMapping("/api/contracts")
@PreAuthorize("isAuthenticated()")
public class ContractController {

    private final CreateContractUseCase createContractUseCase;
    private final GetContractUseCase getContractUseCase;
    private final SignContractUseCase signContractUseCase;

    public ContractController(
            CreateContractUseCase createContractUseCase,
            GetContractUseCase getContractUseCase,
            SignContractUseCase signContractUseCase) {
        this.createContractUseCase = createContractUseCase;
        this.getContractUseCase = getContractUseCase;
        this.signContractUseCase = signContractUseCase;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMyContracts(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ContractResponse> data = getContractUseCase.getMyContracts(principal.getId())
                .stream().map(ContractResponse::from).toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(name = "customer_id", required = false) UUID customerId) {
        List<ContractResponse> data = getContractUseCase
                .getAllContracts(new GetContractUseCase.ContractFilter(page, limit, status, customerId))
                .stream().map(ContractResponse::from).toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> getContract(@PathVariable UUID id) {
        ContractResponse data = ContractResponse.from(getContractUseCase.getContract(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(
            @Valid @RequestBody CreateContractRequest req) {
        ContractResponse data = ContractResponse.from(
                createContractUseCase.createContract(
                        new CreateContractUseCase.CreateContractCommand(
                                req.getCustomerId(),
                                req.getDepositRequestId(),
                                req.getRoomId(),
                                req.getBedId(),
                                req.getStartDate(),
                                req.getEndDate(),
                                req.getMonthlyPrice(),
                                req.getNotes())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}/sign")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> signContract(
            @PathVariable UUID id,
            @Valid @RequestBody SignContractRequest req) {
        ContractResponse data = ContractResponse.from(
                signContractUseCase.signContract(
                        id,
                        new SignContractUseCase.SignContractCommand(
                                req.getContractDocumentUrl(),
                                req.getNotes())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
