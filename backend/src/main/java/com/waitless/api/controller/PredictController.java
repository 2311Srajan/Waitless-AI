package com.waitless.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waitless.api.model.PredictRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class PredictController {

  private final String aiUrl;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  public PredictController(
      @Value("${ai.service.url}") String aiUrl,
      ObjectMapper objectMapper) {

    this.aiUrl = aiUrl;
    this.objectMapper = objectMapper;

    this.httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .build();
  }

  @PostMapping("/predict")
  public Map<String, Object> predict(@RequestBody PredictRequest request) {
    try {
      Map<String, Object> payload = Map.of(
          "locationId", request.locationId(),
          "peopleAhead", request.peopleAhead(),
          "serviceRatePerHour", request.serviceRatePerHour(),
          "minutesOpen", request.minutesOpen(),
          "dayOfWeek", request.dayOfWeek(),
          "hour", request.hour(),
          "appointments", request.appointments());

      String json = objectMapper.writeValueAsString(payload);

      HttpRequest httpRequest = HttpRequest.newBuilder()
          .uri(URI.create(aiUrl + "/predict"))
          .version(HttpClient.Version.HTTP_1_1)
          .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
          .header("Accept", MediaType.APPLICATION_JSON_VALUE)
          .POST(HttpRequest.BodyPublishers.ofString(json))
          .build();

      HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

      return objectMapper.readValue(
          response.body(),
          new TypeReference<Map<String, Object>>() {
          });

    } catch (Exception e) {
      throw new RuntimeException("Prediction service failed: " + e.getMessage(), e);
    }
  }
}