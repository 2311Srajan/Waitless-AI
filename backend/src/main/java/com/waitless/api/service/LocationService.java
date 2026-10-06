package com.waitless.api.service;

import com.waitless.api.model.Location;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LocationService {
  public List<Location> all() {
    return List.of(
      new Location("aiims-bhopal", "AIIMS Bhopal OPD", "Hospital", "Bhopal", 47, 9),
      new Location("rto-indore", "RTO Indore", "Government Office", "Indore", 82, 7),
      new Location("passport-bhopal", "Passport Seva Kendra", "Government Office", "Bhopal", 31, 12),
      new Location("diagnostic-indore", "City Diagnostic Lab", "Diagnostic Lab", "Indore", 18, 6)
    );
  }
}
