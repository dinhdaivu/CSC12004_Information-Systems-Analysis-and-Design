package vn.edu.hcmus.homestay.application.service.financial;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmus.homestay.application.port.in.financial.GetSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.CreateSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.UpdateDeductionUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.ConfirmSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.CompleteSettlementUseCase;
import vn.edu.hcmus.homestay.application.port.in.financial.SignSettlementUseCase;
import vn.edu.hcmus.homestay.domain.service.RefundCalculator;
import vn.edu.hcmus.homestay.application.port.out.tenancy.LoadCheckoutRequestPort;
import vn.edu.hcmus.homestay.application.port.out.rental.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.financial.LoadSettlementPort;
import vn.edu.hcmus.homestay.application.port.out.financial.SaveSettlementPort;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.checkout.CheckoutRequest;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;
import vn.edu.hcmus.homestay.domain.model.settlement.Settlement;
import vn.edu.hcmus.homestay.domain.model.settlement.SettlementStatus;

@Service
public class SettlementService implements
        GetSettlementUseCase, CreateSettlementUseCase, UpdateDeductionUseCase,
        ConfirmSettlementUseCase, CompleteSettlementUseCase, SignSettlementUseCase {

    private final LoadSettlementPort loadSettlementPort;
    private final SaveSettlementPort saveSettlementPort;
    private final LoadCheckoutRequestPort loadCheckoutRequestPort;
    private final LoadContractPort loadContractPort;
    private final RefundCalculator refundCalculator;

    public SettlementService(
            LoadSettlementPort loadSettlementPort,
            SaveSettlementPort saveSettlementPort,
            LoadCheckoutRequestPort loadCheckoutRequestPort,
            LoadContractPort loadContractPort,
            RefundCalculator refundCalculator) {
        this.loadSettlementPort = loadSettlementPort;
        this.saveSettlementPort = saveSettlementPort;
        this.loadCheckoutRequestPort = loadCheckoutRequestPort;
        this.loadContractPort = loadContractPort;
        this.refundCalculator = refundCalculator;
    }

    @Override
    public Settlement getSettlement(UUID checkoutRequestId) {
        return loadSettlementPort.loadByCheckoutRequestId(checkoutRequestId)
                .orElseThrow(() -> new NotFoundException("Settlement not found"));
    }

    @Override
    @Transactional
    public Settlement createSettlement(UUID checkoutRequestId, CreateSettlementUseCase.CreateSettlementCommand cmd) {
        CheckoutRequest checkoutRequest = loadCheckoutRequestPort.loadById(checkoutRequestId)
                .orElseThrow(() -> new NotFoundException("Checkout request not found"));

        Contract contract = loadContractPort.loadById(checkoutRequest.getContractId())
                .orElseThrow(() -> new NotFoundException("Contract not found"));

        BigDecimal refundRate = refundCalculator.calculateRefundRate(
                contract.getStartDate(), contract.getEndDate(), contract.getStatus());

        BigDecimal deduction = cmd.deduction() != null ? cmd.deduction() : BigDecimal.ZERO;
        BigDecimal raw = cmd.depositTotal().multiply(refundRate).subtract(deduction);
        BigDecimal finalAmount = raw.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        Settlement settlement = new Settlement(
                null,
                checkoutRequestId,
                checkoutRequest.getContractId(),
                cmd.depositRequestId(),
                cmd.depositTotal(),
                refundRate,
                deduction,
                finalAmount,
                cmd.paymentMethod(),
                SettlementStatus.DRAFT,
                cmd.notes(),
                null,
                null,
                null,
                null);

        return saveSettlementPort.save(settlement);
    }

    @Override
    @Transactional
    public Settlement updateDeduction(UUID settlementId, BigDecimal deduction) {
        Settlement settlement = loadSettlementPort.loadById(settlementId)
                .orElseThrow(() -> new NotFoundException("Settlement not found"));

        BigDecimal raw = settlement.getDepositTotal().multiply(settlement.getRefundRate()).subtract(deduction);
        BigDecimal newFinalAmount = raw.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return saveSettlementPort.save(
                settlement.withDeduction(deduction).withFinalAmount(newFinalAmount));
    }

    @Override
    @Transactional
    public Settlement confirmSettlement(UUID settlementId) {
        Settlement settlement = loadSettlementPort.loadById(settlementId)
                .orElseThrow(() -> new NotFoundException("Settlement not found"));
        return saveSettlementPort.save(settlement.withStatus(SettlementStatus.CONFIRMED));
    }

    @Override
    @Transactional
    public Settlement completeSettlement(UUID settlementId) {
        Settlement settlement = loadSettlementPort.loadById(settlementId)
                .orElseThrow(() -> new NotFoundException("Settlement not found"));
        return saveSettlementPort.save(settlement.withStatus(SettlementStatus.PAID));
    }

    @Override
    @Transactional
    public Settlement signSettlement(UUID settlementId, String customerSignatureUrl, UUID callerId, boolean callerIsStaff) {
        Settlement settlement = loadSettlementPort.loadById(settlementId)
                .orElseThrow(() -> new NotFoundException("Settlement not found"));
        if (!callerIsStaff) {
            CheckoutRequest checkout = loadCheckoutRequestPort.loadById(settlement.getCheckoutRequestId())
                    .orElseThrow(() -> new NotFoundException("Checkout request not found"));
            if (!checkout.getCustomerId().equals(callerId)) {
                throw new ForbiddenException("You can only sign your own settlement");
            }
        }
        return saveSettlementPort.save(
                settlement.withCustomerSignature(customerSignatureUrl).withSignedAt(Instant.now()));
    }
}
