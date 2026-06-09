package vn.edu.hcmus.homestay.adapter.in.web.property;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.ZoneResponse;
import vn.edu.hcmus.homestay.application.port.in.property.GetZoneUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final GetZoneUseCase getZoneUseCase;

    public ZoneController(GetZoneUseCase getZoneUseCase) {
        this.getZoneUseCase = getZoneUseCase;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ZoneResponse>> getZone(@PathVariable UUID id) {
        ZoneResponse data = ZoneResponse.from(getZoneUseCase.getZone(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
