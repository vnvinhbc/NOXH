package com.caovinh.noxh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NoxhApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoxhApplication.class, args);
	}

}
