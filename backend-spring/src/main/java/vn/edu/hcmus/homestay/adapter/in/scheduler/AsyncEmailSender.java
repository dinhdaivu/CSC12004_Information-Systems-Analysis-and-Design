package vn.edu.hcmus.homestay.adapter.in.scheduler;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import vn.edu.hcmus.homestay.application.port.out.identity.EmailPort;

/**
 * Sends email notifications off the DB transaction thread.
 *
 * When called inside a @Transactional method, the send is registered as an
 * afterCommit hook — the HTTP call to Resend only happens after the DB
 * transaction successfully commits. If the transaction rolls back, the email
 * is never queued. When called outside a transaction, the send fires
 * immediately on a CompletableFuture thread.
 */
@Component
class AsyncEmailSender {

    private static final Logger log = LoggerFactory.getLogger(AsyncEmailSender.class);

    private final EmailPort emailPort;

    AsyncEmailSender(EmailPort emailPort) {
        this.emailPort = emailPort;
    }

    void sendDepositInstruction(
            String email, String fullName, UUID depositId, BigDecimal amount, Instant dueAt) {
        afterCommit(() -> {
            try {
                emailPort.sendDepositInstruction(email, fullName, depositId, amount, dueAt);
            } catch (Exception ex) {
                log.warn("Failed to send deposit instruction email to {}: {}", email, ex.getMessage());
            }
        });
    }

    void sendDepositRejected(String email, String fullName, String roomLabel, String reason) {
        afterCommit(() -> {
            try {
                emailPort.sendDepositRejected(email, fullName, roomLabel, "", reason);
            } catch (Exception ex) {
                log.warn("Failed to send rejection email to {}: {}", email, ex.getMessage());
            }
        });
    }

    void sendDepositFailed(String email, String fullName, String message) {
        afterCommit(() -> {
            try {
                emailPort.sendDepositFailed(email, fullName, message);
            } catch (Exception ex) {
                log.warn("Failed to send deposit expiry email to {}: {}", email, ex.getMessage());
            }
        });
    }

    private static void afterCommit(Runnable task) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    CompletableFuture.runAsync(task);
                }
            });
        } else {
            CompletableFuture.runAsync(task);
        }
    }
}
