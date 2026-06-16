package com.caovinh.noxh.service;

import com.caovinh.noxh.entity.Application;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class PriorityScoringService {

    static final int PRIORITY_CATEGORY_SCORE = 100;

    public int calculateScore(Application application) {
        return hasPriorityCategory(application.getPriorityCategory()) ? PRIORITY_CATEGORY_SCORE : 0;
    }

    private boolean hasPriorityCategory(String priorityCategory) {
        if (priorityCategory == null || priorityCategory.isBlank()) {
            return false;
        }
        String normalized = Normalizer.normalize(priorityCategory.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return !normalized.equals("khong")
                && !normalized.equals("none")
                && !normalized.equals("normal")
                && !normalized.equals("khong co")
                && !normalized.equals("khong thuoc dien uu tien");
    }
}
