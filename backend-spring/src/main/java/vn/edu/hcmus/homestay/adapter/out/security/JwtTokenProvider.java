package vn.edu.hcmus.homestay.adapter.out.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.application.port.out.identity.TokenPort;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@Component
public class JwtTokenProvider implements TokenPort {

    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000;

    private final SecretKey signingKey;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public String generateToken(UUID id, String email, AppRole role) {
        return Jwts.builder()
                .claim("id", id.toString())
                .claim("email", email)
                .claim("role", role.name().toLowerCase())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(signingKey)
                .compact();
    }

    public Claims verifyToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

    public UserPrincipal principalFromClaims(Claims claims) {
        UUID id = UUID.fromString(claims.get("id", String.class));
        String email = claims.get("email", String.class);
        AppRole role = AppRole.valueOf(claims.get("role", String.class).toUpperCase());
        return new UserPrincipal(id, email, role);
    }
}
