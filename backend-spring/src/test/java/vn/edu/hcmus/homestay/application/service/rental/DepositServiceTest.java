package vn.edu.hcmus.homestay.application.service.rental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.in.rental.ConfirmDepositUseCase.ConfirmDepositCommand;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateDepositUseCase.CreateDepositCommand;
import vn.edu.hcmus.homestay.application.port.out.rental.GenerateVietQRPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.financial.SavePaymentPort;
import vn.edu.hcmus.homestay.domain.event.DepositConfirmedEvent;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.payment.Payment;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentMethod;
import vn.edu.hcmus.homestay.domain.model.payment.PaymentStatus;

@ExtendWith(MockitoExtension.class)
class DepositServiceTest {

    @Mock
    private LoadDepositPort loadDepositPort;

    @Mock
    private SaveDepositPort saveDepositPort;

    @Mock
    private SavePaymentPort savePaymentPort;

    @Mock
    private GenerateVietQRPort generateVietQRPort;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private DepositService depositService;

    @BeforeEach
    void setUp() {
        depositService = new DepositService(
                loadDepositPort, saveDepositPort, savePaymentPort, generateVietQRPort, eventPublisher);
    }

    @Test
    void createDeposit_cash_doesNotCallVietQR() {
        UUID roomId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        CreateDepositCommand command = new CreateDepositCommand(
                null, customerId, roomId, null, BigDecimal.valueOf(5000000), PaymentMethod.CASH, null);
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        depositService.createDeposit(command);

        verify(generateVietQRPort, never()).generateQRUrl(any(), any());
    }

    @Test
    void createDeposit_vietqr_populatesReference() {
        UUID roomId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        String qrUrl = "data:image/png;base64,abc123";
        CreateDepositCommand command = new CreateDepositCommand(
                null, customerId, roomId, null, BigDecimal.valueOf(5000000), PaymentMethod.VIETQR, null);
        when(generateVietQRPort.generateQRUrl(any(), any())).thenReturn(qrUrl);
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepositRequest result = depositService.createDeposit(command);

        verify(generateVietQRPort).generateQRUrl(eq(BigDecimal.valueOf(5000000)), any());
        assertThat(result.getVietqrReference()).isEqualTo(qrUrl);
    }

    @Test
    void createDeposit_vietqrApiFails_savesWithNullReference() {
        UUID roomId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        CreateDepositCommand command = new CreateDepositCommand(
                null, customerId, roomId, null, BigDecimal.valueOf(5000000), PaymentMethod.VIETQR, null);
        when(generateVietQRPort.generateQRUrl(any(), any())).thenReturn(null);
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepositRequest result = depositService.createDeposit(command);

        assertThat(result.getVietqrReference()).isNull();
    }

    @Test
    void confirmDeposit_setsStatusPaid_createsPayment_publishesEvent() {
        UUID depositId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        DepositRequest existing = depositRequest(depositId, customerId, roomId, DepositStatus.PENDING);

        when(loadDepositPort.loadById(depositId)).thenReturn(Optional.of(existing));
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(savePaymentPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepositRequest result = depositService.confirmDeposit(
                depositId, new ConfirmDepositCommand(PaymentMethod.CASH));

        assertThat(result.getStatus()).isEqualTo(DepositStatus.PAID);
        assertThat(result.getPaidAt()).isNotNull();

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(savePaymentPort).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();
        assertThat(savedPayment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(savedPayment.getDepositRequestId()).isEqualTo(depositId);

        ArgumentCaptor<DepositConfirmedEvent> eventCaptor =
                ArgumentCaptor.forClass(DepositConfirmedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().roomId()).isEqualTo(roomId);
    }

    @Test
    void confirmDeposit_notFound_throwsNotFoundException() {
        UUID depositId = UUID.randomUUID();
        when(loadDepositPort.loadById(depositId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> depositService.confirmDeposit(
                        depositId, new ConfirmDepositCommand(PaymentMethod.CASH)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void cancelDeposit_setsCancelled() {
        UUID depositId = UUID.randomUUID();
        DepositRequest existing = depositRequest(
                depositId, UUID.randomUUID(), UUID.randomUUID(), DepositStatus.PENDING);

        when(loadDepositPort.loadById(depositId)).thenReturn(Optional.of(existing));
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepositRequest result = depositService.cancelDeposit(depositId);

        assertThat(result.getStatus()).isEqualTo(DepositStatus.CANCELLED);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private DepositRequest depositRequest(UUID id, UUID customerId, UUID roomId, DepositStatus status) {
        return new DepositRequest(
                id,
                null,
                customerId,
                roomId,
                null,
                BigDecimal.valueOf(5000000),
                Instant.now().plusSeconds(86400),
                null,
                null,
                null,
                null,
                status,
                Instant.now(),
                Instant.now());
    }
}
