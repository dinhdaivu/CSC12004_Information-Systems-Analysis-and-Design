package vn.edu.hcmus.homestay.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.edu.hcmus.homestay.application.port.in.CreateHandoverUseCase.CreateHandoverCommand;
import vn.edu.hcmus.homestay.application.port.in.CreateHandoverUseCase.HandoverItemCommand;
import vn.edu.hcmus.homestay.application.port.in.UpdateHandoverUseCase.SignHandoverCommand;
import vn.edu.hcmus.homestay.application.port.out.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.LoadHandoverPort;
import vn.edu.hcmus.homestay.application.port.out.SaveHandoverPort;
import vn.edu.hcmus.homestay.common.event.HandoverCompletedEvent;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

@ExtendWith(MockitoExtension.class)
class HandoverServiceTest {

    @Mock
    private LoadHandoverPort loadHandoverPort;

    @Mock
    private SaveHandoverPort saveHandoverPort;

    @Mock
    private LoadContractPort loadContractPort;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private HandoverService service;

    @BeforeEach
    void setUp() {
        service = new HandoverService(loadHandoverPort, saveHandoverPort, loadContractPort, eventPublisher);
    }

    // ── createHandover ────────────────────────────────────────────────────────

    @Test
    void createHandover_contractNotFound_throwsNotFoundException() {
        UUID contractId = UUID.randomUUID();
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createHandover(new CreateHandoverCommand(
                contractId, null, UUID.randomUUID(), null, null, List.of())))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void createHandover_valid_savesHandoverAndItems() {
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Contract contract = contract(contractId, customerId, roomId);
        Handover savedHandover = handover(UUID.randomUUID(), contractId, customerId, HandoverStatus.PENDING);

        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.save(any())).thenReturn(savedHandover);
        when(saveHandoverPort.saveItem(any())).thenReturn(
                new HandoverItem(UUID.randomUUID(), savedHandover.getId(), "Bed", "Good", null, Instant.now()));
        when(loadHandoverPort.loadItemsByHandoverId(savedHandover.getId())).thenReturn(List.of());

        List<HandoverItemCommand> items = List.of(new HandoverItemCommand("Bed", "Good", null));
        HandoverAggregate result = service.createHandover(
                new CreateHandoverCommand(contractId, null, customerId, null, null, items));

        assertThat(result.getHandover().getStatus()).isEqualTo(HandoverStatus.PENDING);
        verify(saveHandoverPort).save(any(Handover.class));
        verify(saveHandoverPort).saveItem(any(HandoverItem.class));
    }

    // ── completeHandover ──────────────────────────────────────────────────────

    @Test
    void completeHandover_setsCompletedAndPublishesEvent() {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Handover existing = handover(handoverId, contractId, customerId, HandoverStatus.PENDING);
        Contract contract = contract(contractId, customerId, roomId);
        Handover completed = existing.withStatus(HandoverStatus.COMPLETED);

        when(loadHandoverPort.loadById(handoverId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.save(any())).thenReturn(completed);
        when(loadHandoverPort.loadItemsByHandoverId(handoverId)).thenReturn(List.of());

        HandoverAggregate result = service.completeHandover(handoverId);

        assertThat(result.getHandover().getStatus()).isEqualTo(HandoverStatus.COMPLETED);
        verify(eventPublisher).publishEvent(any(HandoverCompletedEvent.class));
    }

    // ── cancelHandover ────────────────────────────────────────────────────────

    @Test
    void cancelHandover_setsCancelled() {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Handover existing = handover(handoverId, contractId, customerId, HandoverStatus.PENDING);
        Contract contract = contract(contractId, customerId, roomId);
        Handover cancelled = existing.withStatus(HandoverStatus.CANCELLED);

        when(loadHandoverPort.loadById(handoverId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.save(any())).thenReturn(cancelled);
        when(loadHandoverPort.loadItemsByHandoverId(handoverId)).thenReturn(List.of());

        HandoverAggregate result = service.cancelHandover(handoverId);

        assertThat(result.getHandover().getStatus()).isEqualTo(HandoverStatus.CANCELLED);
    }

    // ── signHandover ──────────────────────────────────────────────────────────

    @Test
    void signHandover_bothSignatures_setsSignedAt() {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Handover existing = handover(handoverId, contractId, customerId, HandoverStatus.PENDING);
        Contract contract = contract(contractId, customerId, roomId);
        Handover withBothSigs = existing
                .withManagerSignatureUrl("https://mgr.sig")
                .withCustomerSignatureUrl("https://cust.sig")
                .withSignedAt(Instant.now());

        when(loadHandoverPort.loadById(handoverId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.save(any())).thenReturn(withBothSigs);
        when(loadHandoverPort.loadItemsByHandoverId(handoverId)).thenReturn(List.of());

        HandoverAggregate result = service.signHandover(handoverId,
                new SignHandoverCommand("https://mgr.sig", "https://cust.sig"));

        assertThat(result.getHandover().getSignedAt()).isNotNull();
    }

    @Test
    void signHandover_oneSignature_noSignedAt() {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Handover existing = handover(handoverId, contractId, customerId, HandoverStatus.PENDING);
        Contract contract = contract(contractId, customerId, roomId);
        Handover withOneSig = existing.withManagerSignatureUrl("https://mgr.sig");

        when(loadHandoverPort.loadById(handoverId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.save(any())).thenReturn(withOneSig);
        when(loadHandoverPort.loadItemsByHandoverId(handoverId)).thenReturn(List.of());

        HandoverAggregate result = service.signHandover(handoverId,
                new SignHandoverCommand("https://mgr.sig", null));

        assertThat(result.getHandover().getSignedAt()).isNull();
    }

    // ── addHandoverItem ───────────────────────────────────────────────────────

    @Test
    void addHandoverItem_savesItem() {
        UUID handoverId = UUID.randomUUID();
        UUID contractId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Handover existing = handover(handoverId, contractId, customerId, HandoverStatus.PENDING);
        Contract contract = contract(contractId, customerId, roomId);
        HandoverItem savedItem = new HandoverItem(UUID.randomUUID(), handoverId, "Chair", "Good", null, Instant.now());

        when(loadHandoverPort.loadById(handoverId)).thenReturn(Optional.of(existing));
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(contract));
        when(saveHandoverPort.saveItem(any())).thenReturn(savedItem);
        when(loadHandoverPort.loadItemsByHandoverId(handoverId)).thenReturn(List.of(savedItem));

        HandoverAggregate result = service.addHandoverItem(handoverId,
                new HandoverItemCommand("Chair", "Good", null));

        assertThat(result.getItems()).hasSize(1);
        verify(saveHandoverPort).saveItem(any(HandoverItem.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Handover handover(UUID id, UUID contractId, UUID customerId, HandoverStatus status) {
        return new Handover(id, contractId, null, customerId,
                Instant.now(), status, null, null, null, null,
                Instant.now(), Instant.now());
    }

    private Contract contract(UUID id, UUID customerId, UUID roomId) {
        return new Contract(id, customerId, null, roomId, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                BigDecimal.valueOf(3000000), ContractStatus.ACTIVE, null, null,
                Instant.now(), Instant.now());
    }
}
