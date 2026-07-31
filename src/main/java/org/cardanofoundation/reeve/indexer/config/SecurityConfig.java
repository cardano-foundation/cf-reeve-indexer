package org.cardanofoundation.reeve.indexer.config;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Verification is public — a verifier you must log into is not a verifier. Only card assembly
 * is authenticated: cards are UNSIGNED (import is permissionless), but the operator endpoint
 * that writes to the registry stays gated so it cannot be flooded anonymously. Single operator
 * principal from env config; HTTP Basic over TLS, stateless. CSRF is disabled because its threat
 * model doesn't apply here:
 * Basic credentials are attached to every /api/v1/cards/** request programmatically by the SPA
 * (see backendReeveApi's Basic-auth header construction), never typed into a browser auth
 * dialog and never browser-cached, so there is no ambient credential a third-party page could
 * ride to trigger an authenticated request. If any future feature links a browser navigation
 * directly at /api/v1/cards/** (e.g. a bookmarkable authenticated GET), revisit both CORS and
 * this reasoning — that would reintroduce the ambient-credential vehicle CSRF protects against.
 *
 * <p>The card-attestation ceremony endpoints under /api/v1/cards/**\/attestation/ceremonies/**
 * ({@code CardAttestationController}) are carved out as PUBLIC, same as /status — deliberately
 * NOT folded into the authenticated() rule above. That wizard is driven by the card-issuance
 * frontend, which is itself unauthenticated and holds no operator credentials (see {@code
 * ViewCardIssuance.component.tsx}'s own comment: card creation makes no network call at all
 * today, let alone an authenticated one); gating the ceremony behind the same HTTP Basic as
 * /issue would make it undrivable from that frontend. See {@code CardAttestationController}'s
 * own javadoc for the full reasoning.
 */
@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/cards/status").permitAll()
                        .requestMatchers("/api/v1/cards/attestation/ceremonies").permitAll()
                        .requestMatchers("/api/v1/cards/attestation/ceremonies/**").permitAll()
                        .requestMatchers("/api/v1/cards/**").authenticated()
                        .anyRequest().permitAll())
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${indexer.issuance.username:}") String username,
            @Value("${indexer.issuance.password:}") String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("indexer.issuance credentials not configured - card endpoints will "
                    + "reject every login");
            return new InMemoryUserDetailsManager();
        }
        return new InMemoryUserDetailsManager(User.withUsername(username)
                .password("{noop}" + password).roles("ISSUER").build());
    }
}
