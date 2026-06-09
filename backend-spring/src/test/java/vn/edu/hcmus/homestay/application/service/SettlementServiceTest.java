package vn.edu.hcmus.homestay.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.in.ManageSettlementUseCase.CreateSettlementCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadCheckoutRequestPort;
import vn.edu.hcmus.homestay.application.port.out.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.LoadSettlementPort;
import vn.edu.hcmus.homestay.application.port.out.SaveSettlementPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutStatus;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;
import vn.edu.hcmus.homestay.domain.model.settlement.SettlementStatus;

@ExtendWith(MockitoExtension.class)
class SettlementServiceTest {

    @Mock
    private LoadSettlementPort loadSettlementPort;

    @Mock
    private SaveSettlementPort saveSettlementPort;

    @Mock
    private LoadCheckoutRequestPort loadCheckoutRequestPort;

    @Mock
    private LoadContractPort loadContractPort;

    @Mock
    private RefundCalculator refundCalculator;

    private SettlementService settlementService;

    @BeforeEach
    void setUp() {
        settlementService = new SettlementService(
                loadSettlementPort, saveSettlementPort,
                loadCheckoutRequestPort, loadContractPort, refundCalculator);
    }

    @Test
    void createSettlement_active_under6months_50pct() {
        UUID checkoutRequestId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        CheckoutRequest checkoutRequest = checkoutRequest(checkoutRequestId, contractId);
        Contract contract = activeContract(contractId, LocalDate.now().minusMonths(3));

        when(loadCheckoutRequestPort.loadById(checkoutRequestId)).thenReturn(Optional.of(checkoutRequest));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(refundCalculator.calculateRefundRate(any(), any(), any())).thenReturn(new BigDecimal("0.5"));
        when(saveSettlementPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateSettlementCommand cmd = new CreateSettlementCommand(
                null, new BigDecimal("10000000"), BigDecimal.ZERO, null, null);

        Settlement result = settlementService.createSettlement(checkoutRequestId, cmd);

        assertThat(result.getRefundRate()).isEqualByComparingTo(new BigDecimal("0.5"));
        assertThat(result.getStatus()).isEqualTo(SettlementStatus.DRAFT);
    }

    @Test
    void createSettlement_completed_100pct() {
        UUID checkoutRequestId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        CheckoutRequest checkoutRequest = checkoutRequest(checkoutRequestId, contractId);
        Contract contract = completedContract(contractId);

        when(loadCheckoutRequestPort.loadById(checkoutRequestId)).thenReturn(Optional.of(checkoutRequest));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(refundCalculator.calculateRefundRate(any(), any(), any())).thenReturn(new BigDecimal("1.0"));
        when(saveSettlementPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateSettlementCommand cmd = new CreateSettlementCommand(
                null, new BigDecimal("5000000"), BigDecimal.ZERO, null, null);

        Settlement result = settlementService.createSettlement(checkoutRequestId, cmd);

        assertThat(result.getRefundRate()).isEqualByComparingTo(new BigDecimal("1.0"));
    }

    @Test
    void createSettlement_finalAmount_depositTotal_times_rate_minus_deduction() {
        UUID checkoutRequestId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        CheckoutRequest checkoutRequest = checkoutRequest(checkoutRequestId, contractId);
        Contract contract = activeContract(contractId, LocalDate.now().minusMonths(8));

        when(loadCheckoutRequestPort.loadById(checkoutRequestId)).thenReturn(Optional.of(checkoutRequest));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(refundCalculator.calculateRefundRate(any(), any(), any())).thenReturn(new BigDecimal("0.7"));
        when(saveSettlementPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // depositTotal=10_000_000, rate=0.7, deduction=500_000
        // finalAmount = 10_000_000 * 0.7 - 500_000 = 7_000_000 - 500_000 = 6_500_000
        CreateSettlementCommand cmd = new CreateSettlementCommand(
                null, new BigDecimal("10000000"), new BigDecimal("500000"), null, null);

        Settlement result = settlementService.createSettlement(checkoutRequestId, cmd);

        assertThat(result.getFinalAmount()).isEqualByComparingTo(new BigDecimal("6500000.0"));
    }

    @Test
    void updateDeduction_recomputesFinalAmount() {
        UUID settlementId = UUID.randomUUID();
        Settlement existing = settlement(settlementId, new BigDecimal("10000000"),
                new BigDecimal("0.7"), new BigDecimal("0"));

        when(loadSettlementPort.loadById(settlementId)).thenReturn(Optional.of(existing));
        when(saveSettlementPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // new deduction = 1_000_000; finalAmount = 10_000_000 * 0.7 - 1_000_000 = 6_000_000
        Settlement result = settlementService.updateDeduction(settlementId, new BigDecimal("1000000"));

        assertThat(result.getDeduction()).isEqualByComparingTo(new BigDecimal("1000000"));
        assertThat(result.getFinalAmount()).isEqualByComparingTo(new BigDecimal("6000000.0"));
    }

    @Test
    void signSettlement_setsUrlAndSignedAt() {
        UUID settlementId = UUID.randomUUID();
        UUID checkoutOwner = UUID.randomUUID();
        Settlement existing = settlement(settlementId, new BigDecimal("5000000"),
                new BigDecimal("1.0"), BigDecimal.ZERO);
        CheckoutRequest checkout = new CheckoutRequest(UUID.randomUUID(), UUID.randomUUID(), checkoutOwner,
                java.time.LocalDate.now(), null, CheckoutStatus.CONFIRMED, null, null);

        when(loadSettlementPort.loadById(settlementId)).thenReturn(Optional.of(existing));
        when(loadCheckoutRequestPort.loadById(any())).thenReturn(Optional.of(checkout));
        when(saveSettlementPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Settlement result = settlementService.signSettlement(settlementId, "https://example.com/sig.png", checkoutOwner, false);

        assertThat(result.getCustomerSignatureUrl()).isEqualTo("https://example.com/sig.png");
        assertThat(result.getSignedAt()).isNotNull();
    }

    @Test
    void getSettlement_notFound_throwsNotFoundException() {
        UUID checkoutRequestId = UUID.randomUUID();
        when(loadSettlementPort.loadByCheckoutRequestId(checkoutRequestId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> settlementService.getSettlement(checkoutRequestId))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CheckoutRequest checkoutRequest(UUID id, UUID contractId) {
        return new CheckoutRequest(
                id, contractId, UUID.randomUUID(), LocalDate.now().plusDays(7), null,
                CheckoutStatus.CONFIRMED, Instant.now(), Instant.now());
    }

    private Contract activeContract(UUID id, LocalDate startDate) {
        return new Contract(
                id, UUID.randomUUID(), null, UUID.randomUUID(), null,
                startDate, startDate.plusYears(1),
                new BigDecimal("3000000"), ContractStatus.ACTIVE, null, null,
                Instant.now(), Instant.now());
    }

    private Contract completedContract(UUID id) {
        return new Contract(
                id, UUID.randomUUID(), null, UUID.randomUUID(), null,
                LocalDate.now().minusYears(1), LocalDate.now().minusDays(1),
                new BigDecimal("3000000"), ContractStatus.COMPLETED, null, null,
                Instant.now(), Instant.now());
    }

    private Settlement settlement(UUID id, BigDecimal depositTotal, BigDecimal refundRate, BigDecimal deduction) {
        BigDecimal finalAmount = depositTotal.multiply(refundRate).subtract(deduction).max(BigDecimal.ZERO);
        return new Settlement(
                id, UUID.randomUUID(), UUID.randomUUID(), null,
                depositTotal, refundRate, deduction, finalAmount,
                null, SettlementStatus.DRAFT, null, null, null,
                Instant.now(), Instant.now());
    }
}
