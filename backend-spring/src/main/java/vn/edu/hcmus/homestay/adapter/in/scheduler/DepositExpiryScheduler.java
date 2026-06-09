package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;

@Component
public class DepositExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DepositExpiryScheduler.class);

    private final LoadDepositPort loadDepositPort;
    private final SaveDepositPort saveDepositPort;
    private final ApplicationEventPublisher eventPublisher;
    private final SaveRentalRequestPort saveRentalRequestPort;
    private final LoadRentalRequestPort loadRentalRequestPort;
    private final LoadUserPort loadUserPort;
    private final EmailPort emailPort;

    public DepositExpiryScheduler(
            LoadDepositPort loadDepositPort,
            SaveDepositPort saveDepositPort,
            ApplicationEventPublisher eventPublisher,
            SaveRentalRequestPort saveRentalRequestPort,
            LoadRentalRequestPort loadRentalRequestPort,
            LoadUserPort loadUserPort,
            EmailPort emailPort) {
        this.loadDepositPort = loadDepositPort;
        this.saveDepositPort = saveDepositPort;
        this.eventPublisher = eventPublisher;
        this.saveRentalRequestPort = saveRentalRequestPort;
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.loadUserPort = loadUserPort;
        this.emailPort = emailPort;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireOverdueDeposits() {
        List<DepositRequest> overdue = loadDepositPort.loadPendingExpired(Instant.now());
        if (overdue.isEmpty()) {
            return;
        }
        log.info("Expiring {} overdue deposit(s)", overdue.size());
        for (DepositRequest deposit : overdue) {
            DepositRequest expired = deposit.withStatus(DepositStatus.EXPIRED);
            saveDepositPort.save(expired);
            eventPublisher.publishEvent(
                    new DepositExpiredEvent(deposit.getRoomId(), deposit.getBedId()));

            if (deposit.getRentalRequestId() != null) {
                loadRentalRequestPort.loadById(deposit.getRentalRequestId()).ifPresent(req -> {
                    saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.CANCELLED));
                });
            }

            try {
                loadUserPort.loadById(deposit.getCustomerId()).ifPresent(user -> {
                    emailPort.sendDepositFailed(
                            user.getEmail(),
                            user.getFullName(),
                            "Please contact us to rebook if you are still interested.");
                });
            } catch (Exception ex) {
                log.warn("Failed to send deposit expiry email for deposit {}: {}",
                        deposit.getId(), ex.getMessage());
            }
        }
    }
}
