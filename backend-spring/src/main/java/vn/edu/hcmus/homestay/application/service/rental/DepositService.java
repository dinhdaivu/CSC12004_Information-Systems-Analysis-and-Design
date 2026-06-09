package vn.edu.hcmus.homestay.application.service.rental;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.rental.CancelDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.ConfirmDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.CreateDepositUseCase;
import vn.edu.hcmus.homestay.application.port.in.rental.GetDepositUseCase;
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
import vn.edu.hcmus.homestay.domain.model.payment.PaymentType;

@Service
public class DepositService
        implements CreateDepositUseCase, GetDepositUseCase, ConfirmDepositUseCase, CancelDepositUseCase {

    private final LoadDepositPort loadDepositPort;
    private final SaveDepositPort saveDepositPort;
    private final SavePaymentPort savePaymentPort;
    private final GenerateVietQRPort generateVietQRPort;
    private final ApplicationEventPublisher eventPublisher;

    public DepositService(
            LoadDepositPort loadDepositPort,
            SaveDepositPort saveDepositPort,
            SavePaymentPort savePaymentPort,
            GenerateVietQRPort generateVietQRPort,
            ApplicationEventPublisher eventPublisher) {
        this.loadDepositPort = loadDepositPort;
        this.saveDepositPort = saveDepositPort;
        this.savePaymentPort = savePaymentPort;
        this.generateVietQRPort = generateVietQRPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public DepositRequest createDeposit(CreateDepositCommand command) {
        Instant now = Instant.now();
        DepositRequest deposit = new DepositRequest(
                null,
                command.rentalRequestId(),
                command.customerId(),
                command.roomId(),
                command.bedId(),
                command.amount(),
                now.plus(24, ChronoUnit.HOURS),
                null,
                null,
                null,
                command.notes(),
                DepositStatus.PENDING,
                null,
                null);

        if (command.paymentMethod() == PaymentMethod.VIETQR) {
            String qrUrl = generateVietQRPort.generateQRUrl(
                    command.amount(), "Deposit " + command.roomId());
            if (qrUrl != null) {
                deposit = deposit.withVietQRReference(qrUrl);
            }
        }

        return saveDepositPort.save(deposit);
    }

    @Override
    public DepositRequest getDeposit(UUID id) {
        return loadDepositPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Deposit request not found"));
    }

    @Override
    public List<DepositRequest> getAllDeposits() {
        return loadDepositPort.loadAll();
    }

    @Override
    @Transactional
    public DepositRequest confirmDeposit(UUID id, ConfirmDepositCommand command) {
        DepositRequest deposit = loadDepositPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Deposit request not found"));

        DepositRequest updated = deposit.withStatus(DepositStatus.PAID).withPaid(Instant.now());

        Payment payment = new Payment(
                null,
                deposit.getCustomerId(),
                deposit.getId(),
                null,
                null,
                deposit.getAmount(),
                PaymentType.DEPOSIT,
                PaymentStatus.COMPLETED,
                command.paymentMethod(),
                null,
                null,
                null,
                null,
                null);
        savePaymentPort.save(payment);

        DepositRequest saved = saveDepositPort.save(updated);
        eventPublisher.publishEvent(new DepositConfirmedEvent(deposit.getRoomId(), deposit.getBedId()));
        return saved;
    }

    @Override
    @Transactional
    public DepositRequest cancelDeposit(UUID id) {
        DepositRequest deposit = loadDepositPort.loadById(id)
                .orElseThrow(() -> new NotFoundException("Deposit request not found"));
        return saveDepositPort.save(deposit.withStatus(DepositStatus.CANCELLED));
    }
}
