package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.in.web.dto.MyBookingResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.SubmitProofRequest;
import vn.edu.hcmus.homestay.application.port.in.GetMyBookingUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/my-booking")
@PreAuthorize("isAuthenticated()")
public class MyBookingController {

    private final GetMyBookingUseCase getMyBookingUseCase;

    public MyBookingController(GetMyBookingUseCase getMyBookingUseCase) {
        this.getMyBookingUseCase = getMyBookingUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MyBookingResponse>>> getMyBookings(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MyBookingResponse> data = getMyBookingUseCase
                .getMyBookings(principal.getId(), status)
                .stream()
                .map(MyBookingResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MyBookingResponse>> getMyBooking(
            @PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        MyBookingResponse data = MyBookingResponse.from(
                getMyBookingUseCase.getMyBooking(id, principal.getId()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}/check-availability")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAvailability(
            @PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        boolean available = getMyBookingUseCase.checkAvailability(id, principal.getId());
        return ResponseEntity.ok(ApiResponseBuilder.success(Map.of("isAvailable", available)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<MyBookingResponse>> cancelBooking(
            @PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        MyBookingResponse data = MyBookingResponse.from(
                getMyBookingUseCase.cancelBooking(id, principal.getId()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping("/{id}/submit-proof")
    public ResponseEntity<ApiResponse<MyBookingResponse>> submitProof(
            @PathVariable UUID id,
            @Valid @RequestBody SubmitProofRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        MyBookingResponse data = MyBookingResponse.from(
                getMyBookingUseCase.submitProof(id, principal.getId(), req.getProofImageUrl()));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
