package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@Converter(autoApply = true)
public class ContractStatusConverter implements AttributeConverter<ContractStatus, String> {

    @Override
    public String convertToDatabaseColumn(ContractStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public ContractStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return ContractStatus.valueOf(dbData.toUpperCase());
    }
}
