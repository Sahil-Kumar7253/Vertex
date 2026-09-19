package com.vertex.vertex_api;

import com.vertex.vertex_api.config.WorkspaceMemberSchemaInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Map;
import java.util.TimeZone;

@SpringBootApplication
public class VertexApiApplication {

	public static void main(String[] args) {

		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
		SpringApplication application = new SpringApplication(VertexApiApplication.class);
		application.setDefaultProperties(Map.of("spring.profiles.default", "local"));
		application.addInitializers(new WorkspaceMemberSchemaInitializer());
		application.run(args);
	}

}
