package com.waitless.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/locations")
@CrossOrigin(origins = "*")
public class LocationController {

  // Dummy or service-backed data for demonstration
  private final List<Map<String, Object>> locations = List.of(
      Map.of("id", "1", "name", "AIIMS Bhopal OPD", "category", "Hospital", "address", "Bhopal, Madhya Pradesh"),
      Map.of("id", "2", "name", "District Hospital Rewa", "category", "Hospital", "address", "Rewa, Madhya Pradesh"),
      Map.of("id", "3", "name", "RTO Office Bhopal", "category", "Government", "address", "Bhopal, Madhya Pradesh"));

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAllLocations() {
    return ResponseEntity.ok(locations);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Map<String, Object>> getLocationById(@PathVariable String id) {
    return locations.stream()
        .filter(loc -> loc.get("id").equals(id))
        .findFirst()
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}