package vn.edu.hcmus.homestay.application.service.rental;

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
import vn.edu.hcmus.homestay.application.port.in.rental.CreateContractUseCase.CreateContractCommand;
import vn.edu.hcmus.homestay.application.port.in.rental.SignContractUseCase.SignContractCommand;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveContractPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private LoadContractPort loadContractPort;

    @Mock
    private SaveContractPort saveContractPort;

    private ContractService service;

    @BeforeEach
    void setUp() {
        service = new ContractService(loadContractPort, saveContractPort);
    }

    // ── createContract ────────────────────────────────────────────────────────

    @Test
    void createContract_savesWithActiveStatus() {
        UUID customerId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Contract saved = contract(UUID.randomUUID(), customerId, roomId, ContractStatus.ACTIVE);
        when(saveContractPort.save(any())).thenReturn(saved);

        Contract result = service.createContract(new CreateContractCommand(
                customerId, null, roomId, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                BigDecimal.valueOf(3000000), null));

        assertThat(result.getStatus()).isEqualTo(ContractStatus.ACTIVE);
        verify(saveContractPort).save(any(Contract.class));
    }

    // ── getContract ───────────────────────────────────────────────────────────

    @Test
    void getContract_found_returns() {
        UUID contractId = UUID.randomUUID();
        Contract c = contract(contractId, UUID.randomUUID(), UUID.randomUUID(), ContractStatus.ACTIVE);
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(c));

        Contract result = service.getContract(contractId);

        assertThat(result).isEqualTo(c);
    }

    @Test
    void getContract_notFound_throwsNotFoundException() {
        UUID contractId = UUID.randomUUID();
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getContract(contractId))
                .isInstanceOf(NotFoundException.class);
    }

    // ── getMyContracts ────────────────────────────────────────────────────────

    @Test
    void getMyContracts_returnsOwnContracts() {
        UUID customerId = UUID.randomUUID();
        Contract c1 = contract(UUID.randomUUID(), customerId, UUID.randomUUID(), ContractStatus.ACTIVE);
        Contract c2 = contract(UUID.randomUUID(), customerId, UUID.randomUUID(), ContractStatus.COMPLETED);
        when(loadContractPort.loadByCustomerId(customerId)).thenReturn(List.of(c1, c2));

        List<Contract> result = service.getMyContracts(customerId);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(c -> c.getCustomerId().equals(customerId));
    }

    // ── signContract ──────────────────────────────────────────────────────────

    @Test
    void signContract_updatesDocumentUrl() {
        UUID contractId = UUID.randomUUID();
        Contract existing = contract(contractId, UUID.randomUUID(), UUID.randomUUID(), ContractStatus.ACTIVE);
        Contract updated = existing.withDocumentUrl("https://example.com/doc.pdf");
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.of(existing));
        when(saveContractPort.save(any())).thenReturn(updated);

        Contract result = service.signContract(contractId,
                new SignContractCommand("https://example.com/doc.pdf", null));

        assertThat(result.getContractDocumentUrl()).isEqualTo("https://example.com/doc.pdf");
        verify(saveContractPort).save(any(Contract.class));
    }

    @Test
    void signContract_notFound_throwsNotFoundException() {
        UUID contractId = UUID.randomUUID();
        when(loadContractPort.loadById(contractId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.signContract(contractId,
                new SignContractCommand("https://example.com/doc.pdf", null)))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Contract contract(UUID id, UUID customerId, UUID roomId, ContractStatus status) {
        return new Contract(
                id, customerId, null, roomId, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                BigDecimal.valueOf(3000000), status, null, null,
                Instant.now(), Instant.now());
    }
}
