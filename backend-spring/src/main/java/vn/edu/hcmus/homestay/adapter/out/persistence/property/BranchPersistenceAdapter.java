package vn.edu.hcmus.homestay.adapter.out.persistence.property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBranchPort;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

@Component
class BranchPersistenceAdapter implements LoadBranchPort, SaveBranchPort {

    private final BranchJpaRepository jpaRepository;
    private final BranchMapper mapper;

    BranchPersistenceAdapter(BranchJpaRepository jpaRepository, BranchMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Branch> loadAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Branch> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }

    @Override
    public Branch save(Branch branch) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(branch)));
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }
}
