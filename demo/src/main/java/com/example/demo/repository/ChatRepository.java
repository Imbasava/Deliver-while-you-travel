package com.example.demo.repository;

import com.example.demo.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    // Fetch all chats between two users
    @Query("SELECT c FROM Chat c WHERE (c.senderId = :user1 AND c.receiverId = :user2) OR (c.senderId = :user2 AND c.receiverId = :user1) ORDER BY c.timestamp ASC")
    List<Chat> findChatHistory(Long user1, Long user2);

    // Fetch latest chat partners for a user
    @Query("SELECT DISTINCT c.receiverId FROM Chat c WHERE c.senderId = :userId")
    List<Long> findChatPartners(Long userId);
}
