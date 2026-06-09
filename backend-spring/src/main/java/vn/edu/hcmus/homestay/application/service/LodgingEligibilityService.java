package vn.edu.hcmus.homestay.application.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.CheckEligibilityUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadEligibilityPort;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveEligibilityPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

@Service
public class LodgingEligibilityService implements CheckEligibilityUseCase {

    private final LoadEligibilityPort loadEligibilityPort;
    private final SaveEligibilityPort saveEligibilityPort;
    private final LoadUserPort loadUserPort;

    public LodgingEligibilityService(
            LoadEligibilityPort loadEligibilityPort,
            SaveEligibilityPort saveEligibilityPort,
            LoadUserPort loadUserPort) {
        this.loadEligibilityPort = loadEligibilityPort;
        this.saveEligibilityPort = saveEligibilityPort;
        this.loadUserPort = loadUserPort;
    }

    @Override
    @Transactional
    public LodgingEligibility checkEligibility(CheckEligibilityCommand command) {
        boolean eligible = command.identityVerified()
                && command.documentsComplete()
                && command.backgroundCheckPassed();

        List<String> reasons = new ArrayList<>();
        if (!command.identityVerified()) {
            reasons.add("Identity not verified");
        }
        if (!command.documentsComplete()) {
            reasons.add("Documents incomplete");
        }
        if (!command.backgroundCheckPassed()) {
            reasons.add("Background check failed");
        }
        if (command.healthRequirementsMet() != null && !command.healthRequirementsMet()) {
            reasons.add("Health requirements not met");
            eligible = false;
        }

        LodgingEligibility eligibility = new LodgingEligibility(
                null,
                command.customerId(),
                command.checkedBy(),
                command.identityVerified(),
                command.documentsComplete(),
                command.backgroundCheckPassed(),
                command.healthRequirementsMet(),
                eligible ? "eligible" : "ineligible",
                reasons,
                command.notes(),
                Instant.now(),
                null,
                null);

        return saveEligibilityPort.save(eligibility);
    }

    @Override
    public LodgingEligibility getEligibility(UUID customerId) {
        return loadEligibilityPort.loadByCustomerId(customerId)
                .orElseThrow(() -> new NotFoundException("Lodging eligibility not found for customer"));
    }
}
