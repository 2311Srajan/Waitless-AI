package com.waitless.api.model;

public record Location(String id, String name, String category, String city, int currentPeople, int avgServiceMinutes) {}
