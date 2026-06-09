package vn.edu.hcmus.homestay.application.service.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.in.eligibility.CheckEligibilityUseCase.CheckEligibilityCommand;
import vn.edu.hcmus.homestay.application.port.out.eligibility.LoadEligibilityPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.eligibility.SaveEligibilityPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

@ExtendWith(MockitoExtension.class)
class LodgingEligibilityServiceTest {

    @Mock
    private LoadEligibilityPort loadEligibilityPort;

    @Mock
    private SaveEligibilityPort saveEligibilityPort;

    @Mock
    private LoadUserPort loadUserPort;

    private LodgingEligibilityService service;

    @BeforeEach
    void setUp() {
        service = new LodgingEligibilityService(loadEligibilityPort, saveEligibilityPort, loadUserPort);
    }

    // ── checkEligibility ──────────────────────────────────────────────────────

    @Test
    void checkEligibility_allPassed_eligible() {
        UUID customerId = UUID.randomUUID();
        UUID checkedBy = UUID.randomUUID();
        LodgingEligibility saved = eligibility(customerId, "eligible", List.of());
        when(saveEligibilityPort.save(any())).thenReturn(saved);

        LodgingEligibility result = service.checkEligibility(new CheckEligibilityCommand(
                customerId, checkedBy, true, true, true, null, null));

        assertThat(result.getDecision()).isEqualTo("eligible");
        assertThat(result.getReasons()).isEmpty();
    }

    @Test
    void checkEligibility_identityFailed_ineligible() {
        UUID customerId = UUID.randomUUID();
        UUID checkedBy = UUID.randomUUID();
        LodgingEligibility saved = eligibility(customerId, "ineligible", List.of("Identity not verified"));
        when(saveEligibilityPort.save(any())).thenReturn(saved);

        LodgingEligibility result = service.checkEligibility(new CheckEligibilityCommand(
                customerId, checkedBy, false, true, true, null, null));

        assertThat(result.getDecision()).isEqualTo("ineligible");
        assertThat(result.getReasons()).contains("Identity not verified");
    }

    @Test
    void checkEligibility_multipleFailures_reasonsIncludeAll() {
        UUID customerId = UUID.randomUUID();
        UUID checkedBy = UUID.randomUUID();
        List<String> reasons = List.of(
                "Identity not verified",
                "Documents incomplete",
                "Background check failed",
                "Health requirements not met");
        LodgingEligibility saved = eligibility(customerId, "ineligible", reasons);
        when(saveEligibilityPort.save(any())).thenReturn(saved);

        LodgingEligibility result = service.checkEligibility(new CheckEligibilityCommand(
                customerId, checkedBy, false, false, false, false, null));

        assertThat(result.getDecision()).isEqualTo("ineligible");
        assertThat(result.getReasons()).containsExactlyInAnyOrder(
                "Identity not verified",
                "Documents incomplete",
                "Background check failed",
                "Health requirements not met");
    }

    // ── getEligibility ────────────────────────────────────────────────────────

    @Test
    void getEligibility_found_returns() {
        UUID customerId = UUID.randomUUID();
        LodgingEligibility e = eligibility(customerId, "eligible", List.of());
        when(loadEligibilityPort.loadByCustomerId(customerId)).thenReturn(Optional.of(e));

        LodgingEligibility result = service.getEligibility(customerId);

        assertThat(result).isEqualTo(e);
    }

    @Test
    void getEligibility_notFound_throwsNotFoundException() {
        UUID customerId = UUID.randomUUID();
        when(loadEligibilityPort.loadByCustomerId(customerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEligibility(customerId))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private LodgingEligibility eligibility(UUID customerId, String decision, List<String> reasons) {
        return new LodgingEligibility(
                UUID.randomUUID(), customerId, UUID.randomUUID(),
                true, true, true, null,
                decision, reasons, null,
                Instant.now(), Instant.now(), Instant.now());
    }
}
