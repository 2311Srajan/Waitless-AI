package com.waitless.api.model;

public record PredictRequest(String locationId, int peopleAhead, double serviceRatePerHour, int minutesOpen, int dayOfWeek, int hour, int appointments) {}
