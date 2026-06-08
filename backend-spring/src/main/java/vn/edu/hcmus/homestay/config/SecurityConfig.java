package vn.edu.hcmus.homestay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import vn.edu.hcmus.homestay.adapter.in.security.JwtAuthenticationFilter;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String UNAUTHORIZED_BODY =
            "{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}}";
    private static final String FORBIDDEN_BODY =
            "{\"success\":false,\"error\":{\"code\":\"FORBIDDEN\",\"message\":\"Access denied\"}}";

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(
                        s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers("/api/auth/**", "/api/health")
                                        .permitAll()
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/branches/**",
                                                "/api/zones/**",
                                                "/api/rooms/**",
                                                "/api/beds/**")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .exceptionHandling(
                        ex ->
                                ex.authenticationEntryPoint(
                                                (req, res, e) -> {
                                                    res.setStatus(401);
                                                    res.setContentType(
                                                            MediaType.APPLICATION_JSON_VALUE);
                                                    res.getWriter().write(UNAUTHORIZED_BODY);
                                                })
                                        .accessDeniedHandler(
                                                (req, res, e) -> {
                                                    res.setStatus(403);
                                                    res.setContentType(
                                                            MediaType.APPLICATION_JSON_VALUE);
                                                    res.getWriter().write(FORBIDDEN_BODY);
                                                }))
                .addFilterBefore(
                        jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
