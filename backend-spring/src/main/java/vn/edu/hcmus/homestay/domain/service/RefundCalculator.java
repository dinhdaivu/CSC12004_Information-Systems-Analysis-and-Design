package vn.edu.hcmus.homestay.domain.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

/** Pure domain service — encapsulates the 4-case refund percentage policy. No framework dependencies. */
public class RefundCalculator {

    public BigDecimal calculateRefundRate(LocalDate startDate, LocalDate endDate, ContractStatus status) {
        LocalDate now = LocalDate.now();
        if (status == ContractStatus.COMPLETED || !endDate.isAfter(now)) return new BigDecimal("1.0");
        if (now.isBefore(startDate)) return new BigDecimal("0.8");
        double months = ChronoUnit.DAYS.between(startDate, now) / 30.44;
        return months < 6 ? new BigDecimal("0.5") : new BigDecimal("0.7");
    }
}
