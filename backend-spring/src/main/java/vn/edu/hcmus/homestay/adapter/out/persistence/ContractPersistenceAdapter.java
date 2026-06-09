package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadContractPort;
import vn.edu.hcmus.homestay.application.port.out.SaveContractPort;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

@Component
class ContractPersistenceAdapter implements LoadContractPort, SaveContractPort {

    private final ContractJpaRepository jpaRepository;
    private final ContractMapper mapper;

    ContractPersistenceAdapter(ContractJpaRepository jpaRepository, ContractMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Contract> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Contract> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Contract> loadByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomerId(customerId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Contract save(Contract contract) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(contract)));
    }
}
