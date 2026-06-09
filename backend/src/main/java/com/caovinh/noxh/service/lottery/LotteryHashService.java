package com.caovinh.noxh.service.lottery;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

@Service
public class LotteryHashService {

    public String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to calculate SHA-256", exception);
        }
    }

    public String hashRows(String prefix, List<String> rows) {
        return sha256(prefix + "\n" + String.join("\n", rows));
    }
}
