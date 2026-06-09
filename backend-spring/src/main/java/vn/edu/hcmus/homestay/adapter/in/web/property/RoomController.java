package vn.edu.hcmus.homestay.adapter.in.web.property;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.BedResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.CreateRoomRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.RoomResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.UpdateRoomRequest;
import vn.edu.hcmus.homestay.application.port.in.property.CreateRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.DeleteRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.GetBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.GetRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.ListRoomsUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.UpdateRoomUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final ListRoomsUseCase listRoomsUseCase;
    private final GetRoomUseCase getRoomUseCase;
    private final CreateRoomUseCase createRoomUseCase;
    private final UpdateRoomUseCase updateRoomUseCase;
    private final DeleteRoomUseCase deleteRoomUseCase;
    private final GetBedUseCase getBedUseCase;

    public RoomController(
            ListRoomsUseCase listRoomsUseCase,
            GetRoomUseCase getRoomUseCase,
            CreateRoomUseCase createRoomUseCase,
            UpdateRoomUseCase updateRoomUseCase,
            DeleteRoomUseCase deleteRoomUseCase,
            GetBedUseCase getBedUseCase) {
        this.listRoomsUseCase = listRoomsUseCase;
        this.getRoomUseCase = getRoomUseCase;
        this.createRoomUseCase = createRoomUseCase;
        this.updateRoomUseCase = updateRoomUseCase;
        this.deleteRoomUseCase = deleteRoomUseCase;
        this.getBedUseCase = getBedUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> listRooms(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity) {
        RoomStatus roomStatus = status != null ? RoomStatus.valueOf(status.toUpperCase()) : null;
        ListRoomsUseCase.RoomFilter filter =
                new ListRoomsUseCase.RoomFilter(branchId, roomType, roomStatus, minCapacity);
        List<RoomResponse> data = listRoomsUseCase.listRooms(filter).stream()
                .map(RoomResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoom(@PathVariable UUID id) {
        RoomResponse data = RoomResponse.from(getRoomUseCase.getRoom(id));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/{id}/beds")
    public ResponseEntity<ApiResponse<List<BedResponse>>> listBedsByRoom(@PathVariable UUID id) {
        List<BedResponse> data = getBedUseCase.listBedsByRoom(id).stream()
                .map(BedResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody CreateRoomRequest req) {
        RoomResponse data = RoomResponse.from(
                createRoomUseCase.createRoom(new CreateRoomUseCase.CreateRoomCommand(
                        req.getBranchId(),
                        req.getRoomNumber(),
                        req.getRoomType(),
                        req.getMaxCapacity(),
                        req.getPricePerMonth(),
                        req.getAmenities())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable UUID id, @Valid @RequestBody UpdateRoomRequest req) {
        RoomStatus roomStatus =
                req.getStatus() != null ? RoomStatus.valueOf(req.getStatus().toUpperCase()) : null;
        RoomResponse data = RoomResponse.from(
                updateRoomUseCase.updateRoom(
                        id,
                        new UpdateRoomUseCase.UpdateRoomCommand(
                                req.getRoomNumber(),
                                req.getRoomType(),
                                req.getMaxCapacity(),
                                req.getPricePerMonth(),
                                req.getAmenities(),
                                roomStatus)));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable UUID id) {
        deleteRoomUseCase.deleteRoom(id);
        return ResponseEntity.ok(ApiResponseBuilder.success(null, "Room deleted successfully"));
    }
}
