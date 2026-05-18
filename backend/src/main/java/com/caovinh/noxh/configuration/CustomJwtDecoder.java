package com.caovinh.noxh.configuration;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CustomJwtDecoder implements JwtDecoder {

    @NonFinal
    @Value("${jwt.signer-key}")
    String signerKey;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!JWSAlgorithm.HS256.equals(signedJWT.getHeader().getAlgorithm())) {
                throw new JwtException("Invalid JWT algorithm");
            }

            JWSVerifier verifier = new MACVerifier(signerKey.getBytes(StandardCharsets.UTF_8));
            if (!signedJWT.verify(verifier)) {
                throw new JwtException("Invalid JWT signature");
            }

            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            Date expiresAt = claimsSet.getExpirationTime();
            if (expiresAt == null || expiresAt.toInstant().isBefore(Instant.now())) {
                throw new JwtException("JWT has expired");
            }

            Jwt.Builder builder = Jwt.withTokenValue(token)
                    .headers(headers -> headers.putAll(signedJWT.getHeader().toJSONObject()))
                    .claims(claims -> claims.putAll(claimsSet.getClaims()))
                    .expiresAt(expiresAt.toInstant());

            Date issuedAt = claimsSet.getIssueTime();
            if (issuedAt != null) {
                builder.issuedAt(issuedAt.toInstant());
            }

            return builder.build();
        } catch (JOSEException | ParseException e) {
            throw new JwtException("Invalid JWT", e);
        }
    }
}
