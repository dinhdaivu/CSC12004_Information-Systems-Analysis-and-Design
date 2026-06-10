package vn.edu.hcmus.homestay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.edu.hcmus.homestay.domain.service.RefundCalculator;

@Configuration
public class DomainConfig {

    @Bean
    public RefundCalculator refundCalculator() {
        return new RefundCalculator();
    }
}
