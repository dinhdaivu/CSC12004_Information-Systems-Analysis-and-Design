package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CheckEligibilityRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.LodgingEligibilityResponse;
import vn.edu.hcmus.homestay.application.port.in.CheckEligibilityUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/lodging-eligibility")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class LodgingEligibilityController {

    private final CheckEligibilityUseCase checkEligibilityUseCase;

    public LodgingEligibilityController(CheckEligibilityUseCase checkEligibilityUseCase) {
        this.checkEligibilityUseCase = checkEligibilityUseCase;
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<LodgingEligibilityResponse>> getEligibility(
            @PathVariable UUID customerId) {
        LodgingEligibilityResponse data =
                LodgingEligibilityResponse.from(checkEligibilityUseCase.getEligibility(customerId));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<LodgingEligibilityResponse>> checkEligibility(
            @Valid @RequestBody CheckEligibilityRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        LodgingEligibilityResponse data = LodgingEligibilityResponse.from(
                checkEligibilityUseCase.checkEligibility(
                        new CheckEligibilityUseCase.CheckEligibilityCommand(
                                req.getCustomerId(),
                                principal.getId(),
                                req.isIdentityVerified(),
                                req.isDocumentsComplete(),
                                req.isBackgroundCheckPassed(),
                                req.getHealthRequirementsMet(),
                                req.getNotes())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
