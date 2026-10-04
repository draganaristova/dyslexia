package com.dyslexia.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "exercises",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_exercise_definition",
                        columnNames = {
                                "games_id",
                                "games_type",
                                "age_group",
                                "pin_number",
                                "task_number"
                        }
                )
        }
)
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "games_id", nullable = false)
    private Games games;

    @Enumerated(EnumType.STRING)
    @Column(name = "games_type", nullable = false)
    private GamesType gamesType;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_group", nullable = false)
    private AgeGroup ageGroup;

    @Column(name = "pin_number", nullable = false)
    private Integer pinNumber;

    @Column(name = "task_number", nullable = false)
    private Integer taskNumber;

    @Column(name = "content_json", columnDefinition = "TEXT", nullable = false)
    private String contentJson;

    public Exercise() {
    }

    public Long getId() {
        return id;
    }

    public Games getGames() {
        return games;
    }

    public void setGames(Games games) {
        this.games = games;
    }

    public GamesType getGamesType() {
        return gamesType;
    }

    public void setGamesType(GamesType gamesType) {
        this.gamesType = gamesType;
    }

    public AgeGroup getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(AgeGroup ageGroup) {
        this.ageGroup = ageGroup;
    }

    public Integer getPinNumber() {
        return pinNumber;
    }

    public void setPinNumber(Integer pinNumber) {
        this.pinNumber = pinNumber;
    }

    public Integer getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(Integer taskNumber) {
        this.taskNumber = taskNumber;
    }

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }
}