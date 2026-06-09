package vn.edu.hcmus.homestay.application.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.CreateHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateHandoverUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.LoadHandoverPort;
import vn.edu.hcmus.homestay.application.port.out.SaveHandoverPort;
import vn.edu.hcmus.homestay.common.event.HandoverCompletedEvent;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverAggregate;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverStatus;

@Service
public class HandoverService implements CreateHandoverUseCase, GetHandoverUseCase, UpdateHandoverUseCase {

    private final LoadHandoverPort loadHandoverPort;
    private final SaveHandoverPort saveHandoverPort;
    private final LoadContractPort loadContractPort;
    private final ApplicationEventPublisher eventPublisher;

    public HandoverService(
            LoadHandoverPort loadHandoverPort,
            SaveHandoverPort saveHandoverPort,
            LoadContractPort loadContractPort,
            ApplicationEventPublisher eventPublisher) {
        this.loadHandoverPort = loadHandoverPort;
        this.saveHandoverPort = saveHandoverPort;
        this.loadContractPort = loadContractPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public HandoverAggregate createHandover(CreateHandoverCommand command) {
        Contract contract = loadContractPort.loadById(command.contractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        Instant handoverAt = command.handoverAt() != null ? command.handoverAt() : Instant.now();

        Handover handover = new Handover(
                null,
                command.contractId(),
                command.managerId(),
                command.customerId(),
                handoverAt,
                HandoverStatus.PENDING,
                command.notes(),
                null,
                null,
                null,
                null,
                null);

        Handover saved = saveHandoverPort.save(handover);

        if (command.items() != null) {
            for (CreateHandoverUseCase.HandoverItemCommand itemCmd : command.items()) {
                HandoverItem item = new HandoverItem(
                        null,
                        saved.getId(),
                        itemCmd.itemName(),
                        itemCmd.itemCondition(),
                        itemCmd.notes(),
                        null);
                saveHandoverPort.saveItem(item);
            }
        }

        return buildAggregate(saved, contract);
    }

    @Override
    public HandoverAggregate getHandover(UUID id) {
        Handover handover = loadHandoverPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Handover not found"));
        Contract contract = loadContractPort.loadById(handover.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));
        return buildAggregate(handover, contract);
    }

    @Override
    public List<Handover> listHandovers(HandoverFilter filter) {
        return loadHandoverPort.loadAll().stream()
                .filter(h -> filter.contractId() == null || h.getContractId().equals(filter.contractId()))
                .filter(h -> filter.customerId() == null || h.getCustomerId().equals(filter.customerId()))
                .filter(h -> filter.status() == null || h.getStatus() == filter.status())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HandoverAggregate completeHandover(UUID id, UUID managerId) {
        Handover handover = loadHandoverPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Handover not found"));
        Contract contract = loadContractPort.loadById(handover.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        Handover completed = saveHandoverPort.save(handover.withStatus(HandoverStatus.COMPLETED));
        eventPublisher.publishEvent(new HandoverCompletedEvent(contract.getRoomId(), contract.getBedId()));

        return buildAggregate(completed, contract);
    }

    @Override
    @Transactional
    public HandoverAggregate cancelHandover(UUID id) {
        Handover handover = loadHandoverPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Handover not found"));
        Contract contract = loadContractPort.loadById(handover.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        Handover cancelled = saveHandoverPort.save(handover.withStatus(HandoverStatus.CANCELLED));
        return buildAggregate(cancelled, contract);
    }

    @Override
    @Transactional
    public HandoverAggregate signHandover(UUID id, SignHandoverCommand command) {
        Handover handover = loadHandoverPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Handover not found"));
        Contract contract = loadContractPort.loadById(handover.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        Handover updated = handover;
        if (command.managerSignatureUrl() != null) {
            updated = updated.withManagerSignatureUrl(command.managerSignatureUrl());
        }
        if (command.customerSignatureUrl() != null) {
            updated = updated.withCustomerSignatureUrl(command.customerSignatureUrl());
        }

        // If both signatures are present after update, set signedAt
        if (updated.getManagerSignatureUrl() != null && updated.getCustomerSignatureUrl() != null) {
            updated = updated.withSignedAt(Instant.now());
        }

        Handover saved = saveHandoverPort.save(updated);
        return buildAggregate(saved, contract);
    }

    @Override
    @Transactional
    public HandoverAggregate addHandoverItem(UUID handoverId, CreateHandoverUseCase.HandoverItemCommand item) {
        Handover handover = loadHandoverPort.loadById(handoverId)
                .orElseThrow(() -> new NotFoundException("Handover not found"));
        Contract contract = loadContractPort.loadById(handover.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        HandoverItem newItem = new HandoverItem(
                null,
                handoverId,
                item.itemName(),
                item.itemCondition(),
                item.notes(),
                null);
        saveHandoverPort.saveItem(newItem);

        return buildAggregate(handover, contract);
    }

    private HandoverAggregate buildAggregate(Handover handover, Contract contract) {
        List<HandoverItem> items = loadHandoverPort.loadItemsByHandoverId(handover.getId());
        return new HandoverAggregate(
                handover,
                null,
                null,
                null,
                contract.getRoomId(),
                contract.getBedId(),
                contract.getStartDate(),
                contract.getEndDate(),
                items);
    }
}
