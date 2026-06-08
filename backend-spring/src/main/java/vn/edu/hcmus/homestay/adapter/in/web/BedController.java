package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.BedResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateBedRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UpdateBedRequest;
import vn.edu.hcmus.homestay.application.port.in.CreateBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.DeleteBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateBedUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;

@RestController
public class BedController {

    private final CreateBedUseCase createBedUseCase;
    private final GetBedUseCase getBedUseCase;
    private final UpdateBedUseCase updateBedUseCase;
    private final DeleteBedUseCase deleteBedUseCase;

    public BedController(
            CreateBedUseCase createBedUseCase,
            GetBedUseCase getBedUseCase,
            UpdateBedUseCase updateBedUseCase,
            DeleteBedUseCase deleteBedUseCase) {
        this.createBedUseCase = createBedUseCase;
        this.getBedUseCase = getBedUseCase;
        this.updateBedUseCase = updateBedUseCase;
        this.deleteBedUseCase = deleteBedUseCase;
    }

    @PostMapping("/api/rooms/{roomId}/beds")
    public ResponseEntity<ApiResponse<BedResponse>> createBed(
            @PathVariable UUID roomId, @Valid @RequestBody CreateBedRequest req) {
        BedResponse data = BedResponse.from(
                createBedUseCase.createBed(
                        roomId,
                        new CreateBedUseCase.CreateBedCommand(
                                req.getBedNumber(), req.getPricePerMonth())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @GetMapping("/api/beds/{id}")
    public ResponseEntity<ApiResponse<BedResponse>> getBed(@PathVariable UUID id) {
        BedResponse data = BedResponse.from(getBedUseCase.getBed(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/api/beds/{id}")
    public ResponseEntity<ApiResponse<BedResponse>> updateBed(
            @PathVariable UUID id, @Valid @RequestBody UpdateBedRequest req) {
        BedStatus bedStatus =
                req.getStatus() != null ? BedStatus.valueOf(req.getStatus().toUpperCase()) : null;
        BedResponse data = BedResponse.from(
                updateBedUseCase.updateBed(
                        id,
                        new UpdateBedUseCase.UpdateBedCommand(
                                req.getBedNumber(), req.getPricePerMonth(), bedStatus)));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @DeleteMapping("/api/beds/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBed(@PathVariable UUID id) {
        deleteBedUseCase.deleteBed(id);
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Bed deleted successfully"));
    }
}
