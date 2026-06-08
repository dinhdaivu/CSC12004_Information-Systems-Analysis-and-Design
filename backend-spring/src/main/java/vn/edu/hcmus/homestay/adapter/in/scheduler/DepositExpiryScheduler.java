package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.SaveDepositPort;
import vn.edu.hcmus.homestay.common.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;

@Component
public class DepositExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DepositExpiryScheduler.class);

    private final LoadDepositPort loadDepositPort;
    private final SaveDepositPort saveDepositPort;
    private final ApplicationEventPublisher eventPublisher;

    public DepositExpiryScheduler(
            LoadDepositPort loadDepositPort,
            SaveDepositPort saveDepositPort,
            ApplicationEventPublisher eventPublisher) {
        this.loadDepositPort = loadDepositPort;
        this.saveDepositPort = saveDepositPort;
        this.eventPublisher = eventPublisher;
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
            eventPublisher.publishEvent(new DepositExpiredEvent(deposit.getRoomId(), deposit.getBedId()));
        }
    }
}
