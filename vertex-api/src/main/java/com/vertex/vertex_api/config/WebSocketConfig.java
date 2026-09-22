package com.vertex.vertex_api.config;


import com.vertex.vertex_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Value("${cors.allowed-origin:}")
    private String frontendUrl;

    public WebSocketConfig(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        List<String> allowedOrigins = resolveAllowedOriginPatterns();
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.toArray(new String[0]));
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.toArray(new String[0]))
                .withSockJS();
    }

    private List<String> resolveAllowedOriginPatterns() {
        List<String> allowedOrigins = new ArrayList<>(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://*.vercel.app",
                "https://*.onrender.com",
                "*"
        ));

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            Arrays.stream(frontendUrl.split("[,;\\s]+"))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .forEach(allowedOrigins::add);
        }

        return allowedOrigins;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration){
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel){
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if(accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())){
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if(authHeader != null && authHeader.startsWith("Bearer ")){
                        String token = authHeader.substring(7);
                        String userName = jwtUtil.extractUsername(token);
                        if(userName != null){
                            UserDetails userDetails = userDetailsService.loadUserByUsername(userName);
                            if(jwtUtil.isTokenValid(token, userDetails)){
                                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(auth);
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
}

