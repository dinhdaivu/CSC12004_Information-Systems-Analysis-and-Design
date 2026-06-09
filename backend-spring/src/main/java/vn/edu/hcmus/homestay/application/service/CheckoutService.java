package vn.edu.hcmus.homestay.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.CreateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateCheckoutRequestUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadCheckoutRequestPort;
import vn.edu.hcmus.homestay.application.port.out.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.SaveCheckoutRequestPort;
import vn.edu.hcmus.homestay.common.event.CheckoutCompletedEvent;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutStatus;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

@Service
public class CheckoutService
        implements CreateCheckoutRequestUseCase, GetCheckoutRequestUseCase, UpdateCheckoutRequestUseCase {

    private final LoadCheckoutRequestPort loadCheckoutRequestPort;
    private final SaveCheckoutRequestPort saveCheckoutRequestPort;
    private final LoadContractPort loadContractPort;
    private final ApplicationEventPublisher eventPublisher;

    public CheckoutService(
            LoadCheckoutRequestPort loadCheckoutRequestPort,
            SaveCheckoutRequestPort saveCheckoutRequestPort,
            LoadContractPort loadContractPort,
            ApplicationEventPublisher eventPublisher) {
        this.loadCheckoutRequestPort = loadCheckoutRequestPort;
        this.saveCheckoutRequestPort = saveCheckoutRequestPort;
        this.loadContractPort = loadContractPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public CheckoutRequest createCheckoutRequest(CreateCheckoutRequestCommand cmd) {
        CheckoutRequest request = new CheckoutRequest(
                null,
                cmd.contractId(),
                cmd.customerId(),
                cmd.requestedCheckoutDate(),
                cmd.reason(),
                CheckoutStatus.REQUESTED,
                null,
                null);
        return saveCheckoutRequestPort.save(request);
    }

    @Override
    public CheckoutRequest getCheckoutRequest(UUID id) {
        return loadCheckoutRequestPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Checkout request not found"));
    }

    @Override
    public List<CheckoutRequest> listCheckoutRequests() {
        return loadCheckoutRequestPort.loadAll();
    }

    @Override
    public List<CheckoutRequest> listMyCheckoutRequests(UUID customerId) {
        return loadCheckoutRequestPort.loadByCustomerId(customerId);
    }

    @Override
    @Transactional
    public CheckoutRequest confirmCheckout(UUID id) {
        CheckoutRequest request = loadCheckoutRequestPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Checkout request not found"));
        return saveCheckoutRequestPort.save(request.withStatus(CheckoutStatus.CONFIRMED));
    }

    @Override
    @Transactional
    public CheckoutRequest cancelCheckout(UUID id) {
        CheckoutRequest request = loadCheckoutRequestPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Checkout request not found"));
        return saveCheckoutRequestPort.save(request.withStatus(CheckoutStatus.CANCELLED));
    }

    @Override
    @Transactional
    public CheckoutRequest completeCheckout(UUID id) {
        CheckoutRequest request = loadCheckoutRequestPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Checkout request not found"));

        Contract contract = loadContractPort.loadById(request.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        CheckoutRequest completed = saveCheckoutRequestPort.save(request.withStatus(CheckoutStatus.COMPLETED));
        eventPublisher.publishEvent(new CheckoutCompletedEvent(contract.getRoomId(), contract.getBedId()));
        return completed;
    }
}
