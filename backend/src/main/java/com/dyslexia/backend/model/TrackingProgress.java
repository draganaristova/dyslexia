package com.dyslexia.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tracking_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "games_id",
                                "pin_number"
                        }
                )
        }
)
public class TrackingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne
    @JoinColumn(
            name = "games_id",
            nullable = false
    )
    private Games games;

    private Integer levelNumber;

    private Integer pinNumber;

    @Enumerated(EnumType.STRING)
    private GamesType gamesType;

    private Integer score = 0;

    private Integer totalTasks = 10;

    private Integer attempts = 0;

    private Boolean completed = false;

    private LocalDateTime completedAt;

    /*
     * JSON листа со сите погрешни одговори.
     *
     * Пример:
     *
     * [
     *   {
     *     "taskNumber": 7,
     *     "question": "Која буква ја слушна?",
     *     "selectedAnswer": "Б",
     *     "correctAnswer": "П"
     *   }
     * ]
     */
    @Column(name = "wrong_answers", columnDefinition = "TEXT")
    private String wrongAnswers;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public Games getGames() {
        return games;
    }

    public void setGames(Games games) {
        this.games = games;
    }


    public Integer getLevelNumber() {
        return levelNumber;
    }

    public void setLevelNumber(Integer levelNumber) {
        this.levelNumber = levelNumber;
    }


    public Integer getPinNumber() {
        return pinNumber;
    }

    public void setPinNumber(Integer pinNumber) {
        this.pinNumber = pinNumber;
    }


    public GamesType getGamesType() {
        return gamesType;
    }

    public void setGamesType(GamesType gamesType) {
        this.gamesType = gamesType;
    }


    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }


    public Integer getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Integer totalTasks) {
        this.totalTasks = totalTasks;
    }


    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }


    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }


    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }


    public String getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(String wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }
}