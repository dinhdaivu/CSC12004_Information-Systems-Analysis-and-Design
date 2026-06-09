package vn.edu.hcmus.homestay.application.port.in.property;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

public interface GetBedUseCase {

    Bed getBed(UUID id);

    List<Bed> listBedsByRoom(UUID roomId);
}
