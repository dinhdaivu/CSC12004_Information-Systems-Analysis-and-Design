package vn.edu.hcmus.homestay.domain.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

/**
 * Unit tests for the 4-case refund rate policy.
 * Pure domain logic — no mocks needed.
 */
class RefundCalculatorTest {

    private final RefundCalculator calculator = new RefundCalculator();

    @Test
    void completedContract_fullRefund() {
        // COMPLETED status always means full refund regardless of dates
        LocalDate start = LocalDate.now().minusMonths(6);
        LocalDate end = LocalDate.now().plusMonths(2);

        BigDecimal rate = calculator.calculateRefundRate(start, end, ContractStatus.COMPLETED);

        assertThat(rate).isEqualByComparingTo(new BigDecimal("1.0"));
    }

    @Test
    void expiredContract_fullRefund() {
        // endDate in the past → full refund
        LocalDate start = LocalDate.now().minusMonths(12);
        LocalDate end = LocalDate.now().minusDays(1);

        BigDecimal rate = calculator.calculateRefundRate(start, end, ContractStatus.ACTIVE);

        assertThat(rate).isEqualByComparingTo(new BigDecimal("1.0"));
    }

    @Test
    void beforeStartDate_80PercentRefund() {
        // now < startDate → 80%
        LocalDate start = LocalDate.now().plusDays(10);
        LocalDate end = LocalDate.now().plusMonths(12);

        BigDecimal rate = calculator.calculateRefundRate(start, end, ContractStatus.ACTIVE);

        assertThat(rate).isEqualByComparingTo(new BigDecimal("0.8"));
    }

    @Test
    void earlyTerminationLessThan6Months_50PercentRefund() {
        // 3 months into an active contract → < 6 months → 50%
        LocalDate start = LocalDate.now().minusMonths(3);
        LocalDate end = LocalDate.now().plusMonths(9);

        BigDecimal rate = calculator.calculateRefundRate(start, end, ContractStatus.ACTIVE);

        assertThat(rate).isEqualByComparingTo(new BigDecimal("0.5"));
    }

    @Test
    void earlyTerminationMoreThan6Months_70PercentRefund() {
        // 8 months into an active contract → >= 6 months → 70%
        LocalDate start = LocalDate.now().minusMonths(8);
        LocalDate end = LocalDate.now().plusMonths(4);

        BigDecimal rate = calculator.calculateRefundRate(start, end, ContractStatus.ACTIVE);

        assertThat(rate).isEqualByComparingTo(new BigDecimal("0.7"));
    }
}
