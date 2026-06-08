package vn.edu.hcmus.homestay.adapter.in.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.BranchResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.CreateBranchRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.RoomResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.UpdateBranchRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.ZoneResponse;
import vn.edu.hcmus.homestay.application.port.in.CreateBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetZoneUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListBranchesUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListRoomsUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateBranchUseCase;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final ListBranchesUseCase listBranchesUseCase;
    private final GetBranchUseCase getBranchUseCase;
    private final CreateBranchUseCase createBranchUseCase;
    private final UpdateBranchUseCase updateBranchUseCase;
    private final GetZoneUseCase getZoneUseCase;
    private final ListRoomsUseCase listRoomsUseCase;

    public BranchController(
            ListBranchesUseCase listBranchesUseCase,
            GetBranchUseCase getBranchUseCase,
            CreateBranchUseCase createBranchUseCase,
            UpdateBranchUseCase updateBranchUseCase,
            GetZoneUseCase getZoneUseCase,
            ListRoomsUseCase listRoomsUseCase) {
        this.listBranchesUseCase = listBranchesUseCase;
        this.getBranchUseCase = getBranchUseCase;
        this.createBranchUseCase = createBranchUseCase;
        this.updateBranchUseCase = updateBranchUseCase;
        this.getZoneUseCase = getZoneUseCase;
        this.listRoomsUseCase = listRoomsUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BranchResponse>>> listBranches() {
        List<BranchResponse> data = listBranchesUseCase.listBranches().stream()
                .map(BranchResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchResponse>> getBranch(@PathVariable UUID id) {
        BranchResponse data = BranchResponse.from(getBranchUseCase.getBranch(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}/zones")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> listZonesByBranch(@PathVariable UUID id) {
        List<ZoneResponse> data = getZoneUseCase.listZonesByBranch(id).stream()
                .map(ZoneResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> listRoomsByBranch(@PathVariable UUID id) {
        List<RoomResponse> data = listRoomsUseCase.listRoomsByBranch(id).stream()
                .map(RoomResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BranchResponse>> createBranch(
            @Valid @RequestBody CreateBranchRequest req) {
        BranchResponse data = BranchResponse.from(
                createBranchUseCase.createBranch(new CreateBranchUseCase.CreateBranchCommand(
                        req.getName(),
                        req.getAddress(),
                        req.getPhone(),
                        req.getDescription(),
                        req.getHeroImageUrl(),
                        req.getManagerId())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchResponse>> updateBranch(
            @PathVariable UUID id, @Valid @RequestBody UpdateBranchRequest req) {
        BranchResponse data = BranchResponse.from(
                updateBranchUseCase.updateBranch(
                        id,
                        new UpdateBranchUseCase.UpdateBranchCommand(
                                req.getName(),
                                req.getAddress(),
                                req.getPhone(),
                                req.getDescription(),
                                req.getHeroImageUrl(),
                                req.getManagerId())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }
}
