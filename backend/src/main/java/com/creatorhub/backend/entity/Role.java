package com.creatorhub.backend.entity;

public enum Role {
    MERCHANT,
    CREATOR,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }

    public static Role fromString(String roleStr) {
        if (roleStr == null || roleStr.isBlank()) {
            return CREATOR;
        }
        String clean = roleStr.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        for (Role r : values()) {
            if (r.name().equalsIgnoreCase(clean)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + roleStr);
    }
}

