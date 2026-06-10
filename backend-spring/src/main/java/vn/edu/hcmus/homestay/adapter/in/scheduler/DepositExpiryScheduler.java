package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.out.identity.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadRentalRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveDepositPort;
import vn.edu.hcmus.homestay.application.port.out.rental.SaveRentalRequestPort;
import vn.edu.hcmus.homestay.domain.event.DepositExpiredEvent;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositStatus;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequest;
import vn.edu.hcmus.homestay.domain.model.rental.RentalRequestStatus;
import vn.edu.hcmus.homestay.domain.model.user.User;

@Component
public class DepositExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DepositExpiryScheduler.class);

    private final LoadDepositPort           loadDepositPort;
    private final SaveDepositPort           saveDepositPort;
    private final ApplicationEventPublisher eventPublisher;
    private final SaveRentalRequestPort     saveRentalRequestPort;
    private final LoadRentalRequestPort     loadRentalRequestPort;
    private final LoadUserPort              loadUserPort;
    private final AsyncEmailSender          asyncEmailSender;

    public DepositExpiryScheduler(
            LoadDepositPort loadDepositPort,
            SaveDepositPort saveDepositPort,
            ApplicationEventPublisher eventPublisher,
            SaveRentalRequestPort saveRentalRequestPort,
            LoadRentalRequestPort loadRentalRequestPort,
            LoadUserPort loadUserPort,
            AsyncEmailSender asyncEmailSender) {
        this.loadDepositPort       = loadDepositPort;
        this.saveDepositPort       = saveDepositPort;
        this.eventPublisher        = eventPublisher;
        this.saveRentalRequestPort = saveRentalRequestPort;
        this.loadRentalRequestPort = loadRentalRequestPort;
        this.loadUserPort          = loadUserPort;
        this.asyncEmailSender      = asyncEmailSender;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireOverdueDeposits() {
        List<DepositRequest> overdue = loadDepositPort.loadPendingExpired(Instant.now());
        if (overdue.isEmpty()) return;

        log.info("Expiring {} overdue deposit(s)", overdue.size());

        // Bulk-load users and rental requests — 2 IN queries regardless of N.
        Set<UUID> customerIds = overdue.stream()
                .map(DepositRequest::getCustomerId)
                .collect(Collectors.toSet());

        Set<UUID> rentalRequestIds = overdue.stream()
                .map(DepositRequest::getRentalRequestId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, User>          userMap    = toMap(loadUserPort.loadByIds(customerIds),                       User::getId);
        Map<UUID, RentalRequest> requestMap = toMap(loadRentalRequestPort.loadByIds(rentalRequestIds), RentalRequest::getId);

        for (DepositRequest deposit : overdue) {
            saveDepositPort.save(deposit.withStatus(DepositStatus.EXPIRED));
            eventPublisher.publishEvent(
                    new DepositExpiredEvent(deposit.getRoomId(), deposit.getBedId()));

            if (deposit.getRentalRequestId() != null) {
                RentalRequest req = requestMap.get(deposit.getRentalRequestId());
                if (req != null) {
                    saveRentalRequestPort.save(req.withStatus(RentalRequestStatus.CANCELLED));
                }
            }

            // Fire-and-forget: email sends after transaction on a thread pool thread.
            User user = userMap.get(deposit.getCustomerId());
            if (user != null) {
                asyncEmailSender.sendDepositFailed(
                        user.getEmail(),
                        user.getFullName(),
                        "Please contact us to rebook if you are still interested.");
            }
        }
    }

    private static <T> Map<UUID, T> toMap(List<T> items, Function<T, UUID> keyFn) {
        return items.stream().collect(Collectors.toMap(keyFn, Function.identity()));
    }
}
