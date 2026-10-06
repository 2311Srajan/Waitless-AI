package com.waitless.api.controller;

import com.waitless.api.model.Location;
import com.waitless.api.service.LocationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@CrossOrigin(origins = "*")
public class LocationController {
  private final LocationService service;
  public LocationController(LocationService service) { this.service = service; }
  @GetMapping public List<Location> all() { return service.all(); }
}
