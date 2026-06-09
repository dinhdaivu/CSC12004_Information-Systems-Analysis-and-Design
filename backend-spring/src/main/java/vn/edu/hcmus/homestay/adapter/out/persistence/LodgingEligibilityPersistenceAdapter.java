package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadEligibilityPort;
import vn.edu.hcmus.homestay.application.port.out.SaveEligibilityPort;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

@Component
class LodgingEligibilityPersistenceAdapter implements LoadEligibilityPort, SaveEligibilityPort {

    private final LodgingEligibilityJpaRepository jpaRepository;
    private final LodgingEligibilityMapper mapper;

    LodgingEligibilityPersistenceAdapter(
            LodgingEligibilityJpaRepository jpaRepository, LodgingEligibilityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<LodgingEligibility> loadByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomerId(customerId).map(mapper::toDomain);
    }

    @Override
    public LodgingEligibility save(LodgingEligibility eligibility) {
        // Upsert by customer_id
        Optional<LodgingEligibilityEntity> existing =
                jpaRepository.findByCustomerId(eligibility.getCustomerId());
        if (existing.isPresent()) {
            LodgingEligibilityEntity entity = existing.get();
            entity.setCheckedBy(eligibility.getCheckedBy());
            entity.setIdentityVerified(eligibility.isIdentityVerified());
            entity.setDocumentsComplete(eligibility.isDocumentsComplete());
            entity.setBackgroundCheckPassed(eligibility.isBackgroundCheckPassed());
            entity.setHealthRequirementsMet(eligibility.getHealthRequirementsMet());
            entity.setDecision(eligibility.getDecision());
            entity.setReasons(eligibility.getReasons());
            entity.setNotes(eligibility.getNotes());
            entity.setCheckedAt(eligibility.getCheckedAt());
            return mapper.toDomain(jpaRepository.save(entity));
        }
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(eligibility)));
    }
}
