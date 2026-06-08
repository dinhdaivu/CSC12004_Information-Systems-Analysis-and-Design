package vn.edu.hcmus.homestay.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

public interface LoadBedPort {

    List<Bed> loadByRoomId(UUID roomId);

    Optional<Bed> loadById(UUID id);

    boolean existsByRoomIdAndBedNumber(UUID roomId, String bedNumber);
}
