package com.waitless.api.model;

public record PredictResponse(double waitMinutes, String crowdLevel, String trend, String recommendation, double confidence) {}
