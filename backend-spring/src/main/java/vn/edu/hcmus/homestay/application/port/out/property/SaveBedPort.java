package vn.edu.hcmus.homestay.application.port.out.property;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

public interface SaveBedPort {

    Bed save(Bed bed);

    void delete(UUID id);
}
