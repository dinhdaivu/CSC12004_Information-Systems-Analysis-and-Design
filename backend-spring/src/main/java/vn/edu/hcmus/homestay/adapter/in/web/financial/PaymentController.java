package vn.edu.hcmus.homestay.adapter.in.web.financial;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.financial.PaymentResponse;
import vn.edu.hcmus.homestay.application.port.in.financial.GetPaymentUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
public class PaymentController {

    private final GetPaymentUseCase getPaymentUseCase;

    public PaymentController(GetPaymentUseCase getPaymentUseCase) {
        this.getPaymentUseCase = getPaymentUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> data = getPaymentUseCase.getAllPayments().stream()
                .map(PaymentResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
