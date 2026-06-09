package vn.edu.hcmus.homestay.application.service.tenancy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.in.tenancy.CreateCheckoutRequestUseCase.CreateCheckoutRequestCommand;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadCheckoutRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.tenancy.SaveCheckoutRequestPort;
import vn.edu.hcmus.homestay.domain.event.CheckoutCompletedEvent;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutStatus;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private LoadCheckoutRequestPort loadCheckoutRequestPort;

    @Mock
    private SaveCheckoutRequestPort saveCheckoutRequestPort;

    @Mock
    private LoadContractPort loadContractPort;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private CheckoutService checkoutService;

    @BeforeEach
    void setUp() {
        checkoutService = new CheckoutService(
                loadCheckoutRequestPort, saveCheckoutRequestPort, loadContractPort, eventPublisher);
    }

    @Test
    void createCheckoutRequest_savesWithRequestedStatus() {
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        when(saveCheckoutRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateCheckoutRequestCommand cmd = new CreateCheckoutRequestCommand(
                contractId, customerId, LocalDate.now().plusDays(7), "Moving out");

        CheckoutRequest result = checkoutService.createCheckoutRequest(cmd);

        assertThat(result.getStatus()).isEqualTo(CheckoutStatus.REQUESTED);
        assertThat(result.getContractId()).isEqualTo(contractId);
        assertThat(result.getCustomerId()).isEqualTo(customerId);
        verify(saveCheckoutRequestPort).save(any());
    }

    @Test
    void getCheckoutRequest_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadCheckoutRequestPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> checkoutService.getCheckoutRequest(id))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void confirmCheckout_setsConfirmedStatus() {
        UUID id = UUID.randomUUID();
        CheckoutRequest existing = checkoutRequest(id, UUID.randomUUID(), UUID.randomUUID(), CheckoutStatus.REQUESTED);
        when(loadCheckoutRequestPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveCheckoutRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CheckoutRequest result = checkoutService.confirmCheckout(id);

        assertThat(result.getStatus()).isEqualTo(CheckoutStatus.CONFIRMED);
    }

    @Test
    void cancelCheckout_setCancelledStatus() {
        UUID id = UUID.randomUUID();
        CheckoutRequest existing = checkoutRequest(id, UUID.randomUUID(), UUID.randomUUID(), CheckoutStatus.REQUESTED);
        when(loadCheckoutRequestPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveCheckoutRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CheckoutRequest result = checkoutService.cancelCheckout(id);

        assertThat(result.getStatus()).isEqualTo(CheckoutStatus.CANCELLED);
    }

    @Test
    void completeCheckout_publishesCheckoutCompletedEvent() {
        UUID checkoutId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        UUID bedId = UUID.randomUUID();

        CheckoutRequest existing = checkoutRequest(checkoutId, contractId, UUID.randomUUID(), CheckoutStatus.CONFIRMED);
        Contract contract = contract(contractId, roomId, bedId);

        when(loadCheckoutRequestPort.loadById(checkoutId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveCheckoutRequestPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        checkoutService.completeCheckout(checkoutId);

        ArgumentCaptor<CheckoutCompletedEvent> eventCaptor =
                ArgumentCaptor.forClass(CheckoutCompletedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().roomId()).isEqualTo(roomId);
        assertThat(eventCaptor.getValue().bedId()).isEqualTo(bedId);
    }

    @Test
    void completeCheckout_contractNotFound_throwsNotFoundException() {
        UUID checkoutId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();

        CheckoutRequest existing = checkoutRequest(checkoutId, contractId, UUID.randomUUID(), CheckoutStatus.CONFIRMED);
        when(loadCheckoutRequestPort.loadById(checkoutId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> checkoutService.completeCheckout(checkoutId))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CheckoutRequest checkoutRequest(UUID id, UUID contractId, UUID customerId, CheckoutStatus status) {
        return new CheckoutRequest(
                id, contractId, customerId, LocalDate.now().plusDays(7), null,
                status, Instant.now(), Instant.now());
    }

    private Contract contract(UUID id, UUID roomId, UUID bedId) {
        return new Contract(
                id, UUID.randomUUID(), null, roomId, bedId,
                LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(9),
                null, ContractStatus.ACTIVE, null, null, Instant.now(), Instant.now());
    }
}
