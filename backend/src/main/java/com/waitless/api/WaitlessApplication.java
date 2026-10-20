package com.waitless.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.waitless")
public class WaitlessApplication {
  public static void main(String[] args) {
    SpringApplication.run(WaitlessApplication.class, args);
  }
}