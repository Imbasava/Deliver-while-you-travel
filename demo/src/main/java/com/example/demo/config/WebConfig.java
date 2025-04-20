package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // General CORS settings for APIs
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173") // Restrict to your frontend's origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false); // Set to true if using cookies or credentials

                // Specific CORS settings for uploaded resources
                registry.addMapping("/uploads/**")
                        .allowedOrigins("http://localhost:5173") // Frontend origin
                        .allowedMethods("GET", "OPTIONS")
                        .allowedHeaders("Content-Type");
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Serve uploaded files as static resources
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:/home/basava/Documents/project/oad/demo/uploads/")
                        .setCachePeriod(3600); // Cache for 1 hour
            }
        };
    }
}
