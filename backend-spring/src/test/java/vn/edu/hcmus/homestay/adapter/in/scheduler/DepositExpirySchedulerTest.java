package vn.edu.hcmus.homestay.adapter.in.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

@ExtendWith(MockitoExtension.class)
class DepositExpirySchedulerTest {

    @Mock
    private LoadDepositPort loadDepositPort;

    @Mock
    private SaveDepositPort saveDepositPort;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private SaveRentalRequestPort saveRentalRequestPort;

    @Mock
    private LoadRentalRequestPort loadRentalRequestPort;

    @Mock
    private LoadUserPort loadUserPort;

    @Mock
    private AsyncEmailSender asyncEmailSender;

    private DepositExpiryScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new DepositExpiryScheduler(
                loadDepositPort,
                saveDepositPort,
                eventPublisher,
                saveRentalRequestPort,
                loadRentalRequestPort,
                loadUserPort,
                asyncEmailSender);
        lenient().when(loadUserPort.loadByIds(any())).thenReturn(List.of());
        lenient().when(loadRentalRequestPort.loadByIds(any())).thenReturn(List.of());
    }

    @Test
    void expireOverdueDeposits_noOverdue_doesNothing() {
        when(loadDepositPort.loadPendingExpired(any(Instant.class))).thenReturn(List.of());

        scheduler.expireOverdueDeposits();

        verify(saveDepositPort, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void expireOverdueDeposits_withOverdue_setsExpiredAndPublishesEvent() {
        UUID roomId1 = UUID.randomUUID();
        UUID roomId2 = UUID.randomUUID();
        DepositRequest deposit1 = overdueDeposit(UUID.randomUUID(), roomId1, null);
        DepositRequest deposit2 = overdueDeposit(UUID.randomUUID(), roomId2, UUID.randomUUID());

        when(loadDepositPort.loadPendingExpired(any(Instant.class)))
                .thenReturn(List.of(deposit1, deposit2));
        when(saveDepositPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.expireOverdueDeposits();

        verify(saveDepositPort, times(2)).save(any());

        ArgumentCaptor<DepositRequest> savedCaptor = ArgumentCaptor.forClass(DepositRequest.class);
        verify(saveDepositPort, times(2)).save(savedCaptor.capture());
        savedCaptor.getAllValues().forEach(d ->
                org.assertj.core.api.Assertions.assertThat(d.getStatus())
                        .isEqualTo(DepositStatus.EXPIRED));

        verify(eventPublisher, times(2)).publishEvent(any(DepositExpiredEvent.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private DepositRequest overdueDeposit(UUID id, UUID roomId, UUID bedId) {
        return new DepositRequest(
                id,
                null,
                UUID.randomUUID(),
                roomId,
                bedId,
                BigDecimal.valueOf(3000000),
                Instant.now().minusSeconds(3600),
                null,
                null,
                null,
                null,
                DepositStatus.PENDING,
                Instant.now().minusSeconds(86400),
                Instant.now().minusSeconds(86400));
    }
}
