package vn.edu.hcmus.homestay.adapter.out.persistence.eligibility;

import java.util.ArrayList;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

@Component
class LodgingEligibilityMapper {

    LodgingEligibility toDomain(LodgingEligibilityEntity e) {
        return new LodgingEligibility(
                e.getId(),
                e.getCustomerId(),
                e.getCheckedBy(),
                e.isIdentityVerified(),
                e.isDocumentsComplete(),
                e.isBackgroundCheckPassed(),
                e.getHealthRequirementsMet(),
                e.getDecision(),
                e.getReasons() != null ? e.getReasons() : new ArrayList<>(),
                e.getNotes(),
                e.getCheckedAt(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    LodgingEligibilityEntity toEntity(LodgingEligibility l) {
        LodgingEligibilityEntity e = new LodgingEligibilityEntity();
        if (l.getId() != null) {
            e.setId(l.getId());
        }
        e.setCustomerId(l.getCustomerId());
        e.setCheckedBy(l.getCheckedBy());
        e.setIdentityVerified(l.isIdentityVerified());
        e.setDocumentsComplete(l.isDocumentsComplete());
        e.setBackgroundCheckPassed(l.isBackgroundCheckPassed());
        e.setHealthRequirementsMet(l.getHealthRequirementsMet());
        e.setDecision(l.getDecision());
        e.setReasons(l.getReasons());
        e.setNotes(l.getNotes());
        e.setCheckedAt(l.getCheckedAt());
        return e;
    }
}
