package vn.edu.hcmus.homestay.adapter.in.web.crosscutting;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.financial.DashboardResponse;
import vn.edu.hcmus.homestay.application.port.in.crosscutting.GetDashboardUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class AdminDashboardController {

    private final GetDashboardUseCase getDashboardUseCase;

    public AdminDashboardController(GetDashboardUseCase getDashboardUseCase) {
        this.getDashboardUseCase = getDashboardUseCase;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse data = DashboardResponse.from(getDashboardUseCase.getDashboard());
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
