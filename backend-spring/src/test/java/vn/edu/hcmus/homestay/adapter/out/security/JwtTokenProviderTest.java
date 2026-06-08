package vn.edu.hcmus.homestay.adapter.out.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Claims;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-minimum-32-chars-long!!";

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider(SECRET);
    }

    @Test
    void roundTrip_validToken_claimsMatch() {
        UUID id = UUID.randomUUID();
        String token = provider.generateToken(id, "user@example.com", AppRole.CUSTOMER);

        Claims claims = provider.verifyToken(token);

        assertThat(claims.get("id", String.class)).isEqualTo(id.toString());
        assertThat(claims.get("email", String.class)).isEqualTo("user@example.com");
        assertThat(claims.get("role", String.class)).isEqualTo("customer");
    }

    @Test
    void principalFromClaims_populatesAllFields() {
        UUID id = UUID.randomUUID();
        String token = provider.generateToken(id, "staff@example.com", AppRole.SALE);
        Claims claims = provider.verifyToken(token);

        UserPrincipal principal = provider.principalFromClaims(claims);

        assertThat(principal.getId()).isEqualTo(id);
        assertThat(principal.getUsername()).isEqualTo("staff@example.com");
        assertThat(principal.getRole()).isEqualTo(AppRole.SALE);
    }

    @Test
    void verifyToken_tamperedToken_throws() {
        UUID id = UUID.randomUUID();
        String token = provider.generateToken(id, "user@example.com", AppRole.CUSTOMER);
        String tampered = token.substring(0, token.length() - 4) + "XXXX";

        assertThatThrownBy(() -> provider.verifyToken(tampered))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void verifyToken_garbage_throws() {
        assertThatThrownBy(() -> provider.verifyToken("not.a.jwt"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void generateToken_roleStoredLowercase() {
        String token = provider.generateToken(UUID.randomUUID(), "a@b.com", AppRole.ADMIN);
        Claims claims = provider.verifyToken(token);
        assertThat(claims.get("role", String.class)).isEqualTo("admin");
    }
}
