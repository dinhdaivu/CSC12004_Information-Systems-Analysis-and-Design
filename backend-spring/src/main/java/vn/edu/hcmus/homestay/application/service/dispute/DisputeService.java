package vn.edu.hcmus.homestay.application.service.dispute;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.dispute.ListDisputesUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.GetDisputeUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.CreateDisputeUseCase;
import vn.edu.hcmus.homestay.application.port.in.dispute.ResolveDisputeUseCase;
import vn.edu.hcmus.homestay.application.port.out.dispute.LoadDisputePort;
import vn.edu.hcmus.homestay.application.port.out.dispute.SaveDisputePort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.dispute.Dispute;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

@Service
public class DisputeService implements ListDisputesUseCase, GetDisputeUseCase, CreateDisputeUseCase, ResolveDisputeUseCase {

    private final LoadDisputePort loadDisputePort;
    private final SaveDisputePort saveDisputePort;

    public DisputeService(LoadDisputePort loadDisputePort, SaveDisputePort saveDisputePort) {
        this.loadDisputePort = loadDisputePort;
        this.saveDisputePort = saveDisputePort;
    }

    @Override
    public List<Dispute> listDisputes(UUID callerCustomerId, boolean isStaff) {
        if (isStaff) {
            return loadDisputePort.loadAll();
        }
        return loadDisputePort.loadByCustomerId(callerCustomerId);
    }

    @Override
    public Dispute getDispute(UUID id) {
        return loadDisputePort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Dispute not found"));
    }

    @Override
    @Transactional
    public Dispute createDispute(CreateDisputeUseCase.CreateDisputeCommand cmd) {
        Dispute dispute = new Dispute(
                null,
                cmd.settlementId(),
                cmd.checkoutRequestId(),
                cmd.customerId(),
                cmd.name(),
                cmd.branch(),
                cmd.reason(),
                cmd.evidenceUrl(),
                DisputeStatus.PENDING,
                null,
                null,
                null,
                null,
                null);
        return saveDisputePort.save(dispute);
    }

    @Override
    @Transactional
    public Dispute resolveDispute(UUID id, ResolveDisputeUseCase.ResolveDisputeCommand cmd) {
        Dispute dispute = loadDisputePort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Dispute not found"));
        return saveDisputePort.save(
                dispute.withStatus(cmd.newStatus())
                        .withResolution(cmd.resolvedBy(), cmd.resolutionNote(), Instant.now()));
    }
}
