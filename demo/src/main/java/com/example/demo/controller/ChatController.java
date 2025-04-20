package com.example.demo.controller;
import com.example.demo.model.Chat;
import com.example.demo.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatRepository chatRepository;

    // Fetch chat history between two users
    @GetMapping
    public ResponseEntity<List<Chat>> getChatHistory(@RequestParam Long senderId, @RequestParam Long receiverId) {
        List<Chat> chats = chatRepository.findChatHistory(senderId, receiverId);
        return ResponseEntity.ok(chats);
    }

    // Save a new chat message
    @PostMapping
    public ResponseEntity<Chat> sendMessage(@RequestBody Chat chat) {
        chat.setTimestamp(LocalDateTime.now());
        Chat savedChat = chatRepository.save(chat);
        return ResponseEntity.ok(savedChat);
    }

    // Fetch chat partners for a user
    @GetMapping("/partners")
    public ResponseEntity<List<Long>> getChatPartners(@RequestParam Long userId) {
        List<Long> partners = chatRepository.findChatPartners(userId);
        return ResponseEntity.ok(partners);
    }
}
