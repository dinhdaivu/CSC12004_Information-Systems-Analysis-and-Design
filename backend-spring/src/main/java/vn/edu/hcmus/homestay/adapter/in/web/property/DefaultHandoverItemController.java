package vn.edu.hcmus.homestay.adapter.in.web.property;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.CreateDefaultHandoverItemRequest;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.DefaultHandoverItemResponse;
import vn.edu.hcmus.homestay.adapter.in.web.dto.property.UpdateDefaultHandoverItemRequest;
import vn.edu.hcmus.homestay.application.port.in.property.GetDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.ManageDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponse;
import vn.edu.hcmus.homestay.adapter.in.web.ApiResponseBuilder;

@RestController
@RequestMapping("/api/default-handover-items")
@PreAuthorize("isAuthenticated()")
public class DefaultHandoverItemController {

    private final GetDefaultHandoverItemUseCase getDefaultHandoverItemUseCase;
    private final ManageDefaultHandoverItemUseCase manageDefaultHandoverItemUseCase;

    public DefaultHandoverItemController(
            GetDefaultHandoverItemUseCase getDefaultHandoverItemUseCase,
            ManageDefaultHandoverItemUseCase manageDefaultHandoverItemUseCase) {
        this.getDefaultHandoverItemUseCase = getDefaultHandoverItemUseCase;
        this.manageDefaultHandoverItemUseCase = manageDefaultHandoverItemUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DefaultHandoverItemResponse>>> listAll() {
        List<DefaultHandoverItemResponse> data = getDefaultHandoverItemUseCase.listAll()
                .stream().map(DefaultHandoverItemResponse::from).toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @GetMapping("/resolve")
    public ResponseEntity<ApiResponse<List<DefaultHandoverItemResponse>>> resolve(
            @RequestParam(required = false) String roomType) {
        String effectiveRoomType = roomType != null ? roomType : "*";
        List<DefaultHandoverItemResponse> data = getDefaultHandoverItemUseCase.resolve(effectiveRoomType)
                .stream().map(DefaultHandoverItemResponse::from).toList();
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<DefaultHandoverItemResponse>> create(
            @Valid @RequestBody CreateDefaultHandoverItemRequest req) {
        DefaultHandoverItemResponse data = DefaultHandoverItemResponse.from(
                manageDefaultHandoverItemUseCase.create(
                        new ManageDefaultHandoverItemUseCase.CreateDefaultHandoverItemCommand(
                                req.getRoomTypeMatch(),
                                req.getItemName(),
                                req.getDefaultCondition(),
                                req.getSortOrder())));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseBuilder.success(data));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<DefaultHandoverItemResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDefaultHandoverItemRequest req) {
        DefaultHandoverItemResponse data = DefaultHandoverItemResponse.from(
                manageDefaultHandoverItemUseCase.update(
                        id,
                        new ManageDefaultHandoverItemUseCase.UpdateDefaultHandoverItemCommand(
                                req.getRoomTypeMatch(),
                                req.getItemName(),
                                req.getDefaultCondition(),
                                req.getSortOrder() != null ? req.getSortOrder() : 0,
                                req.getActive())));
        return ResponseEntity.ok(ApiResponseBuilder.success(data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALE','ACCOUNTANT','MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        manageDefaultHandoverItemUseCase.delete(id);
        return ResponseEntity.ok(ApiResponseBuilder.success(null));
    }
}
