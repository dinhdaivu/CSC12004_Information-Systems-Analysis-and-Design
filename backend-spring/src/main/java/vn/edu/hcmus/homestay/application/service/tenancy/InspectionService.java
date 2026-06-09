package vn.edu.hcmus.homestay.application.service.tenancy;

import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.tenancy.GetInspectionUseCase;
import vn.edu.hcmus.homestay.application.port.in.tenancy.CreateInspectionUseCase;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadInspectionPort;
import vn.edu.hcmus.homestay.application.port.out.tenancy.SaveInspectionPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;
import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspectionStatus;

@Service
public class InspectionService implements GetInspectionUseCase, CreateInspectionUseCase {

    private final LoadInspectionPort loadInspectionPort;
    private final SaveInspectionPort saveInspectionPort;

    public InspectionService(LoadInspectionPort loadInspectionPort, SaveInspectionPort saveInspectionPort) {
        this.loadInspectionPort = loadInspectionPort;
        this.saveInspectionPort = saveInspectionPort;
    }

    @Override
    public CheckoutInspection getInspection(UUID checkoutRequestId) {
        return loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId)
                .orElseThrow(() -> new NotFoundException("Inspection not found"));
    }

    @Override
    @Transactional
    public CheckoutInspection createInspection(UUID checkoutRequestId, CreateInspectionUseCase.CreateInspectionCommand cmd) {
        if (loadInspectionPort.loadByCheckoutRequestId(checkoutRequestId).isPresent()) {
            throw new ConflictException("Inspection already exists for this checkout request");
        }

        CheckoutInspection inspection = new CheckoutInspection(
                null,
                checkoutRequestId,
                cmd.managerId(),
                Instant.now(),
                cmd.cleanlinessNote(),
                cmd.overallCondition(),
                CheckoutInspectionStatus.PENDING,
                cmd.notes(),
                null,
                null);

        return saveInspectionPort.save(inspection);
    }
}
