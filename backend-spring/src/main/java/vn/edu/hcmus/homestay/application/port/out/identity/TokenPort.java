package vn.edu.hcmus.homestay.application.port.out.identity;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

/** Outbound port for generating authentication tokens. */
public interface TokenPort {

    String generateToken(UUID id, String email, AppRole role);
}
