package com.caovinh.noxh.configuration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;

@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

    static final String ACCESS_TOKEN_COOKIE = "access_token";
    final DefaultBearerTokenResolver defaultResolver = new DefaultBearerTokenResolver();

    @Override
    public String resolve(HttpServletRequest request) {
        String token = defaultResolver.resolve(request);
        if (token != null) return token;

        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
